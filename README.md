# Hackathon-2026
Team: A-stars
Emilia Luoma 
Louise Remmer
Ivar Boström
Egor But-Gusaim
Ivan Reynoso

# Company Challenge: Elisa Company Challenge
Capturing and Linking Human-Generated Contextual Metadata for Autonomous Network Operations

# Structure
```
├── app.yaml         # Databricks App definition
├── deploy.sh        # build + deploy (APP_NAME, WORKSPACE_PATH env vars)
├── client/          # React (Vite) frontend; build.sh -> client/build
└── server/          # FastAPI app; serves /api and client/build
```

# Run locally
- Frontend (with mocks): `cd client && npm install && npm run dev`
- Backend: `pip install -r server/requirements.txt && uvicorn server.app:app --reload --port 8000`
- Full app: `./client/build.sh`, then open http://localhost:8000
