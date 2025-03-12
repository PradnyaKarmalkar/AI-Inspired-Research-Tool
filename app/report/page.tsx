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
        <button className="flex items-center mb-4 text-green-700" onClick={() => router.push('/home')}>
          <ArrowLeft size={20} className="mr-2" /> Back
        </button>
        {/* Report Generator Section */}
        <div className="grid grid-cols-2 gap-4">
          {/* Input Section */}
          <div className="bg-white p-6 rounded-lg shadow bg-green-50">
            <h3 className="font-bold mb-2 text-green-600">📄 Report Generator</h3>
            <p className="text-sm text-green-600">Enter URL to generate a report</p>
            <input
              className="w-full border p-2 mt-3 rounded-md bg-green-50 text-green-600"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter URL here..."
            />
            <button onClick={handleGenerateReport} className="mt-4 w-full bg-green-700 text-white py-2 rounded">Generate Report</button>
          </div>
          {/* Result Section */}
          <div className="bg-white p-6 rounded-lg shadow bg-green-50">
            <h3 className="font-bold mb-2 text-green-600">📑 Report</h3>
            <div className="border p-3 min-h-[100px] rounded-md bg-green-50">
              {report || 'Your generated report will appear here.'}
            </div>
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
