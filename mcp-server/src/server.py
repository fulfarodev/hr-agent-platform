from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent
import json

from src.tools.vacation import get_remaining_vacation_days
from src.tools.time_off import request_time_off
from src.tools.policy import get_company_policy
from src.tools.team_calendar import get_team_calendar

app = Server("hr-tools-mcp")


@app.list_tools()
async def list_tools() -> list[Tool]:
    return [
        Tool(
            name="getRemainingVacationDays",
            description="Get the remaining vacation days for an employee. Returns total days, used days, remaining days, and pending requests.",
            inputSchema={
                "type": "object",
                "properties": {
                    "employeeId": {
                        "type": "string",
                        "description": "The employee ID (e.g., EMP001)"
                    }
                },
                "required": ["employeeId"]
            }
        ),
        Tool(
            name="requestTimeOff",
            description="Submit a time off request for an employee. Validates that dates are in the future, checks sufficient vacation balance, and deducts days if approved. Returns confirmation or rejection with reason.",
            inputSchema={
                "type": "object",
                "properties": {
                    "employeeId": {
                        "type": "string",
                        "description": "The employee ID"
                    },
                    "startDate": {
                        "type": "string",
                        "description": "Start date in ISO format (YYYY-MM-DD)"
                    },
                    "endDate": {
                        "type": "string",
                        "description": "End date in ISO format (YYYY-MM-DD)"
                    },
                    "reason": {
                        "type": "string",
                        "description": "Optional reason for the time off request"
                    }
                },
                "required": ["employeeId", "startDate", "endDate"]
            }
        ),
        Tool(
            name="getCompanyPolicy",
            description="Retrieve company policy information on a specific topic. Available topics: vacation, sick_leave, remote_work, parental_leave, holidays, bereavement.",
            inputSchema={
                "type": "object",
                "properties": {
                    "topic": {
                        "type": "string",
                        "description": "Policy topic to look up",
                        "enum": ["vacation", "sick_leave", "remote_work", "parental_leave", "holidays", "bereavement"]
                    }
                },
                "required": ["topic"]
            }
        ),
        Tool(
            name="getTeamCalendar",
            description="Get the time off calendar for a team within a date range. Shows which team members have approved or pending time off. Useful for checking conflicts before requesting time off.",
            inputSchema={
                "type": "object",
                "properties": {
                    "teamId": {
                        "type": "string",
                        "description": "The team ID (e.g., TEAM-ENG, TEAM-MKT, TEAM-PROD)"
                    },
                    "startDate": {
                        "type": "string",
                        "description": "Start of date range (YYYY-MM-DD)"
                    },
                    "endDate": {
                        "type": "string",
                        "description": "End of date range (YYYY-MM-DD)"
                    }
                },
                "required": ["teamId", "startDate", "endDate"]
            }
        ),
    ]


@app.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    try:
        if name == "getRemainingVacationDays":
            result = get_remaining_vacation_days(arguments["employeeId"])
        elif name == "requestTimeOff":
            result = request_time_off(
                arguments["employeeId"],
                arguments["startDate"],
                arguments["endDate"],
                arguments.get("reason"),
            )
        elif name == "getCompanyPolicy":
            result = get_company_policy(arguments["topic"])
        elif name == "getTeamCalendar":
            result = get_team_calendar(
                arguments["teamId"],
                arguments["startDate"],
                arguments["endDate"],
            )
        else:
            result = {"error": f"Unknown tool: {name}"}

        return [TextContent(type="text", text=json.dumps(result, default=str))]
    except Exception as e:
        return [TextContent(type="text", text=json.dumps({"error": str(e)}))]


async def main():
    async with stdio_server() as (read_stream, write_stream):
        await app.run(read_stream, write_stream, app.create_initialization_options())


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
