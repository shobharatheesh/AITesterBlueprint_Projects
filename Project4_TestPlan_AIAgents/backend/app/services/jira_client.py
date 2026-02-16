import os
import requests
import base64
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from dotenv import load_dotenv

load_dotenv()

# Use a global session for the fastest possible performance
# Sessions reuse connections and handle connection pooling automatically
_session = requests.Session()
retries = Retry(total=2, backoff_factor=0.1, status_forcelist=[500, 502, 503, 504])
_session.mount('https://', HTTPAdapter(max_retries=retries))

class JiraClient:
    def __init__(self, url=None, email=None, token=None):
        raw_url = (url or os.getenv("JIRA_URL") or "").strip()
        if raw_url and not raw_url.startswith("http"):
            raw_url = f"https://{raw_url}"
        self.base_url = raw_url.rstrip('/')
        
        self.email = (email or os.getenv("JIRA_EMAIL") or "").strip()
        self.token = (token or os.getenv("JIRA_API_TOKEN") or "").strip()
        
        # Headers prepared once
        self.headers = {
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
        
    def _get_auth(self):
        if self.email and self.token:
            return (self.email, self.token)
        return None

    def test_connection_sync(self):
        """Pure speed - no async overhead for the simple verification check"""
        if not self.base_url: return {"error": "URL missing"}
        
        url = f"{self.base_url}/rest/api/3/myself"
        try:
            # Use the global session + credentials
            response = _session.get(
                url, 
                auth=self._get_auth(), 
                headers=self.headers, 
                timeout=8
            )
            
            if response.status_code == 200:
                user = response.json().get('displayName', 'User')
                return {"status": "success", "message": f"Verified: {user}"}
            elif response.status_code == 401:
                return {"error": "Invalid Credentials (401)"}
            else:
                return {"error": f"JIRA API Error ({response.status_code})"}
        except requests.exceptions.Timeout:
            return {"error": "Connection Timed Out"}
        except Exception as e:
            return {"error": f"Connection Failed: {str(e)}"}

    # Keeping async for the actual ticket fetching to maintain FastAPI performance
    def get_issue(self, issue_key: str):
        # We can use the same session wrapped in a thread for speed if needed
        # but let's keep it simple for now as the user specifically noted the 'Test' button
        url = f"{self.base_url}/rest/api/3/issue/{issue_key}"
        try:
            response = _session.get(
                url, 
                auth=self._get_auth(), 
                headers=self.headers, 
                timeout=10
            )
            if response.status_code == 200:
                data = response.json()
                fields = data.get("fields", {})
                return {
                    "key": data.get("key"),
                    "summary": fields.get("summary"),
                    "description": fields.get("description"),
                    "status": fields.get("status", {}).get("name"),
                    "priority": fields.get("priority", {}).get("name"),
                    "raw": data
                }
            return {"error": f"Failed to fetch ticket ({response.status_code})"}
        except Exception as e:
            return {"error": str(e)}
