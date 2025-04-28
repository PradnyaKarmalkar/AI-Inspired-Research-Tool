from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os
from qa_model import QAModel
import tempfile

app = Flask(__name__)
qa_model = QAModel()

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

ALLOWED_EXTENSIONS = {'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'status': 'error', 'message': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'status': 'error', 'message': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
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

if __name__ == '__main__':
    app.run(debug=True, port=5000) 