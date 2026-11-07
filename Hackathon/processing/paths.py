"""Single place for project paths. Override the data folder with the HACKATHON_DATA_DIR env variable."""
import os
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = Path(os.environ.get("HACKATHON_DATA_DIR", PROJECT_ROOT / "data"))

RAW_DIR = DATA_DIR / "example_raw"      # synthetic now; point at real API dumps later
STAGING_DIR = DATA_DIR / "staging"      # generated: cleaned JSON, common schema
TEXT_DIR = DATA_DIR / "text"            # generated: plain text for vectorisation

ROLES_PATH = DATA_DIR / "dicts" / "roles.json"        # {author_id: role}
ALIASES_PATH = DATA_DIR / "dicts" / "aliases.json"    # {email address or display name: author_id}
