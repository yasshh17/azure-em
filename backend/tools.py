import json
from datetime import date, datetime
from pathlib import Path
from typing import Optional

DATA = Path(__file__).parent / "data"

PRIORITY_ORDER = {"urgent": 0, "high": 1, "medium": 2, "low": 3}


def _load(filename: str) -> list[dict]:
    with open(DATA / filename) as f:
        return json.load(f)


def get_expiring_leases(days: int = 60) -> list[dict]:
    today = date.today()
    tenants = {t["id"]: t for t in _load("tenants.json")}
    leases = _load("leases.json")
    result = []
    for lease in leases:
        if lease["status"] not in ("active", "pending_renewal"):
            continue
        end = date.fromisoformat(lease["end_date"])
        days_remaining = (end - today).days
        if 0 <= days_remaining <= days:
            tenant = tenants.get(lease["tenant_id"], {})
            result.append({
                "tenant_id": lease["tenant_id"],
                "name": tenant.get("name", ""),
                "unit": lease["unit"],
                "email": tenant.get("email", ""),
                "monthly_rent": lease["monthly_rent"],
                "start_date": lease["start_date"],
                "end_date": lease["end_date"],
                "days_remaining": days_remaining,
                "status": lease["status"],
            })
    return sorted(result, key=lambda x: x["days_remaining"])


def get_maintenance_requests(
    status: Optional[str] = None,
    priority: Optional[str] = None,
) -> list[dict]:
    tenants = {t["id"]: t for t in _load("tenants.json")}
    tickets = _load("maintenance.json")
    result = []
    for ticket in tickets:
        if status and ticket["status"] != status:
            continue
        if priority and ticket["priority"] != priority:
            continue
        tenant = tenants.get(ticket["tenant_id"], {})
        result.append({**ticket, "name": tenant.get("name", "")})
    return sorted(
        result,
        key=lambda x: (PRIORITY_ORDER.get(x["priority"], 99), x["created_date"]),
    )


def get_vendors(
    specialty: Optional[str] = None,
    available_only: bool = False,
) -> list[dict]:
    vendors = _load("vendors.json")
    if specialty:
        vendors = [v for v in vendors if v["specialty"].lower() == specialty.lower()]
    if available_only:
        vendors = [v for v in vendors if v["available"]]
    return sorted(vendors, key=lambda v: (0 if v["available"] else 1, -v["rating"]))


def get_all_tenants() -> list[dict]:
    today = date.today()
    tenants = _load("tenants.json")
    leases = _load("leases.json")
    lease_by_tenant = {l["tenant_id"]: l for l in leases}

    def unit_sort_key(unit: str):
        digits = "".join(c for c in unit if c.isdigit())
        letters = "".join(c for c in unit if c.isalpha())
        return (int(digits) if digits else 0, letters)

    result = []
    for tenant in tenants:
        lease = lease_by_tenant.get(tenant["id"])
        lease_info = None
        if lease:
            end = date.fromisoformat(lease["end_date"])
            lease_info = {
                "monthly_rent": lease["monthly_rent"],
                "start_date": lease["start_date"],
                "end_date": lease["end_date"],
                "lease_status": lease["status"],
                "days_remaining": (end - today).days,
            }
        result.append({
            "id": tenant["id"],
            "name": tenant["name"],
            "unit": tenant["unit"],
            "email": tenant["email"],
            "phone": tenant["phone"],
            "move_in_date": tenant["move_in_date"],
            "status": tenant["status"],
            "lease": lease_info,
        })
    return sorted(result, key=lambda t: unit_sort_key(t["unit"]))


def get_all_maintenance_with_vendors() -> list[dict]:
    tenants = {t["id"]: t for t in _load("tenants.json")}
    vendors = {v["id"]: v for v in _load("vendors.json")}
    tickets = _load("maintenance.json")
    result = []
    for ticket in tickets:
        tenant = tenants.get(ticket["tenant_id"], {})
        vendor = vendors.get(ticket.get("assigned_vendor_id") or "", {})
        result.append({
            **ticket,
            "tenant_name": tenant.get("name", "Unknown"),
            "vendor_name": vendor.get("name", "Unassigned"),
        })
    return sorted(
        result,
        key=lambda x: (PRIORITY_ORDER.get(x["priority"], 99), x["created_date"]),
        reverse=False,
    )


def get_occupancy_stats() -> dict:
    today = date.today()
    tenants = _load("tenants.json")
    leases = _load("leases.json")
    active_statuses = {"active", "notice_given", "delinquent"}
    occupied = sum(1 for t in tenants if t["status"] in active_statuses)
    total_monthly_revenue = sum(
        l["monthly_rent"] for l in leases if l["status"] == "active"
    )
    expiring_soon = sum(
        1 for l in leases
        if l["status"] in ("active", "pending_renewal")
        and 0 <= (date.fromisoformat(l["end_date"]) - today).days <= 30
    )
    delinquent_count = sum(1 for t in tenants if t["status"] == "delinquent")
    total_units = 24
    return {
        "total_units": total_units,
        "occupied": occupied,
        "vacant": total_units - occupied,
        "occupancy_rate": round(occupied / total_units * 100, 1),
        "total_monthly_revenue": total_monthly_revenue,
        "expiring_soon": expiring_soon,
        "delinquent_count": delinquent_count,
    }


def create_maintenance_ticket(
    unit: str,
    category: str,
    description: str,
    priority: str,
) -> dict:
    tenants = _load("tenants.json")
    tenant = next((t for t in tenants if t["unit"] == unit), {})
    tickets = _load("maintenance.json")
    new_id = f"MT-{int(datetime.now().timestamp() * 1000)}"
    ticket = {
        "id": new_id,
        "tenant_id": tenant.get("id", ""),
        "unit": unit,
        "category": category,
        "description": description,
        "priority": priority,
        "status": "open",
        "created_date": date.today().isoformat(),
        "assigned_vendor_id": None,
    }
    tickets.append(ticket)
    with open(DATA / "maintenance.json", "w") as f:
        json.dump(tickets, f, indent=2)
    return ticket
