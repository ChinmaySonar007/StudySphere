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
    prompt = (
        "Analyze the document context and outline a hierarchical mindmap structure.\n"
        "Identify the Central Topic, 3-4 Main Category Branches, and 2-3 Sub-topics for each category.\n"
        "Format as Markdown bullet lists:\n"
        "- Central Topic Name\n"
        "  - Branch Category 1\n"
        "    - Subtopic 1.1\n"
        "    - Subtopic 1.2\n"
        "  - Branch Category 2\n"
        "    - Subtopic 2.1\n"
        "    - Subtopic 2.2\n"
    )

    rag_result = query_rag_pipeline(
        db=db,
        user_id=current_user.id,
        query=prompt,
        document_id=payload.document_id,
        top_k=10,
    )

    answer_text = rag_result.get("answer", "")

    # Parse bullet structure into node/edge graph JSON compatible with ReactFlow
    nodes = []
    edges = []

    root_id = "1"
    root_label = payload.title or "Core Concepts"
    
    # Try to extract central topic title
    lines = [l for l in answer_text.split('\n') if l.strip()]
    if lines:
        first_line = re.sub(r'^[#\-\*\d\.\s]+', '', lines[0]).strip()
        if first_line:
            root_label = first_line[:40]

    nodes.append({
        "id": root_id,
        "data": {"label": root_label},
        "position": {"x": 250, "y": 50},
        "type": "input",
        "style": {"background": "#6366f1", "color": "#ffffff", "fontWeight": "bold", "borderRadius": "12px", "padding": "12px 24px"}
    })

    branches = []
    current_branch = None

    for line in lines[1:]:
        stripped = line.strip()
        indent_level = len(line) - len(line.lstrip())
        clean_text = re.sub(r'^[#\-\*\d\.\s]+', '', stripped).strip()
        if not clean_text:
            continue

        if indent_level <= 2:
            current_branch = {"title": clean_text[:35], "subtopics": []}
            branches.append(current_branch)
        elif current_branch and indent_level > 2:
            current_branch["subtopics"].append(clean_text[:35])

    if not branches:
        branches = [
            {"title": "Key Definitions", "subtopics": ["Core terms", "Primary principles"]},
            {"title": "Main Processes", "subtopics": ["Sequential steps", "Functional flow"]},
            {"title": "Applications", "subtopics": ["Practical usage", "Case examples"]}
        ]

    colors = ["#ec4899", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"]

    node_count = 2
    x_gap = 260
    start_x = 50

    for idx, branch in enumerate(branches[:5]):
        branch_id = str(node_count)
        node_count += 1
        color = colors[idx % len(colors)]
        
        branch_x = start_x + (idx * x_gap)
        branch_y = 200

        nodes.append({
            "id": branch_id,
            "data": {"label": branch["title"]},
            "position": {"x": branch_x, "y": branch_y},
            "style": {"background": color, "color": "#ffffff", "fontWeight": "600", "borderRadius": "10px", "padding": "10px 18px"}
        })
        edges.append({
            "id": f"e{root_id}-{branch_id}",
            "source": root_id,
            "target": branch_id,
            "animated": True,
            "style": {"stroke": color, "strokeWidth": 2}
        })

        for sub_idx, sub in enumerate(branch["subtopics"][:3]):
            sub_id = str(node_count)
            node_count += 1
            sub_y = branch_y + 110 + (sub_idx * 70)

            nodes.append({
                "id": sub_id,
                "data": {"label": sub},
                "position": {"x": branch_x, "y": sub_y},
                "style": {"background": "#ffffff", "color": "#1e293b", "border": f"2px solid {color}", "borderRadius": "8px", "padding": "8px 14px", "fontSize": "13px"}
            })
            edges.append({
                "id": f"e{branch_id}-{sub_id}",
                "source": branch_id,
                "target": sub_id,
                "style": {"stroke": color, "strokeDasharray": "4"}
            })

    graph_data = json.dumps({"nodes": nodes, "edges": edges})

    mindmap_in = MindmapCreate(
        title=root_label,
        nodes_json=graph_data,
        document_id=payload.document_id,
    )
    return create_mindmap(db, current_user.id, mindmap_in)
