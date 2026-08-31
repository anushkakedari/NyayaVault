from fastapi import FastAPI

app = FastAPI(
    title="NyayaVault API",
    description="Secure Digital Evidence & Legal Document Management System",
    version="1.0.0"
)


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "NyayaVault API"
    }