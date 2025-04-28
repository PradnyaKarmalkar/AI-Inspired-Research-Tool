"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Home, History, CreditCard, Settings, ArrowLeft, LogOut } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useTheme } from "../context/ThemeContext";

const API_BASE_URL = 'http://localhost:5000';

export default function QuestionAnsweringPage() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
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
  useEffect(() => {
    const checkDocuments = async () => {
      try {
        setCheckingDocuments(true);
        const response = await fetch(`${API_BASE_URL}/check-documents`);

        if (response.ok) {
          const data = await response.json();
          if (data.status === 'success' && data.has_documents) {
            setIsDocumentReady(true);
            setUploadStatus('success');
            setUploadMessage('Documents are available and ready for questions.');
          } else {
            setIsDocumentReady(false);
          }
        }
      } catch (error) {
        console.error('Error checking documents:', error);
      } finally {
        setCheckingDocuments(false);
      }
    };

    checkDocuments();
  }, []);

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
    <div className={`flex h-screen ${isDarkMode ? 'bg-[#0f0f1b] text-white' : 'bg-gray-100 text-gray-900'} font-sans`}>
      {/* Sidebar */}
      <aside className={`w-72 p-6 flex flex-col shadow-md ${isDarkMode ? 'bg-[#1e1e2f]' : 'bg-white'}`}>
        <h1 className="text-3xl font-bold mb-6">Research Buddy</h1>
        <nav className="flex-grow space-y-4">
          <NavItem icon={<Home size={20} />} text="Home" onClick={() => router.push("/")} />
          <NavItem icon={<History size={20} />} text="History" />
          <NavItem icon={<CreditCard size={20} />} text="Billing" onClick={() => router.push("/billing")} />
          <NavItem icon={<Settings size={20} />} text="Setting" onClick={() => router.push("/settings_pg")}/>
        </nav>
        <button
          onClick={() => {
            localStorage.removeItem('user');
            router.push('/login');
          }}
          className="mt-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-xl flex items-center justify-center hover:opacity-90 transition duration-200"
        >
          <LogOut size={18} className="mr-2" />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <div className={`p-8 rounded-xl shadow-md mb-8 ${isDarkMode ? 'bg-[#1e1e2f]' : 'bg-white'}`}>
          <h2 className="text-3xl font-bold mb-4">Question Answering</h2>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Ask questions about your research documents and get instant answers.
          </p>
        </div>

        {/* Top Navigation */}
        <div className="flex justify-between items-center mb-6">
          <input
            type="text"
            placeholder="🔍 Explore"
            className={`w-96 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDarkMode 
                ? 'bg-[#2e2e40] text-white border-[#3a3a50]' 
                : 'bg-white text-gray-900 border-gray-200'
            }`}
          />
          <button
            onClick={() => router.push('/billing')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:scale-105 transition">
            Join Us for $1/month
          </button>
        </div>

        {/* Question Answering Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-[#1e1e2f] border-[#2e2e40]' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-purple-400' : 'text-gray-900'}`}>❓ Ask a Question</h3>
            <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Enter your question about the research document.</p>
            <form onSubmit={handleAskQuestion}>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type your question here..."
                className={`w-full p-4 rounded-lg border mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode 
                    ? 'bg-[#2e2e40] text-white border-[#3a3a50]' 
                    : 'bg-white text-gray-900 border-gray-200'
                }`}
                rows={4}
              />
              <button
                type="submit"
                className="w-full py-3 rounded-md font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90 transition"
              >
                Get Answer
              </button>
            </form>
          </div>

          {/* Answer Section */}
          <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-[#1e1e2f] border-[#2e2e40]' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-purple-300' : 'text-gray-900'}`}>💡 Answer</h3>
            </div>
            <div className={`border rounded-md p-4 min-h-[400px] ${
              isDarkMode 
                ? 'border-[#3a3a50] bg-[#2a2a40] text-gray-300' 
                : 'border-gray-200 bg-gray-50 text-gray-700'
            }`}>
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
  const { isDarkMode } = useTheme();
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
        isDarkMode ? 'hover:bg-[#2e2e40]' : 'hover:bg-gray-100'
      }`}
      onClick={onClick}
    >
      {icon}
      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{text}</span>
    </div>
  );
}