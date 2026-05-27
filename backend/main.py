from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import ChatRequest, ChatResponse
from agent import run_agent
from tools import (
    get_occupancy_stats,
    get_maintenance_requests,
    get_expiring_leases,
    get_vendors,
    get_all_tenants,
    get_all_maintenance_with_vendors,
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://azure-em.vercel.app",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"https://azure-em-.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        history = [{"role": h.role, "content": h.content} for h in request.history]
        result = await run_agent(request.message, history)
        return ChatResponse(**result)
    except Exception as e:
        return ChatResponse(
            text="I encountered an issue processing your request. Please try again.",
            table=None,
            draft_email=None,
            action_items=None,
        )


@app.get("/api/dashboard")
async def dashboard():
    try:
        stats = get_occupancy_stats()
        maintenance = get_maintenance_requests(status="open")[:3]
        leases = get_expiring_leases(days=60)
        return {
            "stats": stats,
            "recent_maintenance": maintenance,
            "expiring_leases": leases,
        }
    except Exception as e:
        return {"error": str(e)}


@app.get("/api/tenants")
async def tenants():
    try:
        return get_all_tenants()
    except Exception as e:
        return {"error": str(e)}


@app.get("/api/maintenance")
async def maintenance():
    try:
        return get_all_maintenance_with_vendors()
    except Exception as e:
        return {"error": str(e)}


@app.get("/api/vendors")
async def vendors_list():
    try:
        return get_vendors()
    except Exception as e:
        return {"error": str(e)}


@app.get("/api/health")
async def health():
    return {"status": "ok", "building": "Azure Residences"}
