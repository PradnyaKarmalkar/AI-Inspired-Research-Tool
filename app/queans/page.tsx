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

  const handleFileUpload = (e) => {
    setFile(e.target.files[0]);
    setUrl(''); // Clear URL input if file is uploaded
  };

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
    setFile(null); // Clear file input if URL is entered
  };

  const handleAskQuestion = async () => {
    if (!question) {
      alert('❌ Please enter a question.');
      return;
    }

    if ((file && url) || (!file && !url)) {
      alert('❌ Please provide either a URL or a PDF, but not both.');
      return;
    }

    setLoading(true); // Start loading

    const formData = new FormData();
    formData.append('question', question);
    file ? formData.append('pdf', file) : formData.append('url', url);

    try {
      const response = await fetch('http://localhost:5000/api/questions/ask', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setAnswer(data.answer || 'No answer received.');
    } catch (error) {
      console.error('Error sending request:', error);
      setAnswer('❌ Failed to fetch answer. Please try again.');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-green-800 text-white p-5 flex flex-col">
        <h1 className="text-3xl font-bold">Research Buddy</h1>
        <nav className="mt-5 space-y-3">
          <NavItem icon={<Home size={20} />} text="Home" />
          <NavItem icon={<History size={20} />} text="History" />
          <NavItem icon={<CreditCard size={20} />} text="Billing" />
          <NavItem icon={<Settings size={20} />} text="Setting" />
        </nav>
        <div className="mt-auto bg-green-800 p-3 rounded text-center">
          <p className="text-sm">Mudra</p>
          <p className="text-xs">22167/10000000 Mudra used</p>
          <button className="bg-yellow-500 text-black px-3 py-1 mt-2 rounded">
            Upgrade
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-green-100 p-6">
        {/* Top Navigation */}
        <div className="flex justify-between items-center mb-5">
          <input type="text" placeholder="Explore" className="w-96 px-3 py-2 border rounded-md" />
          <button className="bg-green-700 text-white px-4 py-2 rounded">
            Join Aurota for $1/month
          </button>
        </div>

        {/* Back Button */}
        <button className="flex items-center mb-4 text-green-700" onClick={() => router.push('/home')}>
          <ArrowLeft size={20} className="mr-2" /> Back
        </button>

        {/* Question Answering Section */}
        <div className="bg-white p-6 rounded-lg shadow-md bg-green-50">
          <h3 className="font-bold mb-4 text-green-600">🧠 Question Answering</h3>
          <p className="text-sm text-green-600">
            Enter a URL or upload a PDF, then ask a question.
          </p>

          {/* Input Section */}
          <div className="mt-4 bg-green-50">
            {/* URL Input */}
            <input
              className="w-full border p-2 rounded-md mb-2 bg-green-50"
              value={url}
              onChange={handleUrlChange}
              placeholder="Enter URL here..."
              disabled={file !== null} // Disable if PDF is uploaded
            />

            {/* File Upload */}
            <input
              type="file"
              onChange={handleFileUpload}
              className="w-full border p-2 rounded-md mb-2"
              disabled={url !== ''} // Disable if URL is entered
            />

            {/* Question Input */}
            <input
              className="w-full border p-2 rounded-md bg-green-50"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask your question here..."
            />

            {/* Submit Button */}
            <button
              onClick={handleAskQuestion}
              className="mt-4 w-full bg-green-700 text-white py-2 rounded"
              disabled={loading || (!url && !file)}
            >
              {loading ? '⏳ Fetching Answer...' : 'Submit'}
            </button>
          </div>

          {/* Answer Section */}
          <div className="border p-3 min-h-[100px] rounded-md bg-green-50 mt-4">
            {loading ? '⏳ Generating answer...' : answer || 'Your answer will appear here.'}
          </div>
        </div>
      </main>
    </div>
  );
}

// Sidebar Navigation Item
function NavItem({ icon, text }) {
  return (
    <div className="flex items-center space-x-2 p-2 hover:bg-green-600 rounded cursor-pointer">
      {icon}
      <span>{text}</span>
    </div>
  );
}
