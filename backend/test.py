import os
import requests
from dotenv import load_dotenv
import json


class GroqChat:
    def __init__(self):
        # Load environment variables from .env file
        load_dotenv()

        # Get API key from environment variables
        self.api_key = os.getenv("API_KEY")
        if not self.api_key:
            raise ValueError("API_KEY not found in .env file")

        # Groq API endpoint for Llama 70B
        self.api_url = "https://api.groq.com/openai/v1/chat/completions"

        # Model name
        self.model = "llama-70b-chat"

        # Store conversation history
        self.conversation_history = []

    def send_message(self, user_message):
        # Add user message to conversation history
        self.conversation_history.append({"role": "user", "content": user_message})

        # Prepare headers
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        # Prepare data
        data = {
            "model": self.model,
            "messages": self.conversation_history
        }

        try:
            # Send request to Groq API
            response = requests.post(self.api_url, headers=headers, json=data)
            response.raise_for_status()  # Raise exception for 4XX/5XX responses

            # Parse response
            result = response.json()
            assistant_message = result["choices"][0]["message"]["content"]

            # Add assistant response to conversation history
            self.conversation_history.append({"role": "assistant", "content": assistant_message})

            return assistant_message

        except Exception as e:
            return f"Error: {str(e)}"

    def start_chat(self):
        print("Welcome to Groq Chat with Llama 70B model!")
        print("Type 'exit' to end the conversation.")
        print("-" * 50)

        while True:
            user_input = input("You: ")

            if user_input.lower() == "exit":
                print("Goodbye!")
                break

            assistant_response = self.send_message(user_input)
            print("\nAssistant:", assistant_response, "\n")


if __name__ == "__main__":
    chat = GroqChat()
    chat.start_chat()