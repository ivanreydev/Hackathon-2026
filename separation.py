"""Split the chat + email exports into situations and store them for ingest_fixed.ipynb.

Lives in <project>/processing/. Writes exactly what the notebook reads:
    <project>/processing/demo2_situations.db   table `situations`, vector NULL (= pending)
    <project>/situation_texts/<key>.txt        the text of situation <key>
Then run the notebook from <project> and its vectorize cell picks the new rows up.
"""
import os
import re
import json
import sqlite3
from pathlib import Path
from datetime import datetime, timezone

# The whole export goes to Gemini in one call, so the 30 s default is too short.
# Set before importing gemini, which reads it at import time.
os.environ.setdefault("GEMINI_TIMEOUT", "300")
from gemini import ask_gemini


# Paths. HACKATHON_ROOT overrides the project folder (the folder the notebook runs from).
PROJECT_ROOT = Path(os.environ.get("HACKATHON_ROOT", Path(__file__).resolve().parents[1]))
DATA_DIR = Path(os.environ.get("HACKATHON_DATA_DIR", PROJECT_ROOT / "data" / "text"))
EMAILS_PATH = DATA_DIR / "email" / "emails.txt"
CHATS_PATH = DATA_DIR / "microsoft_teams" / "chat_export.txt"

DB_PATH = PROJECT_ROOT / "processing" / "demo2_situations.db"   # notebook: db_path
TEXT_DIR = PROJECT_ROOT / "situation_texts"                       # notebook: TEXT_DIR

DEFAULT_DTTM = "2026-11-07T12:00:00Z"   # used when a situation has no usable date


# Helpers
def to_iso(dttm):
    """Model timestamp -> ISO 8601 in UTC (naive times are taken as UTC).
    Missing or unparseable dates fall back to DEFAULT_DTTM."""
    if not isinstance(dttm, str) or not dttm.strip() or dttm.strip().lower() == "no date":
        dttm = DEFAULT_DTTM
    try:
        dt_obj = datetime.fromisoformat(dttm.strip().replace("Z", "+00:00"))
    except ValueError:
        print(f"Unparseable timestamp {dttm!r}; using the default")
        dt_obj = datetime.fromisoformat(DEFAULT_DTTM.replace("Z", "+00:00"))
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


def parse_situations(raw):
    """Model reply -> list of {"timestamp", "text"} dicts.
    Tolerates ```json fences and a wrapper object like {"situations": [...]}."""
    raw = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw.strip())
    data = json.loads(raw)
    if isinstance(data, dict):
        data = next((v for v in data.values() if isinstance(v, list)), [data])
    return [d for d in data if isinstance(d, dict)]


# LLM processing
def separation_and_censorship(text):
    prompt = f"""
Read attachment 1 and split it into separate situations.
* a situation is usually one network issue and its solution, or the attempts to solve it
* the last situation is likely incomplete; still return it
* situations may overlap, but keep separate issues as separate situations

At the same time
* censor personal or sensitive information (people's names, emails, phone numbers)
* keep locations, cell tower / site names and codes, equipment and technical details:
  the next step uses them
* remove information that is certainly irrelevant for future operations

Return a JSON array with one object per situation:
[{{"timestamp": "<when the situation started, ISO 8601, e.g. 2026-11-07T09:30:00Z>", "text": "<the situation>"}}]
If a situation has no discernible date, use "no date" as its timestamp.
Return only the JSON array.

--- attachment 1 ---
{text}
--- end of attachment 1 ---
"""
    return parse_situations(ask_gemini(prompt, json_output=True))


# Main
if __name__ == "__main__":
    chats_text = CHATS_PATH.read_text(encoding="utf-8")
    email_text = EMAILS_PATH.read_text(encoding="utf-8")

    # Ask the model first, so a failed call leaves the database untouched
    result = separation_and_censorship("\n\n".join([chats_text, email_text]))

    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    TEXT_DIR.mkdir(parents=True, exist_ok=True)

    # Same schema as the notebook's Situations class
    conn = sqlite3.connect(DB_PATH)
    try:
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

        added = 0
        for item in result:
            text = str(item.get("text") or "").strip()
            if not text:
                continue

            # SQLite assigns the key; the vector stays NULL so the notebook vectorizes it
            cur = conn.execute(
                "INSERT INTO situations (timestamp, vector) VALUES (?, NULL)",
                (to_iso(item.get("timestamp")),),
            )
            key = cur.lastrowid

            # write <key>.txt, and only then commit, so a visible row always has its text
            write_text(key, text)
            conn.commit()
            added += 1
    finally:
        conn.close()

    print(f"Added {added} situation(s) to {DB_PATH}; texts in {TEXT_DIR}")
