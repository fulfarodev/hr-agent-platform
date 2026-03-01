from src.data.employees import EMPLOYEES


def get_remaining_vacation_days(employee_id: str) -> dict:
    employee = EMPLOYEES.get(employee_id)
    if not employee:
        return {"error": f"Employee {employee_id} not found"}

    balance = employee["vacationBalance"]
    return {
        "employeeId": employee_id,
        "employeeName": employee["name"],
        "total": balance["total"],
        "used": balance["used"],
        "remaining": balance["remaining"],
        "pending": balance["pending"],
    }
