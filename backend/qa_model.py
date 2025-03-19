import requests
import os
from dotenv import load_dotenv

# Load API key from .env
load_dotenv()
HF_API_KEY = os.getenv("HF_API_KEY")

# Hugging Face API URL for Gemma-7B
HF_MODEL_URL = "https://huggingface.co/google/gemma-7b"


def get_gemma_response(prompt):
    """ Sends a request to Hugging Face API to get a response from Gemma-7B """

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
            # Some models return output as a list of dictionaries
            response_json = response.json()

            if isinstance(response_json, list) and "generated_text" in response_json[0]:
                return response_json[0]["generated_text"]
            elif isinstance(response_json, dict) and "text" in response_json:
                return response_json["text"]
            else:
                return "Error: Unexpected response format from Hugging Face API."

        elif response.status_code == 401:
            return "Error: Unauthorized. Please check your Hugging Face API key."

        elif response.status_code == 503:
            return "Error: Model is loading or unavailable. Try again later."

        else:
            return f"Error: {response.status_code}, {response.text}"

    except requests.exceptions.Timeout:
        return "Error: Request timed out. The API might be overloaded."

    except requests.exceptions.RequestException as e:
        return f"Error: {str(e)}"
