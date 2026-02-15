
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import testplan

app = FastAPI(title="Intelligent Test Plan Agent")

# CORS for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(testplan.router, prefix="/api/testplan", tags=["testplan"])

@app.get("/")
def read_root():
    return {"status": "Agent Active"}
