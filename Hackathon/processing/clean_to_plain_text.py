"""Render a cleaned chat/email dict (common schema) as plain text for vectorisation.

Default layout, one block per message, blank line between blocks:

    [chat_export#3 | 2026-11-07T09:16:00.001Z] Veikko Vikkelä (Network Engineer):
    Yes, installed around 2019 I think.

* the ref (file stem + seq) lets a situation point back to its messages; drop it with with_refs=False
* names, ids and urls are NOT in the text by default; ask for more with extra_fields=("importance", "web_url")
"""


def render_message(msg: dict, ref_prefix: str, with_refs: bool = True, extra_fields: tuple = ()) -> str:
    when = msg.get("datetime") or "no date"
    ref = msg.get("ref") or f"{ref_prefix}#{msg['seq']}"      # merged documents carry their own per-message ref
    tag = f"{ref} | {when}" if with_refs else when
    lines = [f"[{tag}] {msg.get('role') or 'Unknown'}:"]
    if msg.get("subject"):
        lines.append(f"Subject: {msg['subject']}")
    lines.append(msg.get("text", ""))
    for field in extra_fields:
        if msg.get(field) not in (None, ""):
            lines.append(f"{field}: {msg[field]}")
    return "\n".join(lines)


def to_plain_text(clean: dict, ref_prefix: str, with_refs: bool = True, extra_fields: tuple = ()) -> str:
    blocks = [render_message(m, ref_prefix, with_refs, extra_fields) for m in clean["messages"]]
    return "\n\n".join(blocks) + ("\n" if blocks else "")


def merge_clean(cleans: list) -> dict:
    """Merge several cleaned dicts [(file_stem, clean), ...] into one common-schema dict.

    Messages are ordered by datetime (undated ones last, then by file name) and each gets a `ref`
    ("<file_stem>#<seq>") so it can still be traced back to its own file.
    """
    messages, people, skipped = [], {}, {}
    for stem, clean in cleans:
        for m in clean["messages"]:
            messages.append({**m, "ref": f"{stem}#{m['seq']}", "source_file": stem})
        for p in clean.get("participants", []):
            people.setdefault(p.get("user_id") or p["name"], p)
        for k, v in clean.get("skipped", {}).items():
            skipped[k] = skipped.get(k, 0) + v
    messages.sort(key=lambda m: (m.get("datetime") is None, m.get("datetime") or "", m["source_file"], m["seq"]))
    channel = cleans[0][1]["channel"] if cleans else None
    return {"channel": channel, "note": f"{len(cleans)} files merged", "participants": list(people.values()),
            "messages": messages, "skipped": skipped}
