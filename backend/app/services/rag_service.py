import logging
import os
import re
import json
import urllib.request
import urllib.parse
from sqlalchemy.orm import Session
# pyrefly: ignore [missing-import]
from google import genai

from app.core.config import settings
from app.services.vector_store import get_vectorstore
from app.crud.document import get_document

logger = logging.getLogger(__name__)


def clean_chunk_text(text: str) -> str:
    """Collapses all extra spaces, tabs, and word-by-word newlines into clean readable sentences."""
    if not text:
        return ""
    cleaned = re.sub(r'\s+', ' ', text).strip()
    return cleaned


def call_grok_api(api_key: str, prompt: str) -> str:
    """Calls xAI Grok API (grok-2-latest, grok-beta) via OpenAI-compatible REST endpoint."""
    url = "https://api.x.ai/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
    }
    for model_name in ["grok-2-latest", "grok-beta"]:
        try:
            payload = {
                "model": model_name,
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.3
            }
            data = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(url, data=data, headers=headers, method="POST")
            
            with urllib.request.urlopen(req, timeout=12) as resp:
                result_json = json.loads(resp.read().decode("utf-8"))
                choices = result_json.get("choices", [])
                if choices:
                    content = choices[0].get("message", {}).get("content", "")
                    if content:
                        logger.info(f"Successfully generated answer via Grok API ({model_name})")
                        return content
        except Exception as err:
            logger.warning(f"Grok API call failed for {model_name}: {err}")
    return ""


def call_gemini_api(api_key: str, prompt: str) -> str:
    """
    Executes Gemini API using multiple fallback mechanisms with proper 15-second timeouts:
    1. Direct REST API (with x-goog-api-key header and URL key parameter).
    2. Official google-genai SDK Client.
    """
    # Method 1: Direct REST API with 15 seconds timeout
    for model_name in ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"]:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={urllib.parse.quote(api_key)}"
            headers = {
                "Content-Type": "application/json",
                "x-goog-api-key": api_key,
            }
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": prompt}
                        ]
                    }
                ]
            }
            data = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(url, data=data, headers=headers, method="POST")
            
            with urllib.request.urlopen(req, timeout=15) as resp:
                result_json = json.loads(resp.read().decode("utf-8"))
                candidates = result_json.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts and "text" in parts[0]:
                        logger.info(f"Successfully generated answer via Direct REST ({model_name})")
                        return parts[0]["text"]
        except urllib.error.HTTPError as http_err:
            try:
                err_body = http_err.read().decode("utf-8")
            except Exception:
                err_body = str(http_err)
            logger.warning(f"REST HTTP {http_err.code} ({model_name}): {err_body}")
        except Exception as rest_err:
            logger.warning(f"REST Call failed ({model_name}): {rest_err}")

    # Method 2: Official google-genai SDK
    try:
        client = genai.Client(api_key=api_key)
        for model_name in ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                )
                if response and response.text:
                    logger.info(f"Successfully generated answer via GenAI SDK ({model_name})")
                    return response.text
            except Exception as sdk_err:
                logger.warning(f"GenAI SDK failed ({model_name}): {sdk_err}")
    except Exception as err:
        logger.warning(f"GenAI SDK Client init failed: {err}")

    return ""


def extract_qa_from_sentence(sentence: str) -> tuple[str, str]:
    """Parses a sentence into a natural, grammatically logical question and answer pair."""
    s = sentence.strip()
    s_low = s.lower()

    if "takes place in" in s_low:
        parts = re.split(r'takes place in', s, flags=re.IGNORECASE)
        subject = parts[0].strip()
        location = parts[1].strip()
        return f"Where does {subject.lower()} take place?", f"It takes place in {location}"

    if "occurs when" in s_low or "happens when" in s_low:
        parts = re.split(r'occurs when|happens when', s, flags=re.IGNORECASE)
        process = parts[0].strip()
        condition = parts[1].strip()
        return f"When does {process.lower()} occur?", f"{process} occurs when {condition}"

    if "is defined as" in s_low or "refers to" in s_low:
        parts = re.split(r'is defined as|refers to', s, flags=re.IGNORECASE)
        concept = parts[0].strip()
        definition = parts[1].strip()
        return f"How is {concept.lower()} defined?", f"{concept} is defined as {definition}"

    if "is the process" in s_low:
        parts = re.split(r'is the process', s, flags=re.IGNORECASE)
        concept = parts[0].strip()
        definition = parts[1].strip()
        return f"What is {concept.lower()}?", f"{concept} is the process {definition}"

    clean_prompt = s[:65].rstrip(",. ")
    return f"What key detail is explained regarding: '{clean_prompt}'?", s


def generate_context_driven_response(query: str, target_doc_title: str, passages: list[dict]) -> str:
    """
    Intelligent context-driven fallback responder with NLP sentence parsing.
    Synthesizes passages directly into rich, structured Markdown study responses.
    """
    all_sentences = []
    for passage in passages:
        sents = re.split(r'(?<=[.!?])\s+', passage['text'])
        for s in sents:
            s_clean = s.strip()
            if len(s_clean) > 20 and s_clean not in all_sentences:
                all_sentences.append(s_clean)

    if not all_sentences:
        return f"I searched **{target_doc_title}** for your query: \"{query}\", but could not find matching content."

    q_lower = query.lower()

    # 1. Practice questions / quiz request
    if any(k in q_lower for k in ["question", "quiz", "test", "practice", "exam"]):
        qa_pairs = []
        seen_questions = set()
        
        for s in all_sentences:
            if len(qa_pairs) >= 3:
                break
            q_text, a_text = extract_qa_from_sentence(s)
            if q_text in seen_questions:
                clean_snippet = s[:60].rstrip(",. ")
                q_text = f"What key detail is explained regarding: '{clean_snippet}'?"
            
            seen_questions.add(q_text)
            qa_pairs.append(
                f"### Question {len(qa_pairs) + 1}\n**Q**: {q_text}\n\n**A**: {a_text}"
            )
            
        return (
            f"## Practice Questions for **{target_doc_title}**\n\n"
            + "\n\n---\n\n".join(qa_pairs)
        )

    # 2. Summary / main concepts
    if any(k in q_lower for k in ["summarize", "summary", "main concept", "key point", "overview"]):
        bullet_points = [f"- **Key Point {i+1}**: {s}" for i, s in enumerate(all_sentences[:6])]
        return (
            f"## Summary of **{target_doc_title}**\n\n"
            "Here are the core concepts and findings extracted from the document context:\n\n"
            + "\n\n".join(bullet_points)
        )

    # 3. Specific topic query score and rank
    query_words = set(re.findall(r'\w+', q_lower)) - {
        "what", "is", "the", "are", "of", "and", "in", "to", "a", "for", "how", "why", "who", "where", "can", "tell", "me", "about"
    }

    scored = []
    for s in all_sentences:
        s_words = set(re.findall(r'\w+', s.lower()))
        overlap = len(query_words & s_words)
        scored.append((overlap, s))

    scored.sort(key=lambda x: x[0], reverse=True)
    best_sentences = [s for score, s in scored[:5] if score > 0]

    if not best_sentences:
        best_sentences = all_sentences[:4]

    formatted_points = "\n".join([f"- {s}" for s in best_sentences])

    return (
        f"## Insights from **{target_doc_title}**\n\n"
        f"Based on your query **\"{query}\"**, here are the relevant details from the document:\n\n"
        f"{formatted_points}"
    )


def query_rag_pipeline(
    db: Session,
    user_id: int,
    query: str,
    document_id: int | None = None,
    top_k: int = 10,
) -> dict:
    """
    Enhanced RAG pipeline:
    1. Retrieves top_k relevant text chunks from Chroma vector store.
    2. Deduplicates & normalizes context chunks.
    3. Generates high-quality AI response via Gemini or Grok API.
    4. Provides intelligent context-driven fallback if LLMs are unavailable.
    """
    vectorstore = get_vectorstore()

    docs = []
    
    # Try search with metadata filters first
    filter_dict = {}
    if document_id is not None:
        filter_dict["document_id"] = str(document_id)
    elif user_id is not None:
        filter_dict["user_id"] = str(user_id)

    try:
        if filter_dict:
            docs = vectorstore.similarity_search(query, k=top_k, filter=filter_dict)
    except Exception as err:
        logger.warning(f"Filter search failed, falling back to standard search: {err}")

    # Fallback to standard similarity search if filter returned nothing or threw error
    if not docs:
        try:
            docs = vectorstore.similarity_search(query, k=top_k)
        except Exception as err:
            logger.error(f"Vector search failed: {err}")
            docs = []

    # Clean and deduplicate retrieved chunks
    seen_texts = set()
    unique_context_passages = []
    citations = []

    for idx, doc in enumerate(docs):
        doc_page = doc.metadata.get("page", doc.metadata.get("page_number", idx + 1))
        raw_text = doc.page_content or ""
        cleaned = clean_chunk_text(raw_text)
        
        if cleaned and cleaned not in seen_texts:
            seen_texts.add(cleaned)
            unique_context_passages.append({
                "page": doc_page,
                "text": cleaned
            })
            citations.append({
                "page": doc_page,
                "snippet": cleaned[:180] + ("..." if len(cleaned) > 180 else "")
            })

    # Get document metadata if document_id is provided
    target_doc_title = "Uploaded Document"
    if document_id:
        doc_obj = get_document(db, document_id)
        if doc_obj:
            target_doc_title = doc_obj.original_filename

    if not unique_context_passages:
        return {
            "answer": f"I couldn't find relevant information in **{target_doc_title}** for your query: \"{query}\". Please try rephrasing your question or verify that the document has finished indexing.",
            "citations": [],
            "query": query,
            "document_id": document_id,
        }

    # Format context for LLM prompt
    formatted_context = "\n\n".join([
        f"--- Source Context (Page {p['page']}) ---\n{p['text']}"
        for p in unique_context_passages
    ])

    system_prompt = (
        "You are StudySphere AI, a world-class academic tutor and AI study partner.\n"
        "Your mission is to deliver comprehensive, accurate, structured, and engaging answers based on the provided document context.\n\n"
        "Formatting & Style Guidelines:\n"
        "1. Structure your output clearly using standard Markdown (use ## Section Headers, ### Subheadings, **bold terms**, bullet lists, and numbered steps).\n"
        "2. Directly answer the user's question first, then provide supporting details, examples, or explanations.\n"
        "3. If asked for practice questions, generate distinct questions with complete answers and explanations.\n"
        "4. Do NOT output raw unstructured chunks. Synthesize the knowledge into fluid academic prose.\n"
        "5. Keep your tone encouraging, clear, and professional."
    )

    full_prompt = (
        f"{system_prompt}\n\n"
        f"DOCUMENT TITLE: {target_doc_title}\n\n"
        f"RELEVANT DOCUMENT CONTEXT:\n{formatted_context}\n\n"
        f"USER QUERY: {query}\n\n"
        f"COMPREHENSIVE RESPONSE:"
    )

    answer_text = ""

    # Check for Grok / xAI key first
    grok_key = (
        getattr(settings, "GROK_API_KEY", "") or 
        getattr(settings, "XAI_API_KEY", "") or 
        os.getenv("GROK_API_KEY", "") or 
        os.getenv("XAI_API_KEY", "")
    )
    
    gemini_key = (
        getattr(settings, "GOOGLE_API_KEY", "") or 
        os.getenv("GOOGLE_API_KEY", "") or 
        os.getenv("GEMINI_API_KEY", "")
    )

    if gemini_key and gemini_key.startswith("xai-"):
        grok_key = gemini_key
        gemini_key = ""

    # 1. Try Grok API if available
    if grok_key:
        answer_text = call_grok_api(api_key=grok_key, prompt=full_prompt)

    # 2. Try Gemini API if available
    if not answer_text and gemini_key:
        answer_text = call_gemini_api(api_key=gemini_key, prompt=full_prompt)

    # 3. Context-driven response generator fallback
    if not answer_text:
        answer_text = generate_context_driven_response(
            query=query,
            target_doc_title=target_doc_title,
            passages=unique_context_passages
        )

    return {
        "answer": answer_text,
        "citations": citations,
        "query": query,
        "document_id": document_id,
    }

