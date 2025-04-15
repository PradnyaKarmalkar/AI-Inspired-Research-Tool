CHUNK_SIZE=1500
CHUNK_OVERLAP=150
SUMMARIZER_MODEL="gemini-2.0-flash"
EMBED_MODEL="models/embedding-001"

# Search Papers params
REGION = "us-en"  # Region code, e.g., 'us-en' for United States
SAFESEARCH = "moderate"  # Safesearch setting: 'on', 'moderate', or 'off'
TIMELIMIT = "m"  # Time limit: 'd' (day), 'w' (week), 'm' (month), 'y' (year)
BACKEND = "auto"  # Backend to use: 'api', 'html', or 'lite'
MAX_RESULTS = 5  # Maximum number of results to retrieve