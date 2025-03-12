'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, History, CreditCard, Settings, ArrowLeft, Upload } from 'lucide-react';

export default function QuestionAnsweringPage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [file, setFile] = useState(null);

  const handleFileUpload = (e) => {
    setFile(e.target.files[0]);
  };

  const handleAskQuestion = () => {
    setAnswer(`Answer for: ${question}`); // Replace with API call
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
          <button className="bg-yellow-500 text-black px-3 py-1 mt-2 rounded">Upgrade</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-green-100 p-6">
        {/* Top Navigation */}
        <div className="flex justify-between items-center mb-5">
          <input type="text" placeholder="Explore" className="w-96 px-3 py-2 border rounded-md" />
          <button className="bg-green-700 text-white px-4 py-2 rounded">Join Aurota for $1/month</button>
        </div>

        {/* Back Button */}
        <button className="flex items-center mb-4 text-green-700" onClick={() => router.push('/')}>
          <ArrowLeft size={20} className="mr-2" /> Back
        </button>

        {/* Question Answering Section */}
        <div className="bg-white p-6 rounded-lg shadow-md bg-green-50">
          <h3 className="font-bold mb-4 text-green-600">🧠 Question Answering</h3>
          <p className="text-sm text-green-600">Enter a URL or upload a PDF, then ask a question.</p>

          {/* Input Section */}
          <div className="mt-4 bg-green-50">
            <input
              className="w-full border p-2 rounded-md mb-2 bg-green-50"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter URL here..."
            />
            <input type="file" onChange={handleFileUpload} className="w-full border p-2 rounded-md mb-2" />
            <input
              className="w-full border p-2 rounded-md bg-green-50"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask your question here..."
            />
            <button onClick={handleAskQuestion} className="mt-4 w-full bg-green-700 text-white py-2 rounded">Submit</button>
          </div>

          {/* Answer Section */}
          <div className="border p-3 min-h-[100px] rounded-md bg-green-50 mt-4">
            {answer || 'Your answer will appear here.'}
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
