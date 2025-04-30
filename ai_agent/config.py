CHUNK_SIZE=1500
CHUNK_OVERLAP=150

REPORT_CHUNK_SIZE=2000
REPORT_CHUNK_OVERLAP=200

# SUMMARIZER_MODEL="gemini-2.0-flash"
SUMMARIZER_MODEL="gemini-2.5-pro-exp-03-25"
EMBED_MODEL="models/embedding-001"

REPORT_MODEL="gemini-2.5-pro-exp-03-25"
# Search Papers params
REGION = "us-en"  # Region code, e.g., 'us-en' for United States
SAFESEARCH = "moderate"  # Safesearch setting: 'on', 'moderate', or 'off'
TIMELIMIT = "m"  # Time limit: 'd' (day), 'w' (week), 'm' (month), 'y' (year)
BACKEND = "auto"  # Backend to use: 'api', 'html', or 'lite'
MAX_RESULTS = 5  # Maximum number of results to retrieve

# Q&A params
QA_MODEL = "Llama3-8b-8192"
