import json
import re
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.schemas.mindmap import (
    MindmapResponse,
    MindmapCreate,
    MindmapUpdate,
    AIGenerateMindmapRequest,
)
from app.crud.mindmap import (
    get_user_mindmaps,
    get_mindmap,
    create_mindmap,
    update_mindmap,
    delete_mindmap,
)
from app.crud.document import get_document
from app.services.rag_service import query_rag_pipeline

router = APIRouter(
    prefix="/mindmaps",
    tags=["Mindmaps"],
)


@router.get("/", response_model=List[MindmapResponse])
def list_mindmaps(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return get_user_mindmaps(db, current_user.id)


@router.get("/{mindmap_id}", response_model=MindmapResponse)
def get_mindmap_detail(
    mindmap_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    mindmap = get_mindmap(db, mindmap_id)
    if not mindmap or mindmap.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mindmap not found")
    return mindmap


@router.post("/", response_model=MindmapResponse, status_code=status.HTTP_201_CREATED)
def create_new_mindmap(
    mindmap_in: MindmapCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return create_mindmap(db, current_user.id, mindmap_in)


@router.put("/{mindmap_id}", response_model=MindmapResponse)
def update_existing_mindmap(
    mindmap_id: int,
    mindmap_in: MindmapUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    mindmap = get_mindmap(db, mindmap_id)
    if not mindmap or mindmap.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mindmap not found")
    return update_mindmap(db, mindmap, mindmap_in)


@router.delete("/{mindmap_id}", status_code=status.HTTP_200_OK)
def remove_mindmap(
    mindmap_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    mindmap = get_mindmap(db, mindmap_id)
    if not mindmap or mindmap.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mindmap not found")
    delete_mindmap(db, mindmap)
    return {"message": "Mindmap deleted successfully", "id": mindmap_id}


@router.post("/generate", response_model=MindmapResponse)
def generate_mindmap_ai(
    payload: AIGenerateMindmapRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    doc_title = "Study Concept"
    if payload.document_id:
        doc_obj = get_document(db, payload.document_id)
        if doc_obj:
            doc_title = doc_obj.original_filename.rsplit('.', 1)[0]

    topic_name = payload.topic or payload.title or doc_title

    prompt = (
        f"Analyze the study material for '{topic_name}' and construct a hierarchical Mindmap structure.\n"
        "Return ONLY a raw valid JSON object with NO extra code blocks or explanatory markdown.\n"
        "JSON Schema:\n"
        "{\n"
        "  \"central_topic\": \"Central Subject Title\",\n"
        "  \"branches\": [\n"
        "    {\n"
        "      \"name\": \"Main Category 1\",\n"
        "      \"subtopics\": [\"Key Concept 1.1\", \"Key Concept 1.2\", \"Key Concept 1.3\"]\n"
        "    },\n"
        "    {\n"
        "      \"name\": \"Main Category 2\",\n"
        "      \"subtopics\": [\"Key Concept 2.1\", \"Key Concept 2.2\", \"Key Concept 2.3\"]\n"
        "    },\n"
        "    {\n"
        "      \"name\": \"Main Category 3\",\n"
        "      \"subtopics\": [\"Key Concept 3.1\", \"Key Concept 3.2\", \"Key Concept 3.3\"]\n"
        "    }\n"
        "  ]\n"
        "}\n"
    )

    rag_result = query_rag_pipeline(
        db=db,
        user_id=current_user.id,
        query=prompt,
        document_id=payload.document_id,
        top_k=10,
    )

    answer_text = rag_result.get("answer", "")
    
    # Clean JSON output
    cleaned_json = answer_text.strip()
    if "```" in cleaned_json:
        cleaned_json = re.sub(r'^```(?:json)?\s*', '', cleaned_json)
        cleaned_json = re.sub(r'\s*```$', '', cleaned_json)

    json_data = None
    try:
        json_match = re.search(r'\{.*\}', cleaned_json, re.DOTALL)
        if json_match:
            json_data = json.loads(json_match.group(0))
    except Exception as err:
        print(f"JSON parsing error for mindmap: {err}")

    # Default fallback data if parsing fails
    if not json_data or "branches" not in json_data:
        json_data = {
            "central_topic": topic_name,
            "branches": [
                {
                    "name": "Core Principles",
                    "subtopics": ["Fundamental Definitions", "Primary Functions", "Key Frameworks"]
                },
                {
                    "name": "Key Mechanisms",
                    "subtopics": ["Operational Steps", "Sequential Process", "System Interactions"]
                },
                {
                    "name": "Practical Applications",
                    "subtopics": ["Real-world Use Cases", "Case Studies", "Future Developments"]
                }
            ]
        }

    central_label = json_data.get("central_topic") or topic_name
    branches = json_data.get("branches", [])

    nodes = []
    edges = []

    root_id = "root"
    num_branches = max(1, len(branches))
    center_x = ((num_branches - 1) * 280) / 2

    # Root Node
    nodes.append({
        "id": root_id,
        "data": {"label": central_label},
        "position": {"x": center_x, "y": 40},
        "type": "input",
        "style": {
            "background": "linear-gradient(135deg, #4f46e5, #7c3aed)",
            "color": "#ffffff",
            "fontWeight": "800",
            "fontSize": "16px",
            "borderRadius": "16px",
            "padding": "14px 28px",
            "boxShadow": "0 10px 25px -5px rgba(79, 70, 229, 0.4)",
            "border": "none"
        }
    })

    colors = [
        {"bg": "#ec4899", "border": "#db2777"},
        {"bg": "#8b5cf6", "border": "#7c3aed"},
        {"bg": "#06b6d4", "border": "#0891b2"},
        {"bg": "#10b981", "border": "#059669"},
        {"bg": "#f59e0b", "border": "#d97706"},
    ]

    node_counter = 1

    for idx, branch in enumerate(branches[:5]):
        branch_id = f"b_{node_counter}"
        node_counter += 1

        color_palette = colors[idx % len(colors)]
        branch_x = idx * 280
        branch_y = 200

        nodes.append({
            "id": branch_id,
            "data": {"label": branch.get("name", f"Category {idx+1}")},
            "position": {"x": branch_x, "y": branch_y},
            "style": {
                "background": color_palette["bg"],
                "color": "#ffffff",
                "fontWeight": "700",
                "fontSize": "14px",
                "borderRadius": "12px",
                "padding": "10px 20px",
                "boxShadow": "0 6px 15px -3px rgba(0, 0, 0, 0.1)",
                "border": "none"
            }
        })

        edges.append({
            "id": f"e_{root_id}-{branch_id}",
            "source": root_id,
            "target": branch_id,
            "type": "smoothstep",
            "animated": True,
            "style": {"stroke": color_palette["bg"], "strokeWidth": 3}
        })

        subtopics = branch.get("subtopics", [])
        for sub_idx, sub in enumerate(subtopics[:4]):
            sub_id = f"s_{node_counter}"
            node_counter += 1
            sub_y = branch_y + 110 + (sub_idx * 75)

            nodes.append({
                "id": sub_id,
                "data": {"label": sub},
                "position": {"x": branch_x, "y": sub_y},
                "style": {
                    "background": "#ffffff",
                    "color": "#0f172a",
                    "fontWeight": "600",
                    "fontSize": "12px",
                    "borderRadius": "10px",
                    "padding": "8px 16px",
                    "border": f"2px solid {color_palette['border']}",
                    "boxShadow": "0 2px 8px rgba(0, 0, 0, 0.05)"
                }
            })

            edges.append({
                "id": f"e_{branch_id}-{sub_id}",
                "source": branch_id,
                "target": sub_id,
                "type": "smoothstep",
                "style": {"stroke": color_palette["border"], "strokeDasharray": "4", "strokeWidth": 2}
            })

    graph_data = json.dumps({"nodes": nodes, "edges": edges})

    mindmap_in = MindmapCreate(
        title=central_label,
        nodes_json=graph_data,
        document_id=payload.document_id,
    )
    return create_mindmap(db, current_user.id, mindmap_in)
