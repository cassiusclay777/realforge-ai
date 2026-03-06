import requests
import os
import json

# Create a simple test ZIP file (empty)
test_zip_path = "test_upload.zip"
with open(test_zip_path, "wb") as f:
    # Minimal ZIP file header
    f.write(b'PK\x05\x06' + b'\x00' * 18)

print("Testing complete upload flow...")
print("=" * 50)

# Test 1: Upload endpoint
print("\n1. Testing upload endpoint...")
url = "http://localhost:3001/api/upload/zip"

try:
    with open(test_zip_path, "rb") as f:
        files = {
            "zipFile": (test_zip_path, f, "application/zip"),
        }
        data = {
            "title": "Test Listing Python",
            "address": "Test Address 123",
            "type": "APARTMENT",
            "price": "5000000",
            "area": "75",
            "rooms": "3"
        }
        
        response = requests.post(url, files=files, data=data)
        
    print(f"Upload Status: {response.status_code}")
    print(f"Upload Response: {response.text[:200]}...")
    
    if response.status_code == 200:
        upload_data = response.json()
        listing_id = upload_data.get("listingId") or upload_data.get("id")
        zip_url = upload_data.get("zipUrl")
        
        print(f"✅ Upload successful!")
        print(f"   Listing ID: {listing_id}")
        print(f"   ZIP URL: {zip_url}")
        
        # Test 2: Queue endpoint
        print("\n2. Testing queue endpoint...")
        queue_url = "http://localhost:3001/api/queue/process-zip"
        queue_data = {
            "listingId": listing_id,
            "zipUrl": zip_url
        }
        
        queue_response = requests.post(queue_url, json=queue_data, headers={"Content-Type": "application/json"})
        
        print(f"Queue Status: {queue_response.status_code}")
        print(f"Queue Response: {queue_response.text}")
        
        if queue_response.status_code == 200:
            queue_result = queue_response.json()
            print(f"✅ Queue successful!")
            print(f"   Job ID: {queue_result.get('jobId')}")
            print(f"   Message: {queue_result.get('message')}")
            
            # Test 3: Check if listing exists in database
            print("\n3. Checking database...")
            # We can check via API endpoint if it exists
            listing_url = f"http://localhost:3001/api/process/zip/{listing_id}"
            listing_response = requests.get(listing_url)
            
            if listing_response.status_code == 200:
                print(f"✅ Listing found in database!")
                listing_data = listing_response.json()
                print(f"   Title: {listing_data.get('listing', {}).get('title')}")
                print(f"   Status: {listing_data.get('listing', {}).get('status')}")
            elif listing_response.status_code == 404:
                print(f"⚠️  Listing not found yet (might be processing)")
            else:
                print(f"❌ Error checking listing: {listing_response.status_code}")
                
        else:
            print(f"❌ Queue failed: {queue_response.text}")
            
    else:
        print(f"❌ Upload failed: {response.text}")
        
except Exception as e:
    print(f"❌ Error: {e}")
    
finally:
    # Clean up test file
    if os.path.exists(test_zip_path):
        os.remove(test_zip_path)
        print(f"\nCleaned up test file: {test_zip_path}")

print("\n" + "=" * 50)
print("Upload flow test complete!")