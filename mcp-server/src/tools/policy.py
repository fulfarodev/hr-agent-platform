from src.data.policies import POLICIES


def get_company_policy(topic: str) -> dict:
    policy = POLICIES.get(topic)
    if not policy:
        available = list(POLICIES.keys())
        return {
            "error": f"Policy topic '{topic}' not found. Available topics: {', '.join(available)}"
        }
    return policy
