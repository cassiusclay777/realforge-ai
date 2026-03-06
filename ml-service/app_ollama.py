from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import time
import asyncio
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
import os
from dotenv import load_dotenv
import json

# AI imports - Ollama je kompatibilní s OpenAI SDK
from openai import OpenAI

# Load environment variables
load_dotenv()

# Initialize Ollama client (OpenAI kompatibilní)
ollama_client = OpenAI(
    base_url="http://localhost:11434/v1",  # Ollama API endpoint
    api_key="ollama",  # Ollama nevyžaduje API key, ale SDK ho chce
)

# Default model pro Ollama (můžeme použít llama3.2, mistral, atd.)
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")

# Lifespan events for FastAPI
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global app_start_time
    app_start_time = time.time()
    print("=== REALFORGE AI ML Service (Ollama) starting up... ===")
    print("Available endpoints:")
    print("   GET  /health")
    print("   POST /api/v1/process-zip")
    print("   GET  /api/v1/jobs/{job_id}")
    print("   GET  /api/v1/jobs")
    print(f"   Using Ollama model: {OLLAMA_MODEL}")
    
    # Check if Ollama is running
    try:
        import requests
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        if response.status_code == 200:
            models = response.json().get("models", [])
            print(f"✓ Ollama running, available models: {[m['name'] for m in models]}")
            
            # Check if our model is available
            model_available = any(m['name'] == OLLAMA_MODEL for m in models)
            if not model_available:
                print(f"⚠ Model '{OLLAMA_MODEL}' not found. Available: {[m['name'] for m in models]}")
                print(f"  Run: ollama pull {OLLAMA_MODEL}")
        else:
            print("⚠ Ollama not responding correctly")
    except Exception as e:
        print(f"⚠ Cannot connect to Ollama: {e}")
        print("  Install Ollama from: https://ollama.com")
        print(f"  Then run: ollama pull {OLLAMA_MODEL}")
    
    yield
    
    # Shutdown
    print("=== REALFORGE AI ML Service shutting down... ===")

# Create FastAPI app with lifespan
app = FastAPI(
    title="REALFORGE AI ML Service (Ollama)",
    description="AI-powered image processing and content generation for real estate listings using local Ollama",
    version="2.1.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class ProcessZipRequest(BaseModel):
    listing_id: str
    zip_url: str
    metadata: Optional[Dict[str, Any]] = None

class ProcessingStep(BaseModel):
    name: str
    status: str
    duration: str
    details: Optional[Dict[str, Any]] = None

class ProcessZipResponse(BaseModel):
    job_id: str
    listing_id: str
    status: str
    steps: List[ProcessingStep]
    estimated_completion: str
    progress_percentage: int
    created_at: str

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    timestamp: str
    uptime: float
    ollama_connected: bool
    ollama_model: str

# In-memory job storage (for MVP)
jobs = {}

async def generate_content_with_ollama(listing_id: str, image_categories: List[str] = None) -> Dict[str, Any]:
    """Generate real estate content using Ollama (local AI)"""
    try:
        # Prepare prompt
        if image_categories:
            categories_text = ", ".join(image_categories)
            prompt = f"""Jsi profesionální realitní copywriter specializovaný na český trh. 
            Generuj obsah pro realitní inzerát bytu/domu na základě těchto detekovaných místností: {categories_text}.
            
            Vytvoř:
            1. Poutavý nadpis (max 60 znaků)
            2. Krátký popis (1-2 věty)
            3. Dlouhý popis (3-5 odstavců)
            4. 5 klíčových bodů (bullet points)
            5. SEO optimalizovaný titulek a meta popis
            6. Doporučenou cenu (v CZK)
            7. Cílovou skupinu
            
            Odpověz ve formátu JSON s těmito klíči: headline, short_desc, long_desc, bullet_points, seo_title, seo_description, price_suggestion, target_audience."""
        else:
            prompt = """Jsi profesionální realitní copywriter specializovaný na český trh. 
            Generuj obsah pro realitní inzerát bytu/domu.
            
            Vytvoř:
            1. Poutavý nadpis (max 60 znaků)
            2. Krátký popis (1-2 věty)
            3. Dlouhý popis (3-5 odstavců)
            4. 5 klíčových bodů (bullet points)
            5. SEO optimalizovaný titulek a meta popis
            6. Doporučenou cenu (v CZK)
            7. Cílovou skupinu
            
            Odpověz ve formátu JSON s těmito klíči: headline, short_desc, long_desc, bullet_points, seo_title, seo_description, price_suggestion, target_audience."""
        
        response = ollama_client.chat.completions.create(
            model=OLLAMA_MODEL,
            messages=[
                {"role": "system", "content": "Jsi expert na realitní copywriting pro český trh. Vždy odpovídej v JSON formátu."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000,
        )
        
        # Parse JSON response
        content_text = response.choices[0].message.content
        
        # Ollama může vrátit text s JSON uvnitř, takže to zkusíme extrahovat
        try:
            # Najdi JSON v textu (pokud je obalený v ```json ```)
            import re
            json_match = re.search(r'```json\s*(.*?)\s*```', content_text, re.DOTALL)
            if json_match:
                content_text = json_match.group(1)
            
            content = json.loads(content_text)
        except json.JSONDecodeError:
            # Pokud to není validní JSON, vytvoř fallback
            print(f"Ollama nevrátil validní JSON: {content_text[:200]}...")
            content = {
                "headline": "Výjimečný byt - lokální AI generováno",
                "short_desc": "Nemovitost generovaná lokální AI modellem.",
                "long_desc": "Tato nemovitost byla analyzována pomocí lokální AI. Ollama poskytuje bezplatné AI zpracování přímo na vašem počítači.",
                "bullet_points": [
                    "Lokální AI zpracování",
                    "Žádné API poplatky",
                    "Kompletní soukromí dat",
                    "Rychlé zpracování",
                    "Customizovatelné modely"
                ],
                "seo_title": "Nemovitost - AI generováno lokálně",
                "seo_description": "Realitní inzerát generovaný lokální AI pomocí Ollama.",
                "price_suggestion": 4500000,
                "target_audience": "Technologicky zdatní uživatelé",
            }
        
        return {
            "success": True,
            "content": content,
            "model_used": OLLAMA_MODEL,
            "tokens_used": response.usage.total_tokens if hasattr(response, 'usage') else 0
        }
        
    except Exception as e:
        print(f"Error in Ollama content generation: {e}")
        # Fallback to mock content
        return {
            "success": False,
            "content": {
                "headline": "Výjimečný byt (Ollama fallback)",
                "short_desc": "Moderní nemovitost generovaná lokální AI.",
                "long_desc": "Lokální AI model Ollama zpracoval tuto nemovitost. Žádné externí API volání, kompletní soukromí.",
                "bullet_points": [
                    "100% lokální zpracování",
                    "Žádné měsíční poplatky",
                    "Data zůstávají u vás",
                    "Podpora českého jazyka",
                    "Customizovatelné prompty"
                ],
                "seo_title": "Lokální AI realitní inzerát",
                "seo_description": "Inzerát generovaný lokální AI Ollama bez internetového připojení.",
                "price_suggestion": 5000000,
                "target_audience": "Uživatelé preferující soukromí",
            },
            "model_used": "fallback",
            "tokens_used": 0
        }

async def ollama_ai_processing(listing_id: str, zip_url: str) -> List[ProcessingStep]:
    """AI processing pipeline with Ollama"""
    steps = []
    
    # Step 1: Content generation with Ollama
    start_time = time.time()
    print(f"[Ollama] Starting content generation for {listing_id}")
    
    ollama_results = await generate_content_with_ollama(listing_id)
    
    steps.append(ProcessingStep(
        name="content_generation",
        status="COMPLETED",
        duration=f"{time.time() - start_time:.1f}s",
        details={
            "model_used": ollama_results["model_used"],
            "tokens_used": ollama_results.get("tokens_used", 0),
            "content_generated": list(ollama_results["content"].keys()) if ollama_results.get("content") else []
        }
    ))
    print(f"[OK] Content generation completed for {listing_id}")
    
    # Store Ollama results for later use
    steps[-1].details["ollama_content"] = ollama_results.get("content", {})
    
    return steps

# Routes
@app.get("/", tags=["Root"])
async def root():
    return {
        "service": "REALFORGE AI ML Service (Ollama)",
        "version": "2.1.0",
        "status": "operational",
        "ai_models": {
            "ollama": OLLAMA_MODEL,
            "local": True,
            "cost": "free"
        },
        "endpoints": {
            "GET /health": "Service health check",
            "POST /api/v1/process-zip": "Process ZIP file with AI",
            "GET /api/v1/jobs/{job_id}": "Get job status",
            "GET /api/v1/test-ollama": "Test Ollama integration"
        },
        "documentation": "/docs",
    }

@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Health check endpoint"""
    # Check Ollama connection
    ollama_connected = False
    try:
        import requests
        response = requests.get("http://localhost:11434/api/tags", timeout=2)
        ollama_connected = response.status_code == 200
    except:
        ollama_connected = False
    
    return HealthResponse(
        status="ok",
        service="REALFORGE AI ML Service",
        version="2.1.0",
        timestamp=datetime.utcnow().isoformat(),
        uptime=time.time() - app_start_time,
        ollama_connected=ollama_connected,
        ollama_model=OLLAMA_MODEL,
    )

@app.post("/api/v1/process-zip", response_model=ProcessZipResponse, tags=["Processing"])
async def process_zip(request: ProcessZipRequest):
    """Process ZIP file with Ollama AI pipeline"""
    
    # Generate job ID
    job_id = str(uuid.uuid4())
    
    # Create job entry
    job = {
        "id": job_id,
        "listing_id": request.listing_id,
        "status": "processing",
        "created_at": datetime.utcnow().isoformat(),
        "steps": [],
        "progress": 0,
        "zip_url": request.zip_url,
        "metadata": request.metadata,
    }
    jobs[job_id] = job
    
    print(f"[START] Starting Ollama AI processing job {job_id} for listing {request.listing_id}")
    print(f"[ZIP] ZIP URL: {request.zip_url}")
    print(f"[AI] Using Ollama model: {OLLAMA_MODEL}")
    
    # Start processing in background
    asyncio.create_task(process_job_ollama(job_id, request.listing_id, request.zip_url))
    
    # Return immediate response
    return ProcessZipResponse(
        job_id=job_id,
        listing_id=request.listing_id,
        status="queued",
        steps=[
            ProcessingStep(
                name="job_queued",
                status="PENDING",
                duration="0s",
                details={
                    "message": "Job queued for Ollama AI processing",
                    "ai_models": [OLLAMA_MODEL],
                    "local_ai": True,
                    "estimated_time": "5-15 seconds"
                }
            )
        ],
        estimated_completion="5-15 seconds",
        progress_percentage=0,
        created_at=job["created_at"],
    )

@app.get("/api/v1/jobs/{job_id}", tags=["Jobs"])
async def get_job_status(job_id: str):
    """Get status of a processing job"""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = jobs[job_id]
    
    # Calculate progress percentage
    progress = job.get("progress", 0)
    if job["status"] == "completed":
        progress = 100
    
    response_data = {
        "job_id": job_id,
        "listing_id": job["listing_id"],
        "status": job["status"],
        "progress_percentage": progress,
        "steps": job.get("steps", []),
        "created_at": job["created_at"],
        "completed_at": job.get("completed_at"),
        "estimated_completion": "5 seconds remaining" if job["status"] == "processing" else "completed",
    }
    
    # Add AI results if available
    if "ai_results" in job:
        response_data["ai_results"] = job["ai_results"]
    
    return response_data

@app.get("/api/v1/jobs", tags=["Jobs"])
async def list_jobs(limit: int = 10):
    """List recent processing jobs"""
    job_list = list(jobs.values())
    job_list.sort(key=lambda x: x["created_at"], reverse=True)
    
    return {
        "jobs": job_list[:limit],
        "total": len(jobs),
        "active": len([j for j in jobs.values() if j["status"] == "processing"]),
        "completed": len([j for j in jobs.values() if j["status"] == "completed"]),
        "ai_models_used": OLLAMA_MODEL,
        "local_ai": True,
    }

# Background task with Ollama AI
async def process_job_ollama(job_id: str, listing_id: str, zip_url: str):
    """Background task to process job with Ollama AI"""
    try:
        job = jobs[job_id]
        
        # Update job status
        job["status"] = "processing"
        job["progress"] = 50
        
        # Ollama AI processing
        steps = await ollama_ai_processing(listing_id, zip_url)
        job["steps"] = steps
        job["progress"] = 90
        
        # Extract Ollama content from steps
        ollama_content = {}
        for step in steps:
            if step.name == "content_generation" and step.details and "ollama_content" in step.details:
                ollama_content = step.details["ollama_content"]
                break
        
        # Store AI results
        job["ai_results"] = ollama_content
        job["progress"] = 100
        
        # Mark as completed
        job["status"] = "completed"
        job["completed_at"] = datetime.utcnow().isoformat()
        
        print(f"[DONE] Job {job_id} completed successfully with Ollama AI")
        print(f"[AI] Generated content: {list(ollama_content.keys())}")
        
    except Exception as e:
        print(f"[ERROR] Job {job_id} failed: {str(e)}")
        job["status"] = "failed"
        job["error"] = str(e)
        job["completed_at"] = datetime.utcnow().isoformat()

# Test endpoint for Ollama
@app.get("/api/v1/test-ollama", tags=["Testing"])
async def test_ollama():
    """Test Ollama integration"""
    try:
        # Test Ollama connection
        import requests
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        
        if response.status_code == 200:
            models = response.json().get("models", [])
            model_names = [m['name'] for m in models]
            
            # Try to generate a simple response
            test_prompt = "Say 'Ollama is working' in Czech."
            
            ollama_response = ollama_client.chat.completions.create(
                model=OLLAMA_MODEL,
                messages=[{"role": "user", "content": test_prompt}],
                max_tokens=20,
                temperature=0.1,
            )
            
            response_text = ollama_response.choices[0].message.content
            
            return {
                "status": "ok",
                "ollama": {
                    "connected": True,
                    "available_models": model_names,
                    "selected_model": OLLAMA_MODEL,
                    "model_in_list": OLLAMA_MODEL in model_names,
                    "test_response": response_text,
                },
                "service": {
                    "name": "REALFORGE AI ML Service",
                    "version": "2.1.0",
                    "local_ai": True,
                }
            }
        else:
            return {
                "status": "error",
                "ollama": {
                    "connected": False,
                    "error": f"Ollama API returned status {response.status_code}"
                },
                "instructions": "Install Ollama from https://ollama.com and run: ollama pull llama3.2"
            }
            
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "ollama": {"connected": False},
            "instructions": "Make sure Ollama is running: ollama serve"
        }

# Run with: uvicorn app_ollama:app --host 0.0.0.0 --port 8001 --reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app_ollama:app",
        host="0.0.0.0",
        port=8001,  # Different port to avoid conflict with other ML service
        reload=True,
        log_level="info",
    )
