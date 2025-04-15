from ai_agent.summarizer import DocumentSummarizer
from flask import Flask, request, jsonify
from flask_cors import CORS
import hashlib
import sys
import os
from werkzeug.utils import secure_filename
import time
import subprocess
from ai_agent.recommedPapers import SearchPapers

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database.query_auth import create_user, check_user_exists, verify_user

# Setup Google API Key
os.environ["GOOGLE_API_KEY"] = "AIzaSyCxvk44WZFXY-fWlAi-5d3MYKU56NoWJTE"
# Now import from the database folder

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes


@app.route('/signup', methods=['POST'])
def signup():
    data = request.json

    # Extract user data
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    first_name = data.get('firstName')
    last_name = data.get('lastName')

    # Validate input
    if not all([username, email, password]):
        return jsonify({"status": "error", "message": "Missing required fields"}), 400

    # Check if username or email already exists
    existing = check_user_exists(username=username, email=email)
    if existing.get("username_exists"):
        return jsonify({"status": "error", "message": "Username already exists"}), 400
    if existing.get("email_exists"):
        return jsonify({"status": "error", "message": "Email already exists"}), 400

    # Hash the password
    password_hash = hashlib.sha256(password.encode()).hexdigest()

    # Create user
    result = create_user(username, email, password_hash, first_name, last_name)

    if result.get("status") == "success":
        return jsonify(result), 201
    else:
        return jsonify(result), 400


@app.route('/login', methods=['POST'])
def login():
    data = request.json

    # Extract login data
    identifier = data.get('identifier')  # Changed from email to identifier
    password = data.get('password')

    # Validate input
    if not all([identifier, password]):
        return jsonify({"status": "error", "message": "Missing identifier or password"}), 400

    # Hash the password (use the same hashing method as in signup)
    password_hash = hashlib.sha256(password.encode()).hexdigest()

    # Verify user credentials
    result = verify_user(identifier, password_hash)

    if result.get("status") == "success":
        return jsonify(result), 200
    else:
        return jsonify(result), 401


@app.route('/upload-pdf', methods=['POST'])
def upload_pdf():
    if 'file' not in request.files:
        return jsonify({"status": "error", "message": "No file part"}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({"status": "error", "message": "No selected file"}), 400

    if file and file.filename.endswith('.pdf'):
        # Create upload directory if it doesn't exist
        current_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(current_dir)  # Go up 1 level
        upload_dir = os.path.join(project_root, 'uploads', 'sum_uploads')

        if not os.path.exists(upload_dir):
            os.makedirs(upload_dir)

        # Secure the filename and save the file
        filename = secure_filename(file.filename)
        timestamp = str(int(time.time()))
        saved_filename = f"{timestamp}_{filename}"
        file_path = os.path.join(upload_dir, saved_filename)

        file.save(file_path)

        try:
            # Initialize the summarizer
            summarizer = DocumentSummarizer()

            # Process the document and get summary
            summary = ""
            for chunk in summarizer.summarizer(file_path):
                summary += chunk

            return jsonify({
                "status": "success",
                "message": "File uploaded and summarized",
                "filename": saved_filename,
                "path": file_path,
                "summary": summary
            }), 200

        except Exception as e:
            print(f"Error: {str(e)}")
            return jsonify({
                "status": "success",
                "message": "File uploaded but error occurred during summarization",
                "filename": saved_filename,
                "path": file_path,
                "error": str(e)
            }), 200

    return jsonify({"status": "error", "message": "File must be a PDF"}), 400

@app.route('/api/questions/ask', methods=['POST'])
def ask_question():
    # Check if 'question' is in the request
    if 'question' not in request.form:
        return jsonify({"status": "error", "message": "No question provided"}), 400

    question = request.form['question']

    # Handle PDF upload
    if 'pdf' in request.files:
        pdf_file = request.files['pdf']

        if pdf_file.filename == '':
            return jsonify({"status": "error", "message": "No selected file"}), 400

        if pdf_file and pdf_file.filename.endswith('.pdf'):
            # Create upload directory if it doesn't exist
            current_dir = os.path.dirname(os.path.abspath(__file__))
            project_root = os.path.dirname(current_dir)  # Go up 1 level
            upload_dir = os.path.join(project_root, 'uploads', 'qa_uploads')

            if not os.path.exists(upload_dir):
                os.makedirs(upload_dir)

            # Secure the filename and save the file
            filename = secure_filename(pdf_file.filename)
            timestamp = str(int(time.time()))
            saved_filename = f"{timestamp}_{filename}"
            file_path = os.path.join(upload_dir, saved_filename)

            pdf_file.save(file_path)

            # Construct path to your QA script
            qa_script_path = os.path.join(project_root, 'ai_agent', 'qa_model.py')

            try:
                # Execute the QA script with the PDF path and question as arguments
                result = subprocess.run(
                    ['python', qa_script_path, file_path, question],
                    capture_output=True,
                    text=True,
                    check=False,
                    encoding='utf-8'
                )

                # Process the output
                output = result.stdout.strip()

                # If there's an error, check stderr
                if not output and result.stderr:
                    return jsonify({
                        "status": "error",
                        "message": "Error processing question",
                        "error": result.stderr
                    }), 500

                return jsonify({
                    "status": "success",
                    "answer": output,
                    "filename": saved_filename
                }), 200

            except Exception as e:
                print(f"Error running QA model: {str(e)}")
                return jsonify({
                    "status": "error",
                    "message": "Error processing question",
                    "error": str(e)
                }), 500

    # Handle URL input
    elif 'url' in request.form:
        url = request.form['url']

        # Construct path to your QA script for URLs
        current_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(current_dir)
        qa_url_script_path = os.path.join(project_root, 'ai_agent', 'qa_url_model.py')

        try:
            # Execute the QA script with the URL and question as arguments
            result = subprocess.run(
                ['python', qa_url_script_path, url, question],
                capture_output=True,
                text=True,
                check=False,
                encoding='utf-8'
            )

            # Process the output
            output = result.stdout.strip()

            # If there's an error, check stderr
            if not output and result.stderr:
                return jsonify({
                    "status": "error",
                    "message": "Error processing question",
                    "error": result.stderr
                }), 500

            return jsonify({
                "status": "success",
                "answer": output
            }), 200

        except Exception as e:
            print(f"Error running QA model for URL: {str(e)}")
            return jsonify({
                "status": "error",
                "message": "Error processing question",
                "error": str(e)
            }), 500

    else:
        return jsonify({"status": "error", "message": "No PDF or URL provided"}), 400


@app.route('/recommend-papers', methods=['POST'])
def get_recommendations():
    data = request.json
    topic = data.get('topic')

    if not topic:
        return jsonify({"status": "error", "message": "No topic provided"}), 400

    try:
        # Initialize the Websearch class
        sp = SearchPapers()

        # Get search results
        results = sp.getResults(query=topic)
        print("[DEBUG] Results: ", results)

        # Format results into markdown
        markdown_results = f"## Research Papers on {topic}\n\n"

        for result in results:
            title = result.get('title', 'No Title')
            link = result.get('href', '#')
            snippet = result.get('body', 'No Description')

            markdown_results += f"### [{title}]({link})\n"
            markdown_results += f"{snippet}\n\n"

        return jsonify({
            "status": "success",
            "markdown": markdown_results,
            "raw_results": results
        }), 200

    except Exception as e:
        print(f"Error in recommendation: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "Error processing recommendation",
            "error": str(e)
        }), 500


if __name__ == '__main__':
    app.run(debug=True)