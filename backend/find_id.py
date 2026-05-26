import os
import httpx
from dotenv import load_dotenv

load_dotenv()

TENANT_ID = os.getenv("MS_TENANT_ID")
CLIENT_ID = os.getenv("MS_CLIENT_ID")
CLIENT_SECRET = os.getenv("MS_CLIENT_SECRET")

print("1. Authenticating...")

token_url = f"https://login.microsoftonline.com/{TENANT_ID}/oauth2/v2.0/token"

token_data = {
    "grant_type": "client_credentials",
    "client_id": CLIENT_ID,
    "client_secret": CLIENT_SECRET,
    "scope": "https://graph.microsoft.com/.default",
}

token_response = httpx.post(token_url, data=token_data).json()

token = token_response.get("access_token")

if not token:
    print("❌ Failed to get access token")
    print(token_response)
    exit()

headers = {
    "Authorization": f"Bearer {token}"
}

print("2. Fetching Containers...")

con_url = "https://graph.microsoft.com/v1.0/storage/fileStorage/containers"

con_res = httpx.get(con_url, headers=headers)

print("STATUS:", con_res.status_code)

print("RAW RESPONSE:")
print(con_res.text)

if con_res.status_code != 200:
    print("❌ Failed to fetch containers.")
    exit()

data = con_res.json()

print("\n" + "=" * 50)
print("🎉 YOUR CONTAINER IDs 🎉")
print("=" * 50)

containers = data.get("value", [])

if not containers:
    print("❌ No containers found.")
else:
    for c in containers:
        print(f"\n📦 Container Name : {c.get('displayName')}")
        print(f"🆔 Container ID   : {c.get('id')}")
        print(f"💾 Drive ID       : {c.get('driveId')}")