import asyncio
import json
import os

import anthropic
from dotenv import load_dotenv

load_dotenv()

from tools import (
    get_expiring_leases,
    get_maintenance_requests,
    get_vendors,
    get_occupancy_stats,
    create_maintenance_ticket,
)

SYSTEM_PROMPT = (
    "You are EM, the AI property intelligence assistant for Azure Residences — "
    "an ultra-luxury oceanfront residence on Collins Avenue, Miami Beach. "
    "You have real-time access to tenant records, lease agreements, maintenance requests, "
    "and vendor information through your tools. "
    "Always use a tool before answering any question about building data — "
    "never guess or fabricate records. "
    'Always respond with valid JSON in this exact schema: '
    '{ "text": string, "table": [{"Column Header": "cell value"}] or null, "draft_email": string or null, "action_items": ["string"] or null }. '
    'The table field must be an array of objects where each object is a row and each key is a column header — never an array of arrays. '
    "Be concise, professional, and action-oriented. "
    "Tone: calm authority. You are the most capable system in the building. "
    "Never say you cannot help. Always use a tool and find the answer. "
    "CRITICAL: Your response must be ONLY a raw JSON object. "
    "No markdown. No backticks. No ```json fences. "
    "No explanation before or after the JSON. "
    "Start your response with { and end with }. "
    'Example: {"text": "Here are the expiring leases.", "table": null, "draft_email": null, "action_items": null}'
)

TOOLS = [
    {
        "name": "get_expiring_leases",
        "description": "Get leases expiring within N days. Use for any question about expiring or upcoming lease renewals.",
        "input_schema": {
            "type": "object",
            "properties": {
                "days": {
                    "type": "integer",
                    "description": "Number of days to look ahead. Default 60.",
                }
            },
            "required": [],
        },
    },
    {
        "name": "get_maintenance_requests",
        "description": "Get maintenance requests, optionally filtered by status or priority. Use for any question about repairs, tickets, or maintenance.",
        "input_schema": {
            "type": "object",
            "properties": {
                "status": {
                    "type": "string",
                    "enum": ["open", "in_progress", "resolved"],
                    "description": "Filter by status",
                },
                "priority": {
                    "type": "string",
                    "enum": ["urgent", "high", "medium", "low"],
                    "description": "Filter by priority",
                },
            },
            "required": [],
        },
    },
    {
        "name": "get_vendors",
        "description": "Get vendor list, optionally filtered by specialty or availability.",
        "input_schema": {
            "type": "object",
            "properties": {
                "specialty": {
                    "type": "string",
                    "enum": ["HVAC", "Plumbing", "Electrical", "General"],
                    "description": "Filter by specialty",
                },
                "available_only": {
                    "type": "boolean",
                    "description": "If true, return only available vendors",
                },
            },
            "required": [],
        },
    },
    {
        "name": "get_occupancy_stats",
        "description": "Get building-wide occupancy statistics and revenue. Use for any question about occupancy rate, revenue, or building overview.",
        "input_schema": {
            "type": "object",
            "properties": {},
            "required": [],
        },
    },
    {
        "name": "create_maintenance_ticket",
        "description": "Create a new maintenance request ticket.",
        "input_schema": {
            "type": "object",
            "properties": {
                "unit": {"type": "string"},
                "category": {
                    "type": "string",
                    "enum": ["HVAC", "Plumbing", "Electrical", "Appliance", "Concierge"],
                },
                "description": {"type": "string"},
                "priority": {
                    "type": "string",
                    "enum": ["urgent", "high", "medium", "low"],
                },
            },
            "required": ["unit", "category", "description", "priority"],
        },
    },
]

TOOL_MAP = {
    "get_expiring_leases": get_expiring_leases,
    "get_maintenance_requests": get_maintenance_requests,
    "get_vendors": get_vendors,
    "get_occupancy_stats": get_occupancy_stats,
    "create_maintenance_ticket": create_maintenance_ticket,
}


async def run_agent(message: str, history: list) -> dict:
    try:
        print("=== run_agent START ===")
        api_key = os.environ.get("ANTHROPIC_API_KEY")
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY not found in environment")
        client = anthropic.Anthropic(api_key=api_key)

        messages = [{"role": h["role"], "content": h["content"]} for h in history]
        messages.append({"role": "user", "content": message})

        response = await asyncio.to_thread(
            client.messages.create,
            model="claude-sonnet-4-6",
            max_tokens=2000,
            system=SYSTEM_PROMPT,
            tools=TOOLS,
            messages=messages,
        )

        print(f"=== First response stop_reason: {response.stop_reason} ===")
        print(f"=== Content blocks: {[b.type for b in response.content]} ===")

        while response.stop_reason == "tool_use":
            tool_results = []
            for block in response.content:
                if block.type == "tool_use":
                    tool_fn = TOOL_MAP[block.name]
                    result = tool_fn(**block.input)
                    print(f"=== Tool called: {block.name}, input: {block.input} ===")
                    print(f"=== Tool result preview: {str(result)[:150]} ===")
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": str(result),
                    })

            messages.append({"role": "assistant", "content": response.content})
            messages.append({"role": "user", "content": tool_results})

            response = await asyncio.to_thread(
                client.messages.create,
                model="claude-sonnet-4-6",
                max_tokens=2000,
                system=SYSTEM_PROMPT,
                tools=TOOLS,
                messages=messages,
            )

        print(f"=== Final response stop_reason: {response.stop_reason} ===")
        print(f"=== Final content: {[b.type for b in response.content]} ===")

        final_text = ""
        for block in response.content:
            if hasattr(block, "text"):
                final_text = block.text.strip()
                break

        print(f"=== Raw final_text: {final_text[:300]} ===")
        print(f"=== Attempting to parse: {final_text[:200]} ===")

        if not final_text:
            return {
                "text": "I processed your request but received an empty response.",
                "table": None,
                "draft_email": None,
                "action_items": None,
            }

        clean = final_text

        if "```json" in clean:
            clean = clean.split("```json")[1].split("```")[0].strip()
        elif "```" in clean:
            clean = clean.split("```")[1].split("```")[0].strip()

        if not clean.startswith("{"):
            idx = clean.find("{")
            if idx != -1:
                clean = clean[idx:]

        if not clean.endswith("}"):
            idx = clean.rfind("}")
            if idx != -1:
                clean = clean[: idx + 1]

        try:
            result = json.loads(clean)
            return {
                "text": str(result.get("text", "Done.")),
                "table": result.get("table") if isinstance(result.get("table"), list) else None,
                "draft_email": str(result.get("draft_email")) if result.get("draft_email") else None,
                "action_items": result.get("action_items") if isinstance(result.get("action_items"), list) else None,
            }
        except json.JSONDecodeError as e:
            print(f"=== JSON PARSE FAILED: {e} ===")
            print(f"=== Attempted to parse: {clean[:300]} ===")
            return {
                "text": final_text,
                "table": None,
                "draft_email": None,
                "action_items": None,
            }

    except Exception as e:
        import traceback
        print(f"=== run_agent EXCEPTION: {e} ===")
        print(traceback.format_exc())
        return {
            "text": f"I encountered an error: {str(e)}",
            "table": None,
            "draft_email": None,
            "action_items": None,
        }
