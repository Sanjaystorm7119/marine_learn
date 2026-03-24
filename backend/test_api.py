import json
import urllib.request

base_url = "http://localhost:8000"

with open("test_out.txt", "w") as f:
    # login
    try:
        req = urllib.request.Request(
            f"{base_url}/login",
            data=json.dumps({"email": "testuser99@test.com", "password": "password123"}).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        res = urllib.request.urlopen(req)
        body = res.read().decode()
        f.write(f"Login: {res.getcode()} {body}\n")
        token = json.loads(body).get("access_token")
        
        # get courses
        req2 = urllib.request.Request(
            f"{base_url}/courses/my",
            headers={"Authorization": f"Bearer {token}"}
        )
        res2 = urllib.request.urlopen(req2)
        f.write(f"Courses/my: {res2.getcode()} {res2.read().decode()}\n")
    except Exception as e:
        f.write(f"Error: {repr(e)}\n")
        if hasattr(e, "read"):
            f.write(f"{e.read().decode()}\n")
