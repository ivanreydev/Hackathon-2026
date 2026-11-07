import json
from pathlib import Path
from get_clean_microsoft_teams_chat import get_clean_chat_json

BASE = Path(__file__).resolve().parents[2]
src_path = BASE / "Hackathon" / "data" / "example_raw" / "microsoft_teams" / "chat_export.json"
roles_path = BASE / "Hackathon" / "data" / "dicts" / "roles.json"

with src_path.open("r", encoding="utf-8") as f:
    src = json.load(f)

with roles_path.open("r", encoding="utf-8") as f:
    roles = json.load(f)

clean_chat = get_clean_chat_json(str(src_path), roles)

res = ""
for message in clean_chat['messages']:
    m = [
        message.get('datetime', ''),
        message.get('author', ''),
        message.get('role', ''),
        message.get('text', ''),
        message.get('importance', ''),
        message.get('web_url', '')
    ]
    res += "\n".join(m) + "\n\n"

print(res)