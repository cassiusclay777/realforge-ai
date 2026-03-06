import requests
import json

url = "http://localhost:3000/api/auth/register"
headers = {"Content-Type": "application/json"}
data = {
    "email": "test10@example.com",
    "password": "testpassword123",
    "name": "Test User 10"
}

print("Sending request to:", url)
print("Data:", json.dumps(data, indent=2))

response = requests.post(url, json=data, headers=headers)
print("\nResponse status code:", response.status_code)
print("Response body:", response.text)

if response.status_code == 201:
    print("\n✓ Registration successful!")
else:
    print("\n✗ Registration failed")