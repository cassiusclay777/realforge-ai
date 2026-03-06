import requests
import json

url = "http://localhost:3001/api/queue/process-zip"
headers = {"Content-Type": "application/json"}
data = {
    "listingId": "test-python-123",
    "zipUrl": "http://example.com/test.zip"
}

try:
    print("Testing queue endpoint...")
    response = requests.post(url, headers=headers, json=data)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        print("✅ Queue endpoint works!")
    else:
        print("❌ Queue endpoint failed")
        
except Exception as e:
    print(f"Error: {e}")