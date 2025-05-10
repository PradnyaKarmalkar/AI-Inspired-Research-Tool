CHUNK_SIZE=1500
CHUNK_OVERLAP=150

REPORT_CHUNK_SIZE=2000
REPORT_CHUNK_OVERLAP=200

QA_CHUNK_SIZE=1000
QA_CHUNK_OVERLAP=200


# Available models for each feature
AVAILABLE_SUMMARIZER_MODELS = {
    "gemini-2.0-flash": "Fast and efficient summarization",
    "gemini-2.5-pro-exp-03-25": "High-quality detailed summarization"
}

AVAILABLE_REPORT_MODELS = {
    "gemini-2.0-flash": "Fast report generation",
    "gemini-2.5-pro-exp-03-25": "Detailed and comprehensive reports"
}

AVAILABLE_QA_MODELS = {
    "Llama3-8b-8192": "Fast question answering",
    "gemini-2.5-pro-exp-03-25": "Detailed and accurate answers"
}

# Default models (can be overridden by user selection)
SUMMARIZER_MODEL = "gemini-2.5-pro-exp-03-25"
REPORT_MODEL = "gemini-2.0-flash"
QA_MODEL = "Llama3-8b-8192"
EMBED_MODEL = "models/embedding-001"

# Search Papers params
REGION = "us-en"  # Region code, e.g., 'us-en' for United States
SAFESEARCH = "moderate"  # Safesearch setting: 'on', 'moderate', or 'off'
TIMELIMIT = "m"  # Time limit: 'd' (day), 'w' (week), 'm' (month), 'y' (year)
BACKEND = "auto"  # Backend to use: 'api', 'html', or 'lite'
MAX_RESULTS = 5  # Maximum number of results to retrieve
