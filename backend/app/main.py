from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.core.database import Base, engine

# Ensure tables are created in the database
Base.metadata.create_all(bind=engine)

from app.api.routes.auth import router as auth_router
from app.api.routes.users import router as users_router
from app.api.routes.documents import router as document_router
from app.api.routes.notes import router as notes_router
from app.api.routes.flashcards import router as flashcards_router
from app.api.routes.quizzes import router as quizzes_router
from app.api.routes.mindmaps import router as mindmaps_router


app = FastAPI(
    title="StudySphere AI API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logging.error(f"Global exception caught: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
        headers={"Access-Control-Allow-Origin": "*"},
    )


app.include_router(document_router)
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(notes_router)
app.include_router(flashcards_router)
app.include_router(quizzes_router)
app.include_router(mindmaps_router)



@app.get("/")
def root():
    return {
        "message": "StudySphere AI Backend Running 🚀"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }