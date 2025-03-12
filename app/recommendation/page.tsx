'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, History, CreditCard, Settings, ArrowLeft } from 'lucide-react';

export default function RecommendationPage() {
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const [recommendations, setRecommendations] = useState([]);

  const handleSearch = async () => {
    // Mock API call - replace with actual API call to fetch recommendations
    setRecommendations([
      { title: 'AI in Healthcare', summary: 'Exploring the impact of AI on modern healthcare.', link: '#' },
      { title: 'Quantum Computing Advances', summary: 'Latest breakthroughs in quantum computing.', link: '#' },
      { title: 'Neural Networks Explained', summary: 'A deep dive into neural network architectures.', link: '#' }
    ]);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-green-800 text-white p-5 flex flex-col">
        <h1 className="text-3xl font-bold">Reseach Buddy</h1>
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
        {/* Recommendation Section */}
        <div className="bg-white p-6 rounded-lg shadow bg-green-50">
          <h3 className="font-bold mb-2 text-green-700">🔍 Research Paper Recommendations</h3>
          <p className="text-sm text-green-600">Enter a topic to get relevant research papers</p>
          <input
            className="w-full border p-2 mt-3 rounded-md bg-green-50"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter topic here..."
          />
          <button onClick={handleSearch} className="mt-4 w-full bg-green-800 text-white py-2 rounded">Search</button>
        </div>
        {/* Results Section */}
        <div className="mt-6">
          {recommendations.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-bold mb-2">📑 Recommended Papers</h3>
              {recommendations.map((rec, index) => (
                <div key={index} className="border-b py-2">
                  <h4 className="font-semibold text-green-700">{rec.title}</h4>
                  <p className="text-sm text-green-600">{rec.summary}</p>
                  <a href={rec.link} className="text-green-500 text-sm">Read More</a>
                </div>
              ))}
            </div>
          )}
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
