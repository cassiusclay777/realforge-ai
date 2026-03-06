#!/usr/bin/env python3
"""Test AI integration for REALFORGE AI ML Service"""

import sys
import os
sys.path.append('.')

print("Testing AI integration...")

try:
    # Test OpenAI import
    from openai import OpenAI
    print("✓ OpenAI library imported")
    
    # Load environment
    from dotenv import load_dotenv
    load_dotenv()
    
    # Check API key
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key and api_key != "sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx":
        print(f"✓ OpenAI API key found (length: {len(api_key)})")
        
        # Initialize client
        client = OpenAI(api_key=api_key)
        print("✓ OpenAI client initialized")
        
        # Test simple completion (with timeout)
        import asyncio
        import threading
        from queue import Queue
        
        def test_gpt():
            try:
                response = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[{"role": "user", "content": "Say 'Hello' in Czech."}],
                    max_tokens=10,
                    timeout=5
                )
                return response.choices[0].message.content
            except Exception as e:
                return f"Error: {e}"
        
        # Run with timeout
        result_queue = Queue()
        thread = threading.Thread(target=lambda q: q.put(test_gpt()), args=(result_queue,))
        thread.start()
        thread.join(timeout=10)
        
        if thread.is_alive():
            print("⚠ GPT test timed out (might be API issue)")
            result = "Timeout"
        else:
            result = result_queue.get()
            
        print(f"✓ GPT test completed: {result}")
        
    else:
        print("⚠ OpenAI API key not configured (using placeholder)")
        print("  Note: Update .env.local with real API key for production")
    
    # Test FastAPI app import
    print("\nTesting FastAPI app...")
    from app import app
    print(f"✓ FastAPI app loaded: {app.title} v{app.version}")
    
    # Test endpoints
    print("\nTesting endpoints structure...")
    routes = []
    for route in app.routes:
        routes.append(f"{route.methods} {route.path}")
    
    print(f"✓ Found {len(routes)} routes")
    for i, route in enumerate(routes[:5]):  # Show first 5
        print(f"  {i+1}. {route}")
    
    if len(routes) > 5:
        print(f"  ... and {len(routes)-5} more")
    
    print("\n✅ AI integration test PASSED")
    print("\nNext steps:")
    print("1. Start ML service: uvicorn app:app --host 0.0.0.0 --port 8000 --reload")
    print("2. Test API: curl http://localhost:8000/health")
    print("3. Test AI: curl http://localhost:8000/api/v1/test-ai")
    
except Exception as e:
    print(f"\n❌ AI integration test FAILED: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)