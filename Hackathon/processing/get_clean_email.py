"""Clean a raw plain-text email into the SAME message schema as the Teams cleaner.

Emails carry no user id, so identity is resolved through data/dicts/aliases.json
({email address or display name: author_id}) and the role is then looked up BY author_id,
exactly like Teams. Unknown sender -> author_id None, role "Unknown".
"""

import json
import os
import re
from datetime import datetime, timezone
from email.utils import parseaddr, parsedate_to_datetime


def load_aliases(path) -> dict:
    """{alias (lower-cased): author_id}. Missing file -> no aliases."""
    if not path or not os.path.exists(path):
        return {}
    with open(path, encoding="utf-8") as f:
        return {k.strip().lower(): v for k, v in json.load(f).items()}


def split_headers(raw: str) -> tuple[dict, str]:
    """Headers (folded lines supported, names lower-cased) and body, split at the first blank line."""
    head, _, body = raw.replace("\r\n", "\n").partition("\n\n")
    headers, last = {}, None
    for line in head.split("\n"):
        if line[:1] in (" ", "\t") and last:
            headers[last] += " " + line.strip()
        elif ":" in line:
            last, _, value = line.partition(":")
            last = last.strip().lower()
            headers[last] = value.strip()
    return headers, body


def parse_date(value: str | None) -> tuple[str | None, str]:
    """-> (ISO UTC string like Graph's, basis). No/invalid Date header -> (None, 'missing')."""
    if not value:
        return None, "missing"
    dt, basis = None, "stated"
    try:
        dt = parsedate_to_datetime(value)
    except (TypeError, ValueError):
        try:
            dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError:
            return None, "missing"
    if dt.tzinfo is None:                       # no timezone given: assume UTC and say so
        dt, basis = dt.replace(tzinfo=timezone.utc), "stated_no_timezone_assumed_utc"
    return dt.astimezone(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z"), basis


def clean_body(body: str) -> str:
    body = "\n".join(line.rstrip() for line in body.split("\n"))
    return re.sub(r"\n{3,}", "\n\n", body).strip()


def transform_email(raw: str, roles: dict | None = None, aliases: dict | None = None,
                    source_name: str | None = None) -> dict:
    roles, aliases = roles or {}, aliases or {}
    headers, body = split_headers(raw)
    raw_from = headers.get("from", "")
    if "@" in raw_from:
        name, addr = parseaddr(raw_from)
    else:                                       # bare display name ("Erkki Expert"): parseaddr would mangle it
        name, addr = raw_from.strip(), ""
    name = name or addr or "Unknown"
    author_id = aliases.get(addr.lower()) or aliases.get(name.lower())
    dt, basis = parse_date(headers.get("date"))
    stem = os.path.splitext(source_name)[0] if source_name else "email"
    text = clean_body(body)
    skipped = {"empty": 0}
    messages = []
    if text:
        messages.append({
            "seq": 1,
            "msg_id": headers.get("message-id", "").strip("<>") or stem,
            "reply_to_id": None,
            "datetime": dt,
            "datetime_basis": basis,
            "author": name,
            "author_id": author_id,
            "author_type": "user",
            "role": roles.get(author_id, "Unknown"),
            "subject": headers.get("subject") or None,
            "text": text,
            "importance": "normal",
            "web_url": None,
        })
    else:
        skipped["empty"] = 1
    return {
        "channel": "email",
        "note": "Transformed from a plain-text email" + (f" ({source_name})" if source_name else ""),
        "source": {"file": source_name},
        "participants": [{"name": name, "role": roles.get(author_id, "Unknown"),
                          "user_id": author_id, "type": "user"}],
        "messages": messages,
        "skipped": skipped,
    }


def get_clean_email_json(src: str, roles: dict, aliases: dict) -> dict:
    with open(src, encoding="utf-8") as f:
        raw = f.read()
    return transform_email(raw, roles, aliases, os.path.basename(src))
