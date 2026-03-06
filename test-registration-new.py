import requests
import json
import time

url = "http://localhost:3000/api/auth/register"
headers = {"Content-Type": "application/json"}

# Generate unique email based on timestamp
timestamp = int(time.time() * 1000)
email = f"test{timestamp}@example.com"
data = {
    "email": email,
    "password": "testpassword123",
    "name": f"Test User {timestamp}"
}

print("Sending request to:", url)
print("Data:", json.dumps(data, indent=2))

response = requests.post(url, json=data, headers=headers)
print("\nResponse status code:", response.status_code)
print("Response body:", response.text)

if response.status_code == 201:
    print("\n✓ Registration successful!")
    print("User created:", response.json()["user"]["email"])
else:
    print("\n✗ Registration failed")