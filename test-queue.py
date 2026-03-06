import requests
import json

url = "http://localhost:3001/api/queue/process-zip"
data = {
    "listingId": "60102e8b-386a-4d42-ba1c-4c8b720fa5cb",
    "zipUrl": "/uploads/60102e8b-386a-4d42-ba1c-4c8b720fa5cb.zip"
}

response = requests.post(url, json=data)
print(f"Status: {response.status_code}")
print(f"Response: {response.text}")