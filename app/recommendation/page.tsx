'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, History, CreditCard, Settings, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';  // Add this import

export default function RecommendationPage() {
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);           // Add this
  const [markdownResults, setMarkdownResults] = useState(''); // Add this

  const handleSearch = async () => {
    if (!topic.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/recommend-papers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        setMarkdownResults(data.markdown);
        setRecommendations(data.raw_results || []);
      } else {
        console.error('Error:', data.message);
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0f0f1b] text-white">
      {/* Sidebar - Keep this unchanged */}
      <aside className="w-72 bg-[#1a1a2f] p-6 flex flex-col border-r border-[#2e2e40]">
        <h1 className="text-2xl font-bold mb-6"> Research Buddy</h1>
        <nav className="space-y-3">
          <NavItem icon={<Home size={20} />} text="Home" onClick={() => router.push('/home')}  />
          <NavItem icon={<History size={20} />} text="History" onClick={() => router.push("/history")}  />
          <NavItem icon={<CreditCard size={20} />} text="Billing" onClick={() => router.push("/billing")} />
          <NavItem icon={<Settings size={20} />} text="Settings" onClick={() => router.push("/settings_pg")} />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* Top Bar - Keep this unchanged */}
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

        {/* Back Button - Keep this unchanged */}
        <button onClick={() => router.push('/home')} className="flex items-center text-purple-400 mb-4 hover:underline">
          <ArrowLeft size={20} className="mr-2" /> Back
        </button>

        {/* Recommendation Section */}
        <div className="bg-[#1e1e2f] p-6 rounded-lg border border-[#2e2e40]">
          <h3 className="text-xl font-semibold text-purple-400 mb-2">🔍 Research Paper Recommendations</h3>
          <p className="text-sm text-gray-400 mb-3">
            Enter a topic to get relevant research papers.
          </p>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter topic here..."
            className="w-full p-3 bg-[#2e2e40] text-white border border-[#3a3a50] rounded-md placeholder-gray-400"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="mt-4 w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-md font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Results Section with ReactMarkdown */}
        {markdownResults && (
          <div className="mt-6 bg-[#1e1e2f] p-6 rounded-lg border border-[#2e2e40]">
            <h3 className="text-lg font-semibold text-purple-300 mb-4">📑 Recommended Papers</h3>
            <div className="markdown-content">
              <ReactMarkdown
                components={{
                  h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-3 text-purple-300" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-lg font-semibold mt-4 mb-2" {...props} />,
                  a: ({node, ...props}) => <a className="text-purple-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                  p: ({node, ...props}) => <p className="text-gray-300 mb-3" {...props} />
                }}
              >
                {markdownResults}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Sidebar Navigation Item - Keep this unchanged
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