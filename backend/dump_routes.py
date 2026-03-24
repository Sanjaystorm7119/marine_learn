import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from main import app
    with open("internal_routes.txt", "w") as f:
        for route in app.routes:
            f.write(f"{route.path}\n")
except Exception as e:
    with open("internal_routes.txt", "w") as f:
        f.write(f"Error: {repr(e)}")
