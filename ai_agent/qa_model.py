import sys
import os
from transformers import pipeline
import fitz  # PyMuPDF
import torch
import re


def extract_text_from_pdf(pdf_path):
    """Extract text from a PDF file."""
    text = ""
    try:
        # Open the PDF
        doc = fitz.open(pdf_path)

        # Iterate through each page
        for page_num in range(len(doc)):
            page = doc[page_num]
            text += page.get_text()

        # Close the document
        doc.close()

        return text
    except Exception as e:
        print(f"Error extracting text from PDF: {str(e)}")
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


def answer_question(pdf_path, question):
    """Answer a question based on the PDF content using Hugging Face model."""
    try:
        # Extract text from PDF
        text = extract_text_from_pdf(pdf_path)

        if not text:
            return "Could not extract text from the PDF."

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
        print("Usage: python qa_model.py <pdf_path> <question>")
        sys.exit(1)

    pdf_path = sys.argv[1]
    question = sys.argv[2]

    if not os.path.exists(pdf_path):
        print(f"PDF file not found: {pdf_path}")
        sys.exit(1)

    answer = answer_question(pdf_path, question)
    print(answer)


if __name__ == "__main__":
    main()