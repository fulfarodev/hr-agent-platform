from datetime import datetime, timedelta


def get_base_date():
    """Returns today's date for generating relative mock data."""
    return datetime.now()


TEAM_MEMBERS = {
    "TEAM-ENG": [
        {"employeeId": "EMP001", "name": "María García"},
        {"employeeId": "EMP004", "name": "Diego Fernández"},
        {"employeeId": "EMP005", "name": "Laura Sánchez"},
        {"employeeId": "EMP006", "name": "Pedro Ramírez"},
    ],
    "TEAM-MKT": [
        {"employeeId": "EMP002", "name": "Carlos López"},
        {"employeeId": "EMP007", "name": "Sofía Torres"},
        {"employeeId": "EMP008", "name": "Andrés Herrera"},
    ],
    "TEAM-PROD": [
        {"employeeId": "EMP003", "name": "Ana Martínez"},
        {"employeeId": "EMP009", "name": "Valentina Ruiz"},
        {"employeeId": "EMP010", "name": "Mateo Díaz"},
    ],
}


def generate_mock_calendar():
    """Generate mock time-off entries for the next 30 days."""
    base = get_base_date()
    return {
        "TEAM-ENG": [
            {
                "employeeId": "EMP004",
                "employeeName": "Diego Fernández",
                "startDate": (base + timedelta(days=3)).strftime("%Y-%m-%d"),
                "endDate": (base + timedelta(days=7)).strftime("%Y-%m-%d"),
                "status": "approved",
            },
            {
                "employeeId": "EMP005",
                "employeeName": "Laura Sánchez",
                "startDate": (base + timedelta(days=10)).strftime("%Y-%m-%d"),
                "endDate": (base + timedelta(days=12)).strftime("%Y-%m-%d"),
                "status": "pending",
            },
        ],
        "TEAM-MKT": [
            {
                "employeeId": "EMP007",
                "employeeName": "Sofía Torres",
                "startDate": (base + timedelta(days=1)).strftime("%Y-%m-%d"),
                "endDate": (base + timedelta(days=3)).strftime("%Y-%m-%d"),
                "status": "approved",
            },
        ],
        "TEAM-PROD": [
            {
                "employeeId": "EMP009",
                "employeeName": "Valentina Ruiz",
                "startDate": (base + timedelta(days=5)).strftime("%Y-%m-%d"),
                "endDate": (base + timedelta(days=9)).strftime("%Y-%m-%d"),
                "status": "approved",
            },
        ],
    }
