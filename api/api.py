import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from core_module.summarizer import DocumentSummarizer
from flask import Flask, request, jsonify, make_response, send_from_directory
from flask_cors import CORS
import hashlib


from werkzeug.utils import secure_filename
import time
import subprocess
from core_module.recommedPapers import SearchPapers
from dotenv import load_dotenv

# Add the parent directory to the Python path
from database.query_auth import create_user, check_user_exists, verify_user, update_profile_path, update_password    

# Load environment variables safely
load_dotenv()
# Setup Google API Key
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if GOOGLE_API_KEY:
    os.environ["GOOGLE_API_KEY"] = GOOGLE_API_KEY
else:
    print("WARNING: GOOGLE_API_KEY not found in environment variables")

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Accept", "Authorization"],
        "supports_credentials": True
    }
})

# Increase max content length for file uploads
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB
app.config['UPLOAD_FOLDER'] = 'uploads/report_uploads'

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# File upload configuration
ALLOWED_EXTENSIONS = {'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

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
        # Get the user's profile image URL
        user_id = result.get('user', {}).get('user_id')
        if user_id:
            # Get the project root directory
            current_dir = os.path.dirname(os.path.abspath(__file__))
            project_root = os.path.dirname(current_dir)
            profile_dir = os.path.join(project_root, 'profile_dir', user_id)

            # Check if user has a profile image
            if os.path.exists(profile_dir):
                files = [f for f in os.listdir(profile_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif'))]
                if files:
                    # Sort by timestamp (newest first)
                    files.sort(reverse=True)
                    # Add profile image URL to the response
                    result['user']['profileImage'] = f'/get-profile-image/{user_id}'

        return jsonify(result), 200
    else:
        return jsonify(result), 401
    
@app.route('/upload-profile-image', methods=['POST'])
def upload_profile_image():
    try:
        if 'file' not in request.files:
            return jsonify({"status": "error", "message": "No file part"}), 400

        file = request.files['file']
        user_id = request.form.get('user_id')

        if not user_id:
            return jsonify({"status": "error", "message": "User ID is required"}), 400

        if file.filename == '':
            return jsonify({"status": "error", "message": "No selected file"}), 400

        if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
            return jsonify({"status": "error", "message": "Invalid file type. Only images are allowed"}), 400

        # Get the project root directory
        current_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(current_dir)
        
        # Create user-specific profile directory
        profile_dir = os.path.join(project_root, 'profile_dir', user_id)
        os.makedirs(profile_dir, exist_ok=True)

        # Generate a unique filename
        filename = secure_filename(file.filename)
        timestamp = str(int(time.time()))
        saved_filename = f"{timestamp}_{filename}"
        file_path = os.path.join(profile_dir, saved_filename)

        # Save the file
        file.save(file_path)

        # Update the profile path in the database
        result = update_profile_path(user_id, file_path)

        if result.get("status") == "success":
            return jsonify({
                "status": "success",
                "message": "Profile image uploaded successfully",
                "profile_path": file_path
            }), 200
        else:
            return jsonify(result), 400

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Error uploading profile image: {str(e)}"
        }), 500

@app.route('/get-profile-image/<user_id>', methods=['GET'])
def get_profile_image(user_id):
    try:
        # Get the project root directory
        current_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(current_dir)
        profile_dir = os.path.join(project_root, 'profile_dir', user_id)

        # Get the most recent image file in the user's profile directory
        if os.path.exists(profile_dir):
            files = [f for f in os.listdir(profile_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif'))]
            if files:
                # Sort by timestamp (newest first)
                files.sort(reverse=True)
                latest_file = files[0]
                return send_from_directory(profile_dir, latest_file)
        
        return jsonify({"status": "error", "message": "No profile image found"}), 404

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Error retrieving profile image: {str(e)}"
        }), 500

@app.route('/upload-pdf-sum', methods=['POST'])
def upload_pdf_sum():
    if 'file' not in request.files:
        return jsonify({"status": "error", "message": "No file part"}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({"status": "error", "message": "No selected file"}), 400

    if not allowed_file(file.filename):
        return jsonify({"status": "error", "message": "File must be a PDF"}), 400

    try:
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

    except Exception as e:
        return jsonify({
            "status": "error", 
            "message": f"Error during upload: {str(e)}"
        }), 500

@app.route('/upload-pdf-qa', methods=['POST'])
def upload_pdf_qa():    
    try:
        if 'file' not in request.files:
            return jsonify({"status": "error", "message": "No file part"}), 400

        file = request.files['file']

        if file.filename == '':
            return jsonify({"status": "error", "message": "No selected file"}), 400
            
        if not allowed_file(file.filename):
            return jsonify({"status": "error", "message": "File must be a PDF"}), 400

        # Check file size 
        if request.content_length > app.config['MAX_CONTENT_LENGTH']:
            return jsonify({"status": "error", "message": "File too large (max 16MB)"}), 413

        # Create upload directory if it doesn't exist
        current_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(current_dir)  # Go up 1 level
        upload_dir = os.path.join(project_root, 'core_module', 'documents')

        # Ensure the directory exists and is writable
        try:
            os.makedirs(upload_dir, exist_ok=True)
            if not os.access(upload_dir, os.W_OK):
                return jsonify({
                    "status": "error",
                    "message": "Upload directory is not writable"
                }), 500
        except Exception as e:
            return jsonify({
                "status": "error",
                "message": f"Failed to create upload directory: {str(e)}"
            }), 500

        # Secure the filename and save the file
        filename = secure_filename(file.filename)
        timestamp = str(int(time.time()))
        saved_filename = f"{timestamp}_{filename}"
        file_path = os.path.join(upload_dir, saved_filename)

        try:
            file.save(file_path)
        except Exception as e:
            return jsonify({
                "status": "error",
                "message": f"Failed to save file: {str(e)}"
            }), 500
    
        try:
            from core_module.qa_model import QAModel
            
            # Initialize the QA model
            qa_model = QAModel()

            # Process the document and store in vector db
            result = qa_model.process_uploaded_file(file_path)
            
            if result is None:
                # Clean up the uploaded file if processing fails
                if os.path.exists(file_path):
                    try:
                        os.remove(file_path)
                    except:
                        pass
                        
                return jsonify({
                    "status": "error",
                    "message": "Document appears to be empty or unreadable"
                }), 400
                
            return jsonify({
                "status": "success",
                "message": "Document processed successfully and ready for questions",
                "filename": saved_filename
            }), 200

        except Exception as e:
            # Clean up the uploaded file if processing fails
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except:
                    pass
            
            return jsonify({
                "status": "error",
                "message": f"Error processing document: {str(e)}"
            }), 500

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Unexpected error: {str(e)}"
        }), 500

@app.route('/check-documents', methods=['GET'])
def check_documents():
    try:
        from core_module.qa_model import QAModel
        
        # Initialize the QA model and check for documents
        qa_model = QAModel()
        has_docs = qa_model.has_documents()
        
        return jsonify({
            "status": "success",
            "has_documents": has_docs
        }), 200
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Error checking documents: {str(e)}"
        }), 500

@app.route('/api/questions/ask', methods=['POST'])
def ask_question():
    data = request.json
    question = data.get('question')

    if not question:
        return jsonify({"status": "error", "message": "No question provided"}), 400

    try:
        from core_module.qa_model import QAModel
        
        # Initialize the QA model
        qa_model = QAModel()
        
        # Check if documents exist
        if not qa_model.has_documents():
            return jsonify({
                "status": "error",
                "message": "No documents found. Please upload PDF documents first."
            }), 400
            
        # Get answer from the model
        answer = qa_model.answer_question(question)
        
        return jsonify({
            "status": "success",
            "answer": answer
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Error processing question",
            "error": str(e)
        }), 500


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

@app.route('/api/upload-pdf-report', methods=['POST', 'OPTIONS'])
def upload_pdf_report():
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response
        
    try:
        if 'pdf' not in request.files:
            return jsonify({"status": "error", "message": "No file part"}), 400

        file = request.files['pdf']
        filename = request.form.get('filename', '')
        num_pages = request.form.get('numPages', '3')
        
        if file.filename == '':
            return jsonify({"status": "error", "message": "No selected file"}), 400

        if not allowed_file(file.filename):
            return jsonify({"status": "error", "message": "File must be a PDF"}), 400

        try:
            num_pages = int(num_pages)
            if num_pages < 1 or num_pages > 10:
                num_pages = 3
        except ValueError:
            num_pages = 3

        # Create a unique filename
        timestamp = str(int(time.time()))
        saved_filename = f"{timestamp}_{secure_filename(filename or file.filename)}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], saved_filename)

        # Save the file
        file.save(file_path)
        print(f"File saved to: {file_path}")  # Debug log

        # Generate the report
        try:
            from core_module.report_generator import ReportGenerator
            
            # Initialize the summarizer
            reportGenerator = ReportGenerator()

            # Process the document and get summary
            report = ""
            for chunk in reportGenerator.generate_report(file_path):
                report += chunk

            return jsonify({
                "status": "success",
                "message": "File uploaded and report generated",
                "filename": saved_filename,
                "path": file_path,
                "report": report
            }), 200

        except Exception as e:
            print(f"Error: {str(e)}")
            return jsonify({
                "status": "success",
                "message": "File uploaded but error occurred during report generation",
                "filename": saved_filename,
                "path": file_path,
                "error": str(e)
            }), 200

    except Exception as e:
        print(f"Error during upload: {str(e)}")
        return jsonify({
            "status": "error", 
            "message": f"Error during upload: {str(e)}"
        }), 500

@app.route('/remove-profile-image/<user_id>', methods=['DELETE'])
def remove_profile_image(user_id):
    try:
        # Get the project root directory
        current_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(current_dir)
        profile_dir = os.path.join(project_root, 'profile_dir', user_id)

        # Remove all files in the user's profile directory
        if os.path.exists(profile_dir):
            for file in os.listdir(profile_dir):
                file_path = os.path.join(profile_dir, file)
                try:
                    if os.path.isfile(file_path):
                        os.unlink(file_path)
                except Exception as e:
                    print(f"Error deleting {file_path}: {e}")

        # Update the profile path in the database to null
        result = update_profile_path(user_id, None)

        if result.get("status") == "success":
            return jsonify({
                "status": "success",
                "message": "Profile image removed successfully"
            }), 200
        else:
            return jsonify(result), 400

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Error removing profile image: {str(e)}"
        }), 500

@app.route('/change-password', methods=['POST'])
def change_password():
    try:
        data = request.json
        user_id = data.get('user_id')
        current_password = data.get('current_password')
        new_password = data.get('new_password')

        if not all([user_id, current_password, new_password]):
            return jsonify({"status": "error", "message": "Missing required fields"}), 400

        # Call the update_password function
        result = update_password(user_id, current_password, new_password)
        
        if result.get("status") == "success":
            return jsonify(result), 200
        else:
            return jsonify(result), 400

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Error changing password: {str(e)}"
        }), 500

if __name__ == '__main__':
    app.run(debug=True)