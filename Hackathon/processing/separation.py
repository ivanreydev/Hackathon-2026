import os
import json
import sqlite3
from pathlib import Path
from server.gemini import ask_gemini
from datetime import datetime


# Sources
PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = Path(os.environ.get("HACKATHON_DATA_DIR", PROJECT_ROOT / "data" / "text"))
EMAILS_PATH = DATA_DIR / "email" / "emails.txt"
CHATS_PATH = DATA_DIR / "microsoft_teams" / "chat_export.txt"

chats_text = open(CHATS_PATH, "r").read()
email_text = open(EMAILS_PATH, "r").read()


# Target
out_dir = Path(Path(os.environ.get("HACKATHON_DATA_DIR", PROJECT_ROOT / "data" / "situations")))
out_dir.mkdir(parents=True, exist_ok=True)


# Database connection
conn = sqlite3.connect("../demo_situations.db")
cursor = conn.cursor()
cursor.execute(
"""
CREATE TABLE IF NOT EXISTS demo_situations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ts INTEGER,
    text TEXT
)
"""
)


# Helper
def dttm_to_ts(dttm_str):
    dt_obj = datetime.fromisoformat(dttm_str.replace("Z", "+00:00"))
    int_timestamp = int(dt_obj.timestamp())
    return int_timestamp


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

for i in range(len(result)):
    item = result[i]
    dttm = item.get("timestamp", "")
    text = item.get("text", "").strip()
    if not text or not dttm:
        continue
    ts = dttm_to_ts(dttm)

    # create {i}.txt files
    file_path = out_dir / f"{i}.txt"
    file_path.write_text(text, encoding="utf-8")

    # insert ({i}, {ts}, {text}) rows into the database
    cursor.execute("""INSERT INTO demo_situations (id, ts, text) VALUES (?, ?, ?)""", (i, ts, text))


# Close database connection
conn.commit()
conn.close()
