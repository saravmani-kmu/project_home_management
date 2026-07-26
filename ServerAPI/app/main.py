from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from app.config import settings
from app.routers import auth, family_members, tasks

app = FastAPI(title="Home Management API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(SessionMiddleware, secret_key=settings.jwt_secret)

app.include_router(auth.router)
app.include_router(family_members.router)
app.include_router(tasks.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
