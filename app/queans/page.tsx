'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, History, CreditCard, Settings, ArrowLeft } from 'lucide-react';

export default function QuestionAnsweringPage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadedFileName(selectedFile.name);
      setUrl('');
    }
  };

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
    setFile(null);
    setUploadedFileName('');
  };

  const handleAskQuestion = async () => {
    if (!question) {
      alert('❌ Please enter a question.');
      return;
    }

    if (!file && !url) {
      alert('❌ Please provide either a URL or a PDF file.');
      return;
    }

    setLoading(true);
    setAnswer('');

    const formData = new FormData();
    formData.append('question', question);
    if (file) {
      formData.append('pdf', file);
    } else {
      formData.append('url', url);
    }

    try {
      const response = await fetch('http://localhost:5000/api/questions/ask', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setAnswer(data.status === 'success' ? data.answer || 'No answer received.' : `Error: ${data.message}`);
    } catch (error) {
      setAnswer(`❌ Failed to fetch answer: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0f0f1b] text-white">
      {/* Sidebar */}
      <aside className="w-72 bg-[#1a1a2f] p-6 flex flex-col border-r border-[#2e2e40]">
        <h1 className="text-2xl font-bold mb-6">🧠 Research Buddy</h1>
        <nav className="space-y-3">
          <NavItem icon={<Home size={20} />} text="Home" onClick={() => router.push('/home')} />
          <NavItem icon={<History size={20} />} text="History" />
          <NavItem icon={<CreditCard size={20} />} text="Billing" onClick={() => router.push("/billing")}/>
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
        <div className="bg-[#1e1e2f] p-6 rounded-lg shadow-md border border-[#2e2e40]">
          <h3 className="text-xl font-semibold text-purple-400 mb-2">Question Answering</h3>
          <p className="text-sm text-gray-400 mb-4">
            Enter a URL or upload a PDF file, then ask a question about its content.
          </p>

          {/* Inputs */}
          <div className="space-y-4">
            {/* URL Input */}
            <div>
              <label className="block text-sm mb-1 text-gray-300">Enter URL:</label>
              <input
                type="text"
                value={url}
                onChange={handleUrlChange}
                placeholder="https://example.com/article"
                disabled={file !== null}
                className="w-full p-3 bg-[#2e2e40] border border-[#3a3a50] rounded-md text-white placeholder-gray-400"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm mb-1 text-gray-300">Or Upload PDF:</label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept=".pdf"
                  id="pdf-upload"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={url !== ''}
                />
                <label htmlFor="pdf-upload" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded cursor-pointer">
                  Choose File
                </label>
                <span className="text-sm text-gray-400">
                  {uploadedFileName || "No file chosen"}
                </span>
              </div>
            </div>

            {/* Question Input */}
            <div>
              <label className="block text-sm mb-1 text-gray-300">Your Question:</label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask your question about the content..."
                className="w-full p-3 bg-[#2e2e40] border border-[#3a3a50] rounded-md text-white min-h-[80px] placeholder-gray-400"
              />
            </div>

            {/* Ask Button */}
            <button
              onClick={handleAskQuestion}
              disabled={loading || (!url && !file) || !question}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-md font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {loading ? '⏳ Processing...' : 'Ask Question'}
            </button>
          </div>

          {/* Answer Output */}
          <div className="mt-6">
            <h4 className="font-medium text-gray-300 mb-2">Answer:</h4>
            <div className="bg-[#2e2e40] border border-[#3a3a50] p-4 rounded-md min-h-[120px] text-white shadow-inner">
              {loading ? (
                <div className="animate-pulse text-purple-400">⏳ Processing your question...</div>
              ) : answer ? (
                <pre className="whitespace-pre-wrap">{answer}</pre>
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

{/* NavItem sidebar */}
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
