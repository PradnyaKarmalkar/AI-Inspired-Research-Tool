'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, History, CreditCard, Settings, ArrowLeft } from 'lucide-react';

export default function ReportGeneratorPage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [report, setReport] = useState('');

  const handleGenerateReport = () => {
    setReport(`Generated report for: ${url}`); // Replace with API call
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
        {/* Top Navigation */}
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
        <button
          className="flex items-center text-purple-400 mb-4 hover:underline"
          onClick={() => router.push('/home')}
        >
          <ArrowLeft size={20} className="mr-2" /> Back
        </button>

        {/* Report Generator Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="bg-[#1e1e2f] p-6 rounded-lg border border-[#2e2e40]">
            <h3 className="text-lg font-semibold text-purple-400 mb-2">📄 Report Generator</h3>
            <p className="text-sm text-gray-400 mb-3">Enter a URL to generate a report.</p>
            <input
              className="w-full p-3 bg-[#2e2e40] text-white border border-[#3a3a50] rounded-md placeholder-gray-400 mb-4"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter URL here..."
            />
            <button
              onClick={handleGenerateReport}
              className="w-full py-3 rounded-md font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90 transition"
            >
              Generate Report
            </button>
          </div>

          {/* Result Section */}
          <div className="bg-[#1e1e2f] p-6 rounded-lg border border-[#2e2e40]">
            <h3 className="text-lg font-semibold text-purple-300 mb-4">📑 Report</h3>
            <div className="border border-[#3a3a50] p-4 min-h-[150px] rounded-md bg-[#2a2a40] text-gray-300 whitespace-pre-wrap">
              {report || 'Your generated report will appear here.'}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Sidebar Navigation Item
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
