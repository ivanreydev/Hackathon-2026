"""Clean a raw Microsoft Graph channel export into the common message schema.

Per message:
msg_id         Graph message id (join key back to the source; lets situations cite messages)
reply_to_id    parent message id, null for top-level
seq            1-based order by creation time (stable across re-runs of the same input)
datetime       createdDateTime, as sent by Graph (ISO 8601, UTC)
author         display name
author_id      Azure AD id
author_type    user|application
role           from the roles lookup BY author_id, else "Unknown"
text           plain text (HTML converted, emoji kept)
importance     normal|high|urgent
web_url        deep link to the message in Teams (provenance)
"""
from __future__ import annotations

import csv
import html
import json
import os
import re

# ---------- helpers ----------

def html_to_text(content: str) -> str:
    s = content or ""
    s = re.sub(r'<emoji\b[^>]*\balt="([^"]*)"[^>]*>(?:</emoji>)?', r"\1", s, flags=re.I)  # Teams emoji tags
    s = re.sub(r"<br\s*/?>|</p>|</div>|</li>|</tr>", "\n", s, flags=re.I)
    s = re.sub(r"<[^>]+>", "", s)                       # <at>, <attachment>, <img>, ...
    s = html.unescape(s).replace("\xa0", " ")
    s = "\n".join(line.rstrip() for line in s.split("\n"))
    return re.sub(r"\n{3,}", "\n\n", s).strip()


ID_KEYS = ("author_id", "user_id", "id")


def load_roles(path: str | None) -> dict:
    if not path:
        return {}

    def pick(row: dict):
        key = next((k for k in ID_KEYS if row.get(k)), None)
        if key is None or not row.get("role"):
            raise ValueError(f"roles entry needs one of {ID_KEYS} and a 'role': {row}")
        return row[key], row["role"]

    if path.lower().endswith(".csv"):
        with open(path, encoding="utf-8") as f:
            return dict(pick(r) for r in csv.DictReader(f))
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    if isinstance(data, dict) and "participants" in data:
        data = data["participants"]
    if isinstance(data, list):
        return dict(pick(r) for r in data)
    if isinstance(data, dict):
        return {k: (v["role"] if isinstance(v, dict) else v) for k, v in data.items()}
    raise ValueError("roles file must be a CSV, an {author_id: role} JSON, or a list of entries")


def _user(identity: dict | None) -> dict:
    """Graph identitySet -> (name, id, type)."""
    identity = identity or {}
    for kind in ("user", "application", "device"):
        who = identity.get(kind)
        if who:
            return {"name": who.get("displayName") or "Unknown", "id": who.get("id"),
                    "type": "user" if kind == "user" else kind}
    return {"name": "Unknown", "id": None, "type": "unknown"}


def _messages_of(ms_graph) -> list:
    """Accept a Graph response object, a list of messages, or a list of response pages."""
    if isinstance(ms_graph, dict):
        return list(ms_graph.get("value", []))
    if isinstance(ms_graph, list):
        msgs = []
        for item in ms_graph:
            msgs.extend(item.get("value", [item]) if isinstance(item, dict) and "value" in item else [item])
        return msgs
    raise ValueError("unrecognised input: expected object with 'value' or a list")


# ---------- main transform ----------

def transform(ms_graph, roles: dict | None = None, source_name: str | None = None) -> dict:
    roles = roles or {}
    kept, skipped = [], {"non_message": 0, "deleted": 0, "empty": 0, "duplicate": 0}
    seen = set()
    for m in _messages_of(ms_graph):
        if m.get("id") in seen:
            skipped["duplicate"] += 1
            continue
        seen.add(m.get("id"))
        if m.get("messageType") != "message":
            skipped["non_message"] += 1
            continue
        if m.get("deletedDateTime"):
            skipped["deleted"] += 1
            continue
        body = m.get("body") or {}
        text = html_to_text(body.get("content", "")) if body.get("contentType") == "html" \
            else (body.get("content") or "").strip()
        if not text:
            skipped["empty"] += 1
            continue
        kept.append((m, text))

    kept.sort(key=lambda t: (t[0]["createdDateTime"], t[0]["id"]))

    messages, authors, channel = [], {}, {}
    for seq, (m, text) in enumerate(kept, 1):
        who = _user(m.get("from"))
        authors.setdefault(who["id"] or who["name"], who)       # key by id: same display name can be two people
        channel = channel or (m.get("channelIdentity") or {})
        messages.append({
            "seq": seq,
            "msg_id": m["id"],
            "reply_to_id": m.get("replyToId"),
            "datetime": m["createdDateTime"],
            "author": who["name"],
            "author_id": who["id"],
            "author_type": who["type"],
            "role": roles.get(who["id"], "Unknown"),
            "text": text,
            "importance": m.get("importance") or "normal",
            "web_url": m.get("webUrl"),
        })

    return {
        "channel": "teams",
        "note": "Transformed from Microsoft Graph channel messages"
                + (f" ({source_name})" if source_name else "")
                + ". Datetimes are UTC as sent by Graph.",
        "source": {"team_id": channel.get("teamId"), "channel_id": channel.get("channelId")},
        "participants": [{"name": a["name"], "role": roles.get(a["id"], "Unknown"), "user_id": a["id"], "type": a["type"]}
                         for a in authors.values()],
        "messages": messages,
        "skipped": skipped,
    }


def get_clean_chat_json(src: str, roles: dict) -> dict:
    with open(src, encoding="utf-8") as f:
        ms_graph = json.load(f)
    out = transform(ms_graph, roles, os.path.basename(src))
    return out
