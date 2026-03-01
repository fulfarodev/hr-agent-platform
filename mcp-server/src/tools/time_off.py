from datetime import datetime, date, timedelta
from src.data.employees import EMPLOYEES
import uuid


def request_time_off(employee_id: str, start_date: str, end_date: str, reason: str = None) -> dict:
    employee = EMPLOYEES.get(employee_id)
    if not employee:
        return {"error": f"Employee {employee_id} not found"}

    try:
        start = datetime.strptime(start_date, "%Y-%m-%d").date()
        end = datetime.strptime(end_date, "%Y-%m-%d").date()
    except ValueError:
        return {"error": "Invalid date format. Use YYYY-MM-DD"}

    today = date.today()
    if start <= today:
        return {"error": f"Start date must be in the future. Today is {today.isoformat()}"}

    if end < start:
        return {"error": "End date must be on or after start date"}

    days = calculate_business_days(start, end)

    balance = employee["vacationBalance"]
    available = balance["remaining"] - balance["pending"]

    if days > available:
        return {
            "status": "rejected",
            "reason": f"Insufficient balance. Requested {days} days but only {available} available ({balance['remaining']} remaining - {balance['pending']} pending)",
            "requestedDays": days,
            "availableDays": available,
        }

    balance["used"] += days
    balance["remaining"] -= days

    request_id = f"PTO-{uuid.uuid4().hex[:8].upper()}"

    return {
        "status": "approved",
        "requestId": request_id,
        "employeeId": employee_id,
        "employeeName": employee["name"],
        "startDate": start_date,
        "endDate": end_date,
        "businessDays": days,
        "reason": reason,
        "newBalance": {
            "total": balance["total"],
            "used": balance["used"],
            "remaining": balance["remaining"],
        },
    }


def calculate_business_days(start: date, end: date) -> int:
    """Calculate number of business days between two dates (inclusive)."""
    days = 0
    current = start
    while current <= end:
        if current.weekday() < 5:
            days += 1
        current = current + timedelta(days=1)
    return days
