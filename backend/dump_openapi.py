import urllib.request
import json

try:
    res = urllib.request.urlopen("http://localhost:8000/openapi.json")
    openapi = json.loads(res.read().decode())
    with open("openapi_dump.json", "w") as f:
        json.dump(list(openapi["paths"].keys()), f, indent=2)
except Exception as e:
    with open("openapi_dump.json", "w") as f:
        f.write(str(e))
