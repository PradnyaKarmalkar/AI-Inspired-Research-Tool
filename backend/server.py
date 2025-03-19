import os
from fastapi import FastAPI
from pydantic import BaseModel
from qa_model import get_gemma_response
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

HUGGINGFACE_API_KEY = os.getenv("HF_API_KEY")

if not HUGGINGFACE_API_KEY:
    raise ValueError("❌ API Key is missing! Set it in a .env file or as an environment variable.")

@app.get("/")
def read_root():
    return {"message": "Server is running!"}

class QueryRequest(BaseModel):
    prompt: str

@app.post("/generate")
def generate_text(request: QueryRequest):
    response = get_gemma_response(request.prompt, HUGGINGFACE_API_KEY)
    return {"response": response}

# Run server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8090)
