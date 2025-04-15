"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Home, History, CreditCard, Settings, LogOut } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleCardClick = (title: string) => {
    if (title === "Summarization") {
      router.push("/summarization");
    } else if (title === "Report Generation") {
      router.push("/report");
    } else if (title === "Recommendation") {
      router.push("/recommendation");
    } else if (title === "Question Answering") {
      router.push("/queans");
    }
  };

  const templates = [
    { title: "Question Answering", description: "Generate blog titles based on your topic" },
    { title: "Summarization", description: "AI-generated summaries of research papers" },
    { title: "Report Generation", description: "Generate structured reports from research" },
    { title: "Recommendation", description: "Get recommended research papers based on topic" },
  ];

  const filteredTemplates = templates
    .filter((template) =>
      template.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => (a.title.toLowerCase() === searchQuery.toLowerCase() ? -1 : 1));

  return (
    <div className="flex h-screen bg-[#0f0f1b] text-white font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-[#1e1e2f] p-6 flex flex-col shadow-md">
        <h1 className="text-3xl font-bold mb-6">Research Buddy</h1>
        <nav className="flex-grow space-y-4">
          <NavItem icon={<Home size={20} />} text="Home" />
          <NavItem icon={<History size={20} />} text="History" />
          <NavItem icon={<CreditCard size={20} />} text="Billing" onClick={() => router.push("/billing")} />
          <NavItem icon={<Settings size={20} />} text="Setting" />
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
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Top Navigation */}
        <div className="flex justify-between items-center mb-6">
          <input
            type="text"
            placeholder="Explore"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#1e1e2f] text-white px-4 py-2 rounded-lg border border-[#2c2c3a] w-96 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => router.push('/billing')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:scale-105 transition">
            Join Us for $1/month
          </button>
        </div>

        {/* Hero Section */}
        <div className="bg-[#1e1e2f] p-8 rounded-xl text-center shadow-md mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">🚀 Explore all templates 🚀</h2>
          <p className="text-gray-400">Generate everything creatively!</p>
        </div>

        {/* Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template, index) => (
            <Card key={index} {...template} onClick={handleCardClick} />
          ))}
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

// Template Card Component
function Card({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: (title: string) => void;
}) {
  return (
    <div
      className="bg-[#1e1e2f] text-white p-6 rounded-xl shadow-md hover:shadow-xl cursor-pointer transition-all"
      onClick={() => onClick(title)}
    >
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}
