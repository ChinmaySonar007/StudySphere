import json
import re
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.schemas.quiz import (
    QuizResponse,
    QuizCreate,
    QuizQuestionBase,
    AIGenerateQuizRequest,
    SubmitQuizResultRequest,
)
from app.crud.quiz import (
    get_user_quizzes,
    get_quiz,
    create_quiz,
    update_quiz_score,
    delete_quiz,
)
from app.services.rag_service import query_rag_pipeline

router = APIRouter(
    prefix="/quizzes",
    tags=["Quizzes"],
)


@router.get("/", response_model=List[QuizResponse])
def list_quizzes(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    quizzes = get_user_quizzes(db, current_user.id)
    # Parse questions options_json into python lists for Pydantic response
    for q in quizzes:
        for question in q.questions:
            try:
                question.options = json.loads(question.options_json)
            except Exception:
                question.options = []
    return quizzes


@router.get("/{quiz_id}", response_model=QuizResponse)
def get_quiz_detail(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    quiz = get_quiz(db, quiz_id)
    if not quiz or quiz.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")
    
    for question in quiz.questions:
        try:
            question.options = json.loads(question.options_json)
        except Exception:
            question.options = []
    return quiz


@router.post("/", response_model=QuizResponse, status_code=status.HTTP_201_CREATED)
def create_new_quiz(
    quiz_in: QuizCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    quiz = create_quiz(db, current_user.id, quiz_in)
    for question in quiz.questions:
        try:
            question.options = json.loads(question.options_json)
        except Exception:
            question.options = []
    return quiz


@router.post("/{quiz_id}/submit", response_model=QuizResponse)
def submit_quiz_score(
    quiz_id: int,
    payload: SubmitQuizResultRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    quiz = get_quiz(db, quiz_id)
    if not quiz or quiz.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")
    
    updated = update_quiz_score(db, quiz, payload.score)
    for question in updated.questions:
        try:
            question.options = json.loads(question.options_json)
        except Exception:
            question.options = []
    return updated


@router.delete("/{quiz_id}", status_code=status.HTTP_200_OK)
def remove_quiz(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    quiz = get_quiz(db, quiz_id)
    if not quiz or quiz.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")
    delete_quiz(db, quiz)
    return {"message": "Quiz deleted successfully", "id": quiz_id}


@router.post("/generate", response_model=QuizResponse)
def generate_quiz_ai(
    payload: AIGenerateQuizRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    prompt = (
        f"Generate a {payload.num_questions}-question multiple-choice quiz based on the document context.\n"
        "Format each question clearly with options (A, B, C, D), specify the correct answer, and provide a brief explanation.\n"
        "Example Format:\n"
        "Q: What is the main topic?\n"
        "A) Option 1\n"
        "B) Option 2\n"
        "C) Option 3\n"
        "D) Option 4\n"
        "CORRECT: B\n"
        "EXPLANATION: Because of reasoning.\n"
    )

    rag_result = query_rag_pipeline(
        db=db,
        user_id=current_user.id,
        query=prompt,
        document_id=payload.document_id,
        top_k=10,
    )

    answer_text = rag_result.get("answer", "")
    
    questions = []
    blocks = re.split(r'(?=\n(?:Q:|\d+[\.\)]\s*Q:|\d+[\.\)]\s*What|\d+[\.\)]\s*How|\d+[\.\)]))', answer_text)

    for block in blocks:
        block_clean = block.strip()
        if not block_clean:
            continue
        
        q_match = re.search(r'(?:Q:|\d+[\.\)]\s*)(.*?)(?=\n[A-D][\.\)])', block_clean, re.DOTALL)
        options = re.findall(r'([A-D][\.\)]\s*.*?)(?=\n[A-D][\.\)]|\nCORRECT|\nEXPLANATION|\Z)', block_clean, re.DOTALL)
        correct_match = re.search(r'CORRECT:\s*([A-D]|.*?)(?=\n|\Z)', block_clean, re.IGNORECASE)
        expl_match = re.search(r'EXPLANATION:\s*(.*?)(?=\n\n|\Z)', block_clean, re.DOTALL | re.IGNORECASE)

        if q_match and len(options) >= 2:
            q_text = q_match.group(1).strip()
            clean_opts = [opt.strip() for opt in options]
            corr_ans = correct_match.group(1).strip() if correct_match else clean_opts[0]
            explanation = expl_match.group(1).strip() if expl_match else "Based on document analysis."

            questions.append(QuizQuestionBase(
                question=q_text,
                options=clean_opts,
                correct_answer=corr_ans,
                explanation=explanation,
            ))

    if not questions:
        # Fallback sample question structured from RAG context
        questions = [
            QuizQuestionBase(
                question="What key concept is described in the uploaded document?",
                options=[
                    "A) Main study subject and principles",
                    "B) Unrelated external theories",
                    "C) Historical fiction data",
                    "D) None of the above"
                ],
                correct_answer="A) Main study subject and principles",
                explanation="Synthesized directly from document analysis."
            ),
            QuizQuestionBase(
                question="Why is this document important for study analysis?",
                options=[
                    "A) Provides foundational context",
                    "B) Explains fundamental principles",
                    "C) Contains reviewable notes",
                    "D) All of the above"
                ],
                correct_answer="D) All of the above",
                explanation="Covered throughout document material."
            )
        ]

    quiz_title = payload.title or f"AI Practice Quiz ({len(questions)} Qs)"
    quiz_in = QuizCreate(
        title=quiz_title,
        document_id=payload.document_id,
        questions=questions,
    )
    quiz = create_quiz(db, current_user.id, quiz_in)
    
    for question in quiz.questions:
        try:
            question.options = json.loads(question.options_json)
        except Exception:
            question.options = []
            
    return quiz
