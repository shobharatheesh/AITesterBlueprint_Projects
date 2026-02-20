import os
import requests
from dotenv import load_dotenv

# Load from absolute path to root .env
load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))

def test_jira():
    base_url = os.getenv('JIRA_BASE_URL')
    email = os.getenv('JIRA_EMAIL')
    token = os.getenv('JIRA_API_TOKEN')

    if not all([base_url, email, token]):
        print("❌ Error: Missing JIRA credentials in .env")
        return

    # JIRA v3 API endpoint to fetch user info
    url = f"{base_url.rstrip('/')}/rest/api/3/myself"
    auth = (email, token)

    try:
        response = requests.get(url, auth=auth)
        if response.status_code == 200:
            user_data = response.json()
            print(f"✅ Success! Connected to JIRA as: {user_data.get('displayName')}")
        else:
            print(f"❌ Failed to connect to JIRA. Status: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Error during request: {str(e)}")

if __name__ == "__main__":
    test_jira()
