"""FastAPI app: serves the /api routes and the built React app from client/build."""

from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

BUILD_DIR = Path(__file__).resolve().parent.parent / "client" / "build"

app = FastAPI(title="Hackathon 2026")


# --- API ---------------------------------------------------------------------
# Shapes are defined in client/src/api/types.js. Send raw values only:
# `distance` (from the vector index, lower = closer) and `timestamp` (ISO).
# The frontend turns them into 0..1 relevancy/recency/score itself.


@app.get("/api/health")
def health():
    return {"status": "ok"}


def _not_implemented():
    raise HTTPException(status_code=501, detail="Not implemented yet")


@app.post("/api/situations/search")
def search_situations(body: dict):
    """In:  {"description": str, "entity"?: str, "at"?: ISO str, "limit"?: int}
    Out: [{"id", "summary", "status", "distance", "timestamp", "categories", "entities", "why"}, ...]
         a plain list, best match first."""
    _not_implemented()


@app.get("/api/situations/{situation_id}")
def get_situation(situation_id: str):
    _not_implemented()


@app.get("/api/sources/{key}")
def get_source(key: str):
    _not_implemented()


@app.get("/api/categories")
def get_categories():
    _not_implemented()


@app.post("/api/ingest")
def ingest(body: dict):
    _not_implemented()


# --- Frontend ----------------------------------------------------------------

if (BUILD_DIR / "assets").is_dir():
    app.mount("/assets", StaticFiles(directory=BUILD_DIR / "assets"), name="assets")


@app.get("/{path:path}", include_in_schema=False)
def frontend(path: str):
    if path.startswith("api/"):
        raise HTTPException(status_code=404)
    # Serve real files (favicon.svg, icons.svg, ...) and fall back to index.html.
    file = (BUILD_DIR / path).resolve()
    if path and file.is_file() and BUILD_DIR in file.parents:
        return FileResponse(file)
    index = BUILD_DIR / "index.html"
    if not index.is_file():
        raise HTTPException(status_code=503, detail="Frontend not built. Run client/build.sh")
    return FileResponse(index)
