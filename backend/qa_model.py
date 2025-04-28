import requests
import os
from dotenv import load_dotenv
from document_processor import DocumentProcessor
import tempfile

# Load API key from .env
load_dotenv()
HF_API_KEY = os.getenv("HF_API_KEY")

# Hugging Face API URL for Gemma-7B
HF_MODEL_URL = "https://huggingface.co/google/gemma-7b"

class QAModel:
    def __init__(self):
        self.document_processor = DocumentProcessor()
        self.current_document = None

    def process_document(self, file_path: str) -> dict:
        """Process a document and store it in the vector database"""
        success = self.document_processor.process_document(file_path)
        if success:
            self.current_document = file_path
            return {"status": "success", "message": "Document processed successfully"}
        return {"status": "error", "message": "Failed to process document"}

    def get_answer(self, question: str) -> dict:
        """Get answer for a question based on the processed document"""
        if not self.current_document:
            return {"status": "error", "message": "No document has been processed yet"}

        # Get relevant context from the document
        context = self.document_processor.query_document(question)
        if not context:
            return {"status": "error", "message": "Failed to retrieve relevant context"}

        # Construct prompt with context
        prompt = f"""Based on the following context, please answer the question. 
        If the answer cannot be found in the context, say "I cannot find the answer in the provided document."

        Context:
        {context}

        Question: {question}

        Answer:"""

        # Get response from LLM
        response = self._get_gemma_response(prompt)
        return {"status": "success", "answer": response}

    def _get_gemma_response(self, prompt: str) -> str:
        """Get response from Gemma-7B model"""
        if not HF_API_KEY:
            return "Error: Missing Hugging Face API key. Please set it in your .env file."

        headers = {
            "Authorization": f"Bearer {HF_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {"inputs": prompt}

        try:
            response = requests.post(HF_MODEL_URL, headers=headers, json=payload, timeout=30)

            if response.status_code == 200:
                response_json = response.json()
                if isinstance(response_json, list) and "generated_text" in response_json[0]:
                    return response_json[0]["generated_text"]
                elif isinstance(response_json, dict) and "text" in response_json:
                    return response_json["text"]
                else:
                    return "Error: Unexpected response format from Hugging Face API."
            else:
                return f"Error: {response.status_code}, {response.text}"

        except requests.exceptions.Timeout:
            return "Error: Request timed out. The API might be overloaded."
        except requests.exceptions.RequestException as e:
            return f"Error: {str(e)}"
