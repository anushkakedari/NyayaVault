from fastapi import FastAPI

from app.auth.router import router as auth_router
from app.documents.router import router as documents_router

from app.db.database import Base, engine
from app.db import models

from app.cases.router import router as cases_router


app = FastAPI()


Base.metadata.create_all(bind=engine)


app.include_router(auth_router)
app.include_router(documents_router)
app.include_router(cases_router)


@app.get("/health")
def health():
    return {"status": "ok"}