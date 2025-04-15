import sys
import os
import requests
from bs4 import BeautifulSoup
from transformers import pipeline
import torch
import re


def extract_text_from_url(url):
    """Extract text from a URL."""
    try:
        # Send a GET request to the URL
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()  # Raise an exception for bad status codes

        # Parse the HTML content
        soup = BeautifulSoup(response.text, 'html.parser')

        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.extract()

        # Get text
        text = soup.get_text()

        return text
    except Exception as e:
        print(f"Error extracting text from URL: {str(e)}")
        return ""


def preprocess_text(text):
    """Clean and preprocess the extracted text."""
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()

    # Split into chunks if text is too long
    max_length = 1000  # Adjust based on model requirements
    chunks = []

    if len(text) > max_length:
        # Simple chunking strategy
        words = text.split()
        current_chunk = []
        current_length = 0

        for word in words:
            if current_length + len(word) + 1 <= max_length:
                current_chunk.append(word)
                current_length += len(word) + 1
            else:
                chunks.append(' '.join(current_chunk))
                current_chunk = [word]
                current_length = len(word)

        if current_chunk:
            chunks.append(' '.join(current_chunk))
    else:
        chunks = [text]

    return chunks


def answer_question(url, question):
    """Answer a question about the URL content using Hugging Face model."""
    try:
        # Extract text from URL
        text = extract_text_from_url(url)

        if not text:
            return "Could not extract text from the URL."

        # Preprocess the text
        chunks = preprocess_text(text)

        # Initialize the QA pipeline
        qa_pipeline = pipeline(
            "question-answering",
            model="distilbert-base-cased-distilled-squad",  # Can be changed to other models
            tokenizer="distilbert-base-cased-distilled-squad",
            device=0 if torch.cuda.is_available() else -1
        )

        # Process chunks and get the best answer
        best_score = -1
        best_answer = "No answer found in the document."

        for chunk in chunks:
            result = qa_pipeline(question=question, context=chunk)

            if result["score"] > best_score:
                best_score = result["score"]
                best_answer = result["answer"]

        return best_answer

    except Exception as e:
        print(f"Error in answer_question: {str(e)}")
        return f"Error processing question: {str(e)}"


def main():
    if len(sys.argv) != 3:
        print("Usage: python qa_url_model.py <url> <question>")
        sys.exit(1)

    url = sys.argv[1]
    question = sys.argv[2]

    answer = answer_question(url, question)
    print(answer)


if __name__ == "__main__":
    main()