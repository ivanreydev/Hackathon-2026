"""raw -> staging (clean JSON) -> text (plain text), for every source.

    python -m processing.run_pipeline                      # all sources
    python -m processing.run_pipeline --source email
    python -m processing.run_pipeline --print              # also print the text
    python -m processing.run_pipeline --split              # emails: one text file each instead of one merged file
    python -m processing.run_pipeline --extra-fields importance,web_url --no-refs

Add a new source (e.g. a real API dump) by adding one entry to SOURCES.
"""

import argparse
import json
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Callable

from . import paths
from .get_clean_email import get_clean_email_json, load_aliases
from .get_clean_microsoft_teams_chat import get_clean_chat_json, load_roles
from .clean_to_plain_text import merge_clean, to_plain_text


@dataclass
class Source:
    pattern: str                                  # which raw files belong to it
    clean: Callable[[Path, dict, dict], dict]     # (raw file, roles, aliases) -> common-schema dict
    merge_as: str | None = None                   # if set: ONE text file with this name for the whole source


SOURCES = {
    "microsoft_teams": Source("*.json", lambda p, roles, aliases: get_clean_chat_json(str(p), roles)),
    "email": Source("*.txt", lambda p, roles, aliases: get_clean_email_json(str(p), roles, aliases),
                    merge_as="emails"),
}


def process_source(name: str, raw_dir: Path, staging_dir: Path, text_dir: Path, roles: dict, aliases: dict,
                   with_refs: bool = True, extra_fields: tuple = (), echo: bool = False,
                   split: bool = False) -> tuple[list, list]:
    """Returns (written text files, [(file, error)]). Staging JSON is always one file per raw file;
    the text is ONE merged file when the source has merge_as (unless split=True), else one per raw file."""
    src = SOURCES[name]
    out_json, out_txt = staging_dir / name, text_dir / name
    out_json.mkdir(parents=True, exist_ok=True)
    out_txt.mkdir(parents=True, exist_ok=True)
    for old in out_txt.glob("*.txt"):             # text/ is generated: clear it so reruns never leave stale files
        old.unlink()
    cleans, failed = [], []
    for path in sorted((raw_dir / name).glob(src.pattern)):
        try:
            clean = src.clean(path, roles, aliases)
            (out_json / f"{path.stem}.json").write_text(
                json.dumps(clean, indent=2, ensure_ascii=False), encoding="utf-8")
            unknown = [p["name"] for p in clean["participants"] if p["role"] == "Unknown"]
            print(f"{name}/{path.name}: {len(clean['messages'])} messages, skipped {clean['skipped']}"
                  + (f", NO ROLE for {unknown}" if unknown else ""))
            cleans.append((path.stem, clean))
        except Exception as e:                    # one bad file must not stop the batch
            failed.append((path.name, repr(e)))
            print(f"{name}/{path.name}: FAILED {e!r}", file=sys.stderr)

    written = []
    if src.merge_as and not split:
        if cleans:
            target = out_txt / f"{src.merge_as}.txt"
            text = to_plain_text(merge_clean(cleans), "", with_refs, extra_fields)
            target.write_text(text, encoding="utf-8")
            written.append(target)
            print(f"{name}: merged {len(cleans)} files -> {target.name}")
            if echo:
                print(text)
    else:
        for stem, clean in cleans:
            target = out_txt / f"{stem}.txt"
            text = to_plain_text(clean, stem, with_refs, extra_fields)
            target.write_text(text, encoding="utf-8")
            written.append(target)
            if echo:
                print(text)
    return written, failed


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--source", choices=["all", *SOURCES], default="all")
    ap.add_argument("--data-dir", type=Path, help="override the data folder (default: ./data)")
    ap.add_argument("--print", dest="echo", action="store_true", help="print the plain text too")
    ap.add_argument("--no-refs", action="store_true", help="omit '<file>#<seq>' refs from the text")
    ap.add_argument("--split", action="store_true", help="one text file per raw file even for sources that merge")
    ap.add_argument("--extra-fields", default="", help="comma list, e.g. importance,web_url")
    args = ap.parse_args(argv)

    data = args.data_dir or paths.DATA_DIR
    roles = load_roles(str(data / "dicts" / "roles.json"))
    aliases = load_aliases(data / "dicts" / "aliases.json")
    extra = tuple(f for f in args.extra_fields.split(",") if f)
    failed_total = 0
    for name in (SOURCES if args.source == "all" else [args.source]):
        _, failed = process_source(name, data / "example_raw", data / "staging", data / "text", roles, aliases,
                                   not args.no_refs, extra, args.echo, args.split)
        failed_total += len(failed)
    return 1 if failed_total else 0


if __name__ == "__main__":
    sys.exit(main())
