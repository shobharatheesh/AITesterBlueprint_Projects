
import os
import requests
from requests.auth import HTTPBasicAuth
from dotenv import load_dotenv

load_dotenv()

class JiraClient:
    def __init__(self):
        self.base_url = os.getenv("JIRA_URL")
        self.email = os.getenv("JIRA_EMAIL")
        self.token = os.getenv("JIRA_API_TOKEN")
        self.auth = HTTPBasicAuth(self.email, self.token)
        self.headers = {"Accept": "application/json"}

    def get_issue(self, issue_key: str):
        if not self.base_url or not self.email or not self.token:
            return {"error": "JIRA credentials not configured in .env"}

        url = f"{self.base_url}/rest/api/3/issue/{issue_key}"
        try:
            response = requests.get(url, headers=self.headers, auth=self.auth, timeout=10)
            if response.status_code == 200:
                data = response.json()
                fields = data.get("fields", {})
                return {
                    "key": data.get("key"),
                    "summary": fields.get("summary"),
                    "description": fields.get("description"), # Note: Description is complex ADF in v3
                    "status": fields.get("status", {}).get("name"),
                    "priority": fields.get("priority", {}).get("name"),
                    "assignee": fields.get("assignee", {}).get("displayName"),
                    "raw": data # Return full data for debugging
                }
            elif response.status_code == 404:
                return {"error": "Issue not found"}
            else:
                return {"error": f"JIRA API Error: {response.status_code}", "details": response.text}
        except Exception as e:
            return {"error": f"Connection Failed: {str(e)}"}
