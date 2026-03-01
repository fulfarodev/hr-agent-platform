from datetime import datetime
from src.data.calendar import generate_mock_calendar, TEAM_MEMBERS


def get_team_calendar(team_id: str, start_date: str, end_date: str) -> dict:
    if team_id not in TEAM_MEMBERS:
        available = list(TEAM_MEMBERS.keys())
        return {"error": f"Team '{team_id}' not found. Available teams: {', '.join(available)}"}

    try:
        start = datetime.strptime(start_date, "%Y-%m-%d").date()
        end = datetime.strptime(end_date, "%Y-%m-%d").date()
    except ValueError:
        return {"error": "Invalid date format. Use YYYY-MM-DD"}

    calendar = generate_mock_calendar()
    team_entries = calendar.get(team_id, [])

    filtered = []
    for entry in team_entries:
        entry_start = datetime.strptime(entry["startDate"], "%Y-%m-%d").date()
        entry_end = datetime.strptime(entry["endDate"], "%Y-%m-%d").date()

        if entry_start <= end and entry_end >= start:
            filtered.append(entry)

    return {
        "teamId": team_id,
        "teamMembers": TEAM_MEMBERS[team_id],
        "dateRange": {"start": start_date, "end": end_date},
        "timeOffEntries": filtered,
        "totalMembersOut": len(filtered),
        "teamSize": len(TEAM_MEMBERS[team_id]),
    }
