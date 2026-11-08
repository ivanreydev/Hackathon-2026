import os
import json
import re
import sqlite3
from pathlib import Path
from datetime import datetime, timezone

import requests

from gemini import ask_gemini


# ------------------------------------------------------------------ paths
# This file lives in Hackathon/process/, so parents[1] is the Hackathon folder.
# Everything is anchored there, so it doesn't matter which folder you run this from.
# Override with HACKATHON_ROOT if needed.
PROJECT_ROOT = Path(os.environ.get("HACKATHON_ROOT", Path(__file__).resolve().parents[1]))

# Sources
DATA_DIR = Path(os.environ.get("HACKATHON_DATA_DIR", PROJECT_ROOT / "data" / "text"))
EMAILS_PATH = DATA_DIR / "email" / "emails.txt"
CHATS_PATH = DATA_DIR / "microsoft_teams" / "chat_export.txt"

# Target: must match ingest.ipynb exactly
DB_PATH = PROJECT_ROOT / "processing" / "demo2_situations.db"
TEXT_DIR = PROJECT_ROOT / "situation_texts"

# ingest.ipynb's API; after separating we ask it to vectorize the new rows
API_URL = os.environ.get("SITUATION_API", "http://127.0.0.1:8000")

DB_PATH.parent.mkdir(parents=True, exist_ok=True)
TEXT_DIR.mkdir(parents=True, exist_ok=True)
print(f"DB:    {DB_PATH}")
print(f"Texts: {TEXT_DIR}")

chats_text = CHATS_PATH.read_text(encoding="utf-8")
email_text = EMAILS_PATH.read_text(encoding="utf-8")


# ---------------------------------------------------------------- helpers
DEFAULT_DTTM = "2026-11-07T12:00:00.000Z"


def dttm_to_iso(dttm_str):
    """Any ISO 8601 string -> ISO 8601 in UTC (naive times are taken as UTC)."""
    dt_obj = datetime.fromisoformat(dttm_str.replace("Z", "+00:00"))
    if dt_obj.tzinfo is None:
        dt_obj = dt_obj.replace(tzinfo=timezone.utc)
    return dt_obj.astimezone(timezone.utc).isoformat()


def write_text(key, text):
    """Same as ingest.ipynb's save_text: atomic, so no half-written text files."""
    path = TEXT_DIR / f"{key}.txt"
    tmp = path.with_name(path.name + ".tmp")
    with open(tmp, "w", encoding="utf-8", newline="") as f:
        f.write(text)
    os.replace(tmp, path)


def _strip_fences(raw):
    return re.sub(r"^```(?:json)?\s*|\s*```$", "", raw.strip())


# ---------------------------------------------------------- LLM processing
def separation_and_censorship(text):
    prompt = f"""
    Read Attachment 1 and split it into different situations
    * situations generally consist of one problem and solution or attempts to solve it
    * coverage of the last situation is likely incomplete, you should still return it
    * each situation is related to a specific network issue
    * situations may overlap, but do not merge them into one so often

    At the same time
    * censor any personal or sensitive information
    * remove information that is certainly irrelevant for future operations
    * do NOT censor network details: keep cell tower / site codes and names, cell IDs,
      coordinates, place names, equipment and error codes exactly as written
    * use the time the situation started as its timestamp, in ISO 8601 format

    Return a JSON array of objects, one per situation:
    [{{"timestamp": "<ISO 8601 timestamp, or \\"no date\\">", "text": "<situation text>"}}]

    --- Attachment 1 ---
    {text}
    --- End of attachment 1 ---
    """

    data = json.loads(_strip_fences(ask_gemini(prompt, json_output=True, temperature=0)))
    if isinstance(data, dict):                    # tolerate {"situations": [...]}
        data = next((v for v in data.values() if isinstance(v, list)), [])
    return data


# -------------------------------------------------------------------- main
result = separation_and_censorship("\n\n".join([chats_text, email_text]))

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

added = 0
try:
    for item in result:
        dttm = str(item.get("timestamp") or "").strip()
        text = str(item.get("text") or "").strip()
        if not text:
            continue
        if not dttm or dttm.lower() == "no date":
            dttm = DEFAULT_DTTM
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
finally:
    conn.close()      # release the DB even if a row fails

print(f"Added {added} situation(s) to {DB_PATH}")


# --------------------------------------------- tell ingest.ipynb to vectorize
if added:
    try:
        resp = requests.post(f"{API_URL}/vectorize", timeout=600)
        resp.raise_for_status()
        print(f"Vectorized {resp.json()['vectorized']} situation(s) via {API_URL}")
    except requests.RequestException as e:
        print(f"Couldn't reach the ingest.ipynb API ({e}).")
        print("Run `vectorize_situations(situations, store)` in ingest.ipynb instead.")
