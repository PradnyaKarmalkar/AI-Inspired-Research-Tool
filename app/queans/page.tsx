'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Home, History, CreditCard, Settings, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const API_BASE_URL = 'http://localhost:5000';

export default function QuestionAnsweringPage() {
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const [isDocumentReady, setIsDocumentReady] = useState(false);
  const [checkingDocuments, setCheckingDocuments] = useState(true);

  // Check for existing documents when the page loads
  // useEffect(() => {
  //   const checkDocuments = async () => {
  //     try {
  //       setCheckingDocuments(true);
  //       const response = await fetch(`${API_BASE_URL}/check-documents`);

  //       if (response.ok) {
  //         const data = await response.json();
  //         if (data.status === 'success' && data.has_documents) {
  //           setIsDocumentReady(true);
  //           setUploadStatus('success');
  //           setUploadMessage('Documents are available and ready for questions.');
  //         } else {
  //           setIsDocumentReady(false);
  //         }
  //       }
  //     } catch (error) {
  //       console.error('Error checking documents:', error);
  //     } finally {
  //       setCheckingDocuments(false);
  //     }
  //   };

  //   checkDocuments();
  // }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file type
      if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
        setUploadStatus('error');
        setUploadMessage('Only PDF files are supported.');
        return;
      }

      // Check file size (10MB max)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setUploadStatus('error');
        setUploadMessage('File is too large. Maximum size is 10MB.');
        return;
      }

      setFile(selectedFile);
      setUploadedFileName(selectedFile.name);
      setUploadStatus('uploading');
      setUploadMessage('Processing document...');
      setIsDocumentReady(false);

      const formData = new FormData();
      formData.append('file', selectedFile);

      try {
        const response = await fetch(`${API_BASE_URL}/upload-pdf-qa`, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (response.ok && data.status === 'success') {
          setUploadStatus('success');
          setUploadMessage('Document processed successfully! You can now ask questions.');
          setIsDocumentReady(true);
        } else {
          setUploadStatus('error');
          setUploadMessage(data.message || 'Failed to process document');
          setIsDocumentReady(false);
        }
      } catch (error: any) {
        console.error('Upload error:', error);
        setUploadStatus('error');
        setUploadMessage('Failed to process document. Server may be unavailable.');
        setIsDocumentReady(false);
      }
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      setUploadStatus('error');
      setUploadMessage('Please enter a question.');
      return;
    }

    if (!isDocumentReady) {
      setUploadStatus('error');
      setUploadMessage('Please upload and process a document first.');
      return;
    }

    setLoading(true);
    setAnswer('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/questions/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setAnswer(data.answer);
      } else {
        setAnswer(`Error: ${data.message || 'Failed to get answer'}`);
      }
    } catch (error: any) {
      console.error('Question error:', error);
      setAnswer(`❌ Failed to fetch answer. Please check your connection and try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0f0f1b] text-white">
      {/* Sidebar */}
      <aside className="w-72 bg-[#1a1a2f] p-6 flex flex-col border-r border-[#2e2e40]">
        <h1 className="text-2xl font-bold mb-6"> Research Buddy</h1>
        <nav className="space-y-3">
          <NavItem icon={<Home size={20} />} text="Home" onClick={() => router.push('/home')} />
          <NavItem icon={<History size={20} />} text="History" />
          <NavItem icon={<CreditCard size={20} />} text="Billing" onClick={() => router.push("/billing")} />
          <NavItem icon={<Settings size={20} />} text="Settings" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-6">
          <input
            type="text"
            placeholder="🔍 Explore"
            className="w-96 px-4 py-2 bg-[#2e2e40] text-white border border-[#3a3a50] rounded-md focus:outline-none focus:ring focus:ring-purple-600"
          />
          <button
            onClick={() => router.push('/billing')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:scale-105 transition">
            Join Us for $1/month
          </button>
        </div>

        {/* Back Button */}
        <button onClick={() => router.push('/home')} className="flex items-center text-purple-400 mb-4 hover:underline">
          <ArrowLeft size={20} className="mr-2" /> Back
        </button>

        {/* QA Box */}
        <div className="bg-[#1e1e2f] p-6 rounded-lg border border-[#2e2e40]">
          <h3 className="text-xl font-semibold text-purple-400 mb-2">Question Answering</h3>
          <p className="text-sm text-gray-400 mb-4">
            Upload a PDF file, then ask a question about its content.
          </p>

          {/* {checkingDocuments ? (
            // <div className="text-center py-4">
            //   <div className="animate-pulse text-purple-400">Checking for available documents...</div>
            // </div>
            ): ( */}
             {/* Inputs */}
            <div className="space-y-4">
              {/* File Upload */}
              <div>
                <label className="block text-sm mb-1 text-gray-300">Upload PDF:</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept=".pdf"
                    id="pdf-upload"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploadStatus === 'uploading'}
                  />
                  <label
                    htmlFor="pdf-upload"
                    className={`px-4 py-2 rounded cursor-pointer ${uploadStatus === 'uploading'
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-700'
                      } text-white transition`}
                  >
                    {uploadStatus === 'uploading' ? 'Uploading...' : 'Choose File'}
                  </label>
                  <span className="text-sm text-gray-400 truncate max-w-xs">
                    {uploadedFileName || "No file chosen"}
                  </span>
                </div>
                {uploadStatus !== 'idle' && (
                  <div className={`mt-2 text-sm ${uploadStatus === 'success' ? 'text-green-400' :
                      uploadStatus === 'error' ? 'text-red-400' :
                        'text-yellow-400'
                    }`}>
                    {uploadMessage}
                  </div>
                )}
              </div>

              {/* Question Input */}
              <div>
                <label className="block text-sm mb-1 text-gray-300">Your Question:</label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask your question..."
                  className={`w-full p-3 bg-[#2e2e40] border border-[#3a3a50] rounded-md text-white min-h-[80px] placeholder-gray-400 transition ${!isDocumentReady ? 'opacity-75' : ''}`}
                  disabled={!isDocumentReady}
                />
                {!isDocumentReady && uploadStatus !== 'uploading' && uploadStatus !== 'success' && (
                  <p className="text-xs text-yellow-400 mt-1">
                    Please upload a document first
                  </p>
                )}
              </div>

              {/* Ask Button */}
              <button
                onClick={handleAskQuestion}
                disabled={loading || !isDocumentReady || !question.trim()}
                className={`w-full py-3 rounded-md font-semibold transition ${loading || !isDocumentReady || !question.trim()
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90'
                  }`}
              >
                {loading ? '⏳ Processing...' : 'Ask Question'}
              </button>
            </div>
          {/* )} */}

          {/* Answer Output */}
          <div className="mt-6">
            <h4 className="font-medium text-gray-300 mb-2">Answer:</h4>
            <div className="bg-[#2e2e40] border border-[#3a3a50] p-4 rounded-md min-h-[120px] text-white shadow-inner">
              {loading ? (
                <div className="animate-pulse text-purple-400">⏳ Processing your question...</div>
              ) : answer ? (
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4 text-purple-300" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-3 text-purple-300" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-lg font-semibold mt-4 mb-2" {...props} />,
                      p: ({node, ...props}) => <p className="text-gray-300 mb-3 leading-relaxed" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 text-gray-300" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 text-gray-300" {...props} />,
                      li: ({node, ...props}) => <li className="mb-2" {...props} />,
                      code: ({node, ...props}) => <code className="bg-[#3a3a50] px-2 py-1 rounded text-sm" {...props} />,
                      pre: ({node, ...props}) => <pre className="bg-[#3a3a50] p-4 rounded-lg overflow-x-auto mb-4" {...props} />,
                      blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-purple-500 pl-4 italic my-4" {...props} />,
                      a: ({node, ...props}) => <a className="text-purple-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                    }}
                  >
                    {answer}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="text-gray-500 italic">Your answer will appear here.</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, text, onClick }: { icon: React.ReactNode; text: string; onClick?: () => void }) {
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-[#2e2e40] transition"
      onClick={onClick}
    >
      {icon}
      <span className="text-white font-medium">{text}</span>
    </div>
  );
}