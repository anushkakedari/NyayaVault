from sqlalchemy import text
from app.db.database import engine


with engine.begin() as conn:
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS cases (
            id SERIAL PRIMARY KEY,
            case_number VARCHAR(50) UNIQUE NOT NULL,
            title VARCHAR(255) NOT NULL,
            description VARCHAR(1000),
            status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
            created_by INTEGER NOT NULL REFERENCES users(id),
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    """))

    conn.execute(text("""
        ALTER TABLE documents
        ADD COLUMN IF NOT EXISTS case_id INTEGER
        REFERENCES cases(id)
    """))

    conn.execute(text("""
        CREATE INDEX IF NOT EXISTS ix_documents_case_id
        ON documents(case_id)
    """))

print("Database updated successfully")