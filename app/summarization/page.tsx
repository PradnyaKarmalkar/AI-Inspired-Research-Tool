"use client";
import { useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Home, History, CreditCard, Settings, ArrowLeft, LogOut, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useTheme } from "../context/ThemeContext";

export default function SummarizationPage() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const [input, setInput] = useState('');
  const [summary, setSummary] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-pro-exp-03-25');

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        setError('');
      } else {
        setSelectedFile(null);
        setError('Please select a PDF file');
      }
    }
  };

  const handleSummarize = async () => {
    setError('');
    setSummary('');

    if (selectedFile) {
      setIsUploading(true);
      setIsProcessing(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('model', selectedModel);

      try {
        const response = await fetch('http://localhost:5000/upload-pdf-sum', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (response.ok) {
          setSummary(data.summary || `File "${data.filename}" uploaded successfully. Summary will be generated soon.`);
        } else {
          setError(data.message || 'Error processing the PDF');
        }
      } catch (error) {
        console.error('Error:', error);
        setError('Network error or server is not available');
      } finally {
        setIsUploading(false);
        setIsProcessing(false);
      }
    } else if (input) {
      setSummary(`Summarized content of: "${input}"`); // Replace with real API call
    } else {
      setError('Please enter a URL or upload a PDF file');
    }
  };

  const handleCopySummary = () => {
    if (summary) {
      navigator.clipboard.writeText(summary)
        .then(() => {
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
        });
    }
  };

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-[#0f0f1b] text-white' : 'bg-gray-100 text-gray-900'} font-sans`}>
      {/* Sidebar */}
      <aside className={`w-72 p-6 flex flex-col shadow-md ${isDarkMode ? 'bg-[#1e1e2f]' : 'bg-white'}`}>
        <h1 className="text-3xl font-bold mb-6">Research Buddy</h1>
        <nav className="flex-grow space-y-4">
          <NavItem icon={<Home size={20} />} text="Home" onClick={() => router.push("/home")} />
          
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
        {/* <div className={`p-8 rounded-xl shadow-md mb-8 ${isDarkMode ? 'bg-[#1e1e2f]' : 'bg-white'}`}>
          <h2 className="text-3xl font-bold mb-4">Summarization</h2>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Generate summaries of your research papers and documents.
          </p>
        </div> */}

        {/* Top Navigation */}
        <div className="flex justify-between items-center mb-6">
          <input
            type="text"
            placeholder="🔍 Explore"
            className={`w-96 px-4 py-2 ${isDarkMode ? 'bg-[#2e2e40] text-white border border-[#3a3a50]' : 'bg-gray-100 text-gray-900 border border-gray-300'} rounded-md focus:outline-none focus:ring focus:ring-purple-600`}
          />
          <button
            onClick={() => router.push('/billing')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:scale-105 transition">
            Join Us for $3/month
          </button>
        </div>

        {/* Back Button */}
        <button
          className="flex items-center text-purple-400 mb-4 hover:underline"
          onClick={() => router.push('/home')}
        >
          <ArrowLeft size={20} className="mr-2" /> Back
        </button>

        {/* Summarization Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className={`bg-[#1e1e2f] p-6 rounded-lg border border-[#2e2e40] ${isDarkMode ? '' : 'bg-white'}`}>
            <h3 className="text-lg font-semibold text-purple-400 mb-2">📝 Summarization</h3>
            <p className="text-sm text-gray-400 mb-3">
              Upload a PDF to generate a summary.
            </p>
            
            {/* Model Selection */}
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Select Model:</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className={`w-full p-2 rounded-md ${
                  isDarkMode 
                    ? 'bg-[#2e2e40] text-white border border-[#3a3a50]' 
                    : 'bg-gray-100 text-gray-900 border border-gray-300'
                }`}
              >
                <option value="gemini-2.5-flash-preview-04-17">gemini-2.5-flash-preview-04-17</option>
                <option value="gemini-2.0-flash">gemini-2.0-flash</option>
              </select>
            </div>

            <input
              type="file"
              accept=".pdf"
              className={`w-full bg-[#2e2e40] text-white border border-[#3a3a50] rounded-md file:bg-purple-600 file:text-white file:border-none file:rounded file:px-3 file:py-1 ${isDarkMode ? '' : 'bg-gray-100'}`}
              onChange={handleFileChange}
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            {selectedFile && (
              <p className="text-sm text-green-400 mt-2">Selected file: {selectedFile.name}</p>
            )}
            <button
              onClick={handleSummarize}
              disabled={isUploading}
              className={`mt-4 w-full py-3 rounded-md font-semibold transition ${
                isUploading
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90'
              }`}
            >
              {isUploading ? 'Uploading...' : 'Summarize'}
            </button>
          </div>

          {/* Result Section */}
          <div className={`bg-[#1e1e2f] p-6 rounded-lg border border-[#2e2e40] ${isDarkMode ? '' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-purple-300">📜 Result</h3>
              {summary && (
                <button 
                  onClick={handleCopySummary}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-[#2a2a40] hover:bg-[#3a3a50] transition-colors"
                  title="Copy to clipboard"
                >
                  {copySuccess ? 
                    <><Check size={16} className="text-green-400" /> <span className="text-xs text-green-400">Copied!</span></> : 
                    <><Copy size={16} className="text-purple-300" /> <span className="text-xs text-purple-300">Copy</span></>
                  }
                </button>
              )}
            </div>
            <div className="border border-[#3a3a50] p-4 min-h-[150px] rounded-md bg-[#2a2a40] text-gray-300 overflow-y-auto max-h-[500px]">
              {isProcessing ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
              ) : summary ? (
                <div className="prose prose-invert max-w-none dark:prose-invert">
                  <ReactMarkdown
                    components={{
                      h1: ({ node, ...props }) => <h1 className="text-3xl font-bold text-purple-400 mb-6 mt-0" {...props} />,
                      h2: ({ node, ...props }) => <h2 className="text-2xl font-bold text-purple-400 mb-4 mt-8" {...props} />,
                      h3: ({ node, ...props }) => <h3 className="text-xl font-bold text-purple-400 mb-3 mt-6" {...props} />,
                      p: ({ node, ...props }) => <p className="mb-4 leading-relaxed text-gray-300" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-300" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-2 text-gray-300" {...props} />,
                      li: ({ node, ...props }) => <li className="mb-2" {...props} />,
                      strong: ({ node, ...props }) => <strong className="font-bold text-purple-300" {...props} />,
                      em: ({ node, ...props }) => <em className="italic" {...props} />,
                      blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-purple-500 pl-4 italic my-4 text-gray-400" {...props} />,
                      code: ({ node, ...props }) => <code className="bg-[#3a3a50] px-2 py-1 rounded text-sm font-mono" {...props} />,
                      pre: ({ node, ...props }) => <pre className="bg-[#3a3a50] p-4 rounded-lg overflow-x-auto my-4 font-mono" {...props} />,
                    }}
                  >
                    {summary}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="text-gray-500 text-center">
                  Your summarized content will appear here.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Sidebar Navigation Item
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