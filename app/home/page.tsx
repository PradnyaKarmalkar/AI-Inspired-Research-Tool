"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Home, History, CreditCard, Settings } from "lucide-react";

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
    } else if (title === "Question Answering"){
        router.push("/queans")}
  };

  // Data for templates
  const templates = [
    { title: "Question Answering", description: "Generate blog titles based on your topic" },
    { title: "Summarization", description: "AI-generated summaries of research papers" },
    { title: "Report Generation", description: "Generate structured reports from research" },
    { title: "Recommendation", description: "Get recommended research papers based on topic" },
  ];

  // Filter & sort based on search query
  const filteredTemplates = templates
    .filter((template) =>
      template.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => (a.title.toLowerCase() === searchQuery.toLowerCase() ? -1 : 1));

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-72 bg-green-800 text-white p-5 flex flex-col">
        <h1 className="text-3xl font-bold">Research Buddy</h1>
        <nav className="mt-5 space-y-3">
          <NavItem icon={<Home size={20} />} text="Home" />
          <NavItem icon={<History size={20} />} text="History" />
          <NavItem icon={<CreditCard size={20} />} text="Billing" />
          <NavItem icon={<Settings size={20} />} text="Setting" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-green-100 p-6">
        {/* Top Navigation */}
        <div className="flex justify-between items-center mb-5">
          <input
            type="text"
            placeholder="Explore"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-96 px-3 py-2 border rounded-md"
          />
          <button className="bg-green-700 text-white px-4 py-2 rounded">
            Join Aurota for $1/month
          </button>
        </div>

        {/* Hero Section */}
        <div className="bg-gray-800 text-white p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold">🚀 Explore all templates 🚀</h2>
          <p className="text-sm mt-1">💡 सुझनादायक: भवतु 💡</p>
          <p className="mt-2">Generate everything creatively!</p>
        </div>

        {/* Cards Section */}
        <div className="grid grid-cols-3 gap-4 mt-6 w-full">
          {filteredTemplates.map((template, index) => (
            <Card key={index} {...template} onClick={handleCardClick} />
          ))}
        </div>
      </main>
    </div>
  );
}

// Sidebar Navigation Item
function NavItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded cursor-pointer">
      {icon}
      <span>{text}</span>
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
      className="bg-white p-4 rounded-lg shadow hover:shadow-lg cursor-pointer"
      onClick={() => onClick(title)}
    >
      <h3 className="font-bold">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
