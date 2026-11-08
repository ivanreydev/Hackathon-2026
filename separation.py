import os
import json
import sqlite3
from pathlib import Path
from datetime import datetime, timezone
from gemini import ask_gemini


# Sources
PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = Path(os.environ.get("HACKATHON_DATA_DIR", PROJECT_ROOT / "data" / "text"))
EMAILS_PATH = DATA_DIR / "email" / "emails.txt"
CHATS_PATH = DATA_DIR / "microsoft_teams" / "chat_export.txt"

chats_text = open(CHATS_PATH, "r", encoding="utf-8").read()
email_text = open(EMAILS_PATH, "r", encoding="utf-8").read()


# Target: the layout the vectorizing notebook reads.
#   - table `situations`, key = SQLite's own AUTOINCREMENT id, vector NULL until vectorized
#   - the text of situation <key> in <TEXT_DIR>/<key>.txt
# Both paths are relative, like the notebook's, so run both from the same folder
# (or make these absolute and match them there).
DB_PATH = "demo2_situations.db"
TEXT_DIR = Path("situation_texts")          # must equal TEXT_DIR in the notebook
TEXT_DIR.mkdir(parents=True, exist_ok=True)


# Database connection
conn = sqlite3.connect(DB_PATH)
conn.execute(
    """
    CREATE TABLE IF NOT EXISTS situations (
        id        INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,   -- ISO 8601, UTC
        vector    BLOB             -- NULL until vectorized; dim * itemsize raw bytes
    )
    """
)
conn.commit()


# Helpers
DEFAULT_DTTM = "2026-11-07T12:00:00.000Z"


def dttm_to_iso(dttm_str):
    """Any ISO 8601 string -> ISO 8601 in UTC (naive times are taken as UTC)."""
    dt_obj = datetime.fromisoformat(dttm_str.replace("Z", "+00:00"))
    if dt_obj.tzinfo is None:
        dt_obj = dt_obj.replace(tzinfo=timezone.utc)
    return dt_obj.astimezone(timezone.utc).isoformat()


def write_text(key, text):
    """Same as the notebook's save_text: atomic, so no half-written text files."""
    path = TEXT_DIR / f"{key}.txt"
    tmp = path.with_name(path.name + ".tmp")
    with open(tmp, "w", encoding="utf-8", newline="") as f:
        f.write(text)
    os.replace(tmp, path)


# LLM processing
def separation_and_censorship(text):
    prompt = f"""
    Read Attachement 1 and split it into different situations
    * situations generally consist of one problem and solution or attempts to solve it
    * coverage of the last situation is likely incomplete, you should still return it
    * each situation is related to a specific network issue
    * situations may overlap, but do not merge them into one so often

    At the same time
    * censor any personal or sensitive information
    * remove information that is certainly irrelevant for future operations

    Return the response in JSON format, where each situation has its timestamp and text.
    <"timestamp": "timestamp_value"; "text": "text_value">
    The response should not contain any additional symbols, so it can be parsed as JSON.

    --- Attachment 1 ---
    {text}
    --- End of attachment 1 ---
    """

    data = json.loads(ask_gemini(prompt))

    return data


# Main
source_texts = [chats_text, email_text]
result = separation_and_censorship("\n\n".join(source_texts))

added = 0
for item in result:
    dttm = item.get("timestamp", "")
    text = item.get("text", "").strip()
    if dttm == "no date":
        dttm = DEFAULT_DTTM
    if not text or not dttm:
        continue
    try:
        timestamp = dttm_to_iso(dttm)
    except ValueError:
        print(f"Unparseable timestamp {dttm!r}; using the default")
        timestamp = dttm_to_iso(DEFAULT_DTTM)

    # SQLite assigns the key; the vector stays NULL so the vectorizer picks it up
    cur = conn.execute(
        "INSERT INTO situations (timestamp, vector) VALUES (?, NULL)", (timestamp,)
    )
    key = cur.lastrowid

    # create <key>.txt, and only then commit, so a visible row always has its text
    write_text(key, text)
    conn.commit()
    added += 1


# Close database connection
conn.close()
print(f"Added {added} situation(s) to {DB_PATH}")