from fastapi import FastAPI

from app.auth.router import router as auth_router
from app.db.database import Base, engine
from app.db import models


app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(auth_router)


@app.get("/health")
def health():
    return {"status": "ok"}