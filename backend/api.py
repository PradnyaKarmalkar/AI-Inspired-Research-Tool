from flask import Flask, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
import os
from qa_model import QAModel
import tempfile
import bcrypt
from flask_cors import CORS
import uuid

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})  # Enable CORS for all routes
qa_model = QAModel()

# Configure upload folders
UPLOAD_FOLDER = 'uploads'
PROFILE_PHOTOS_FOLDER = 'profile_photos'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROFILE_PHOTOS_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['PROFILE_PHOTOS_FOLDER'] = PROFILE_PHOTOS_FOLDER

ALLOWED_EXTENSIONS = {'pdf'}
ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename, allowed_extensions):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

@app.route('/api/update-password', methods=['POST'])
def update_password():
    try:
        data = request.get_json()
        print("Received data:", data)  # Debug log
        
        if not data or 'currentPassword' not in data or 'newPassword' not in data:
            return jsonify({'status': 'error', 'message': 'Missing required fields'}), 400

        # Get user from request
        user = data.get('user')
        if not user:
            return jsonify({'status': 'error', 'message': 'User not found'}), 404

        # Verify current password
        if user.get('password') != data['currentPassword']:
            return jsonify({'status': 'error', 'message': 'Current password is incorrect'}), 401

        # Update password
        user['password'] = data['newPassword']
        
        return jsonify({
            'status': 'success',
            'message': 'Password updated successfully',
            'user': user
        })
    except Exception as e:
        print("Error:", str(e))  # Debug log
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'status': 'error', 'message': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'status': 'error', 'message': 'No selected file'}), 400
    
    if file and allowed_file(file.filename, ALLOWED_EXTENSIONS):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        # Process the document
        result = qa_model.process_document(file_path)
        
        if result['status'] == 'success':
            return jsonify({'status': 'success', 'message': 'Document processed successfully'})
        else:
            return jsonify(result), 500
    
    return jsonify({'status': 'error', 'message': 'Invalid file type'}), 400

@app.route('/api/ask', methods=['POST'])
def ask_question():
    data = request.get_json()
    if not data or 'question' not in data:
        return jsonify({'status': 'error', 'message': 'No question provided'}), 400
    
    question = data['question']
    result = qa_model.get_answer(question)
    
    if result['status'] == 'success':
        return jsonify(result)
    else:
        return jsonify(result), 400

@app.route('/api/upload-profile-photo', methods=['POST'])
def upload_profile_photo():
    try:
        if 'file' not in request.files:
            return jsonify({'status': 'error', 'message': 'No file part'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'status': 'error', 'message': 'No selected file'}), 400
        
        if file and allowed_file(file.filename, ALLOWED_IMAGE_EXTENSIONS):
            # Generate unique filename
            filename = f"{uuid.uuid4()}_{secure_filename(file.filename)}"
            file_path = os.path.join(app.config['PROFILE_PHOTOS_FOLDER'], filename)
            file.save(file_path)
            
            # Get user from request
            user = request.form.get('user')
            if user:
                user = eval(user)  # Convert string to dict
                user['profilePhoto'] = filename
                
                return jsonify({
                    'status': 'success',
                    'message': 'Profile photo uploaded successfully',
                    'user': user,
                    'photoUrl': f'/api/profile-photo/{filename}'
                })
            else:
                return jsonify({'status': 'error', 'message': 'User not found'}), 404
        
        return jsonify({'status': 'error', 'message': 'Invalid file type'}), 400
    except Exception as e:
        print("Error:", str(e))
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/profile-photo/<filename>')
def get_profile_photo(filename):
    return send_from_directory(app.config['PROFILE_PHOTOS_FOLDER'], filename)

@app.route('/api/history', methods=['GET'])
def get_history():
    try:
        user_id = request.args.get('userId')
        if not user_id:
            return jsonify({'status': 'error', 'message': 'User ID is required'}), 400

        # In a real application, you would fetch this from a database
        # For now, we'll return some mock data
        mock_history = [
            {
                'id': '1',
                'type': 'question',
                'content': 'What are the main findings of this paper?',
                'timestamp': '2024-04-28T10:00:00Z',
                'response': 'The paper discusses three main findings...'
            },
            {
                'id': '2',
                'type': 'summary',
                'content': 'Summarize the methodology section',
                'timestamp': '2024-04-28T09:30:00Z',
                'response': 'The methodology section describes...'
            },
            {
                'id': '3',
                'type': 'recommendation',
                'content': 'Suggest related papers',
                'timestamp': '2024-04-28T09:00:00Z',
                'response': 'Based on your interests, I recommend...'
            }
        ]

        return jsonify({
            'status': 'success',
            'history': mock_history
        })
    except Exception as e:
        print("Error:", str(e))
        return jsonify({'status': 'error', 'message': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000) 