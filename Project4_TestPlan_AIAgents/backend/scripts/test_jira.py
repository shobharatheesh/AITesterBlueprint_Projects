
import os
import requests
from requests.auth import HTTPBasicAuth
from dotenv import load_dotenv

# Load .env (navigate up from backend/scripts/ to .env)
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

JIRA_URL = os.getenv("JIRA_URL")
JIRA_EMAIL = os.getenv("JIRA_EMAIL")
JIRA_TOKEN = os.getenv("JIRA_API_TOKEN")

def check_jira_connection():
    if not JIRA_URL or not JIRA_EMAIL or not JIRA_TOKEN:
        print("❌ FAILED: Missing JIRA credentials in .env")
        return

    print(f"Testing Connection to JIRA: {JIRA_URL} as {JIRA_EMAIL}")
    
    url = f"{JIRA_URL}/rest/api/3/myself"
    auth = HTTPBasicAuth(JIRA_EMAIL, JIRA_TOKEN)
    headers = {
       "Accept": "application/json"
    }

    try:
        response = requests.get(url, headers=headers, auth=auth, timeout=10)
        
        if response.status_code == 200:
            user_data = response.json()
            print(f"✅ SUCCESS: Connected as {user_data.get('displayName')}")
            
            # Optional: Fetch one issue
            # issue_key = "TI-1" # Replace with your test key
            # issue_url = f"{JIRA_URL}/rest/api/3/issue/{issue_key}"
            # resp = requests.get(issue_url, headers=headers, auth=auth)
            # if resp.status_code == 200:
            #     print(f"✅ Found Issue: {resp.json()['key']}")
            
        else:
             print(f"❌ FAILED: API Status {response.status_code}")
             print(f"Response: {response.text}")
             
    except Exception as e:
        print(f"❌ ERROR: {e}")

if __name__ == "__main__":
    check_jira_connection()
