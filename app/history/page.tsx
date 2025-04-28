'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import NavItem from '@/components/NavItem';
import { Home, History, CreditCard, Settings, ArrowLeft } from 'lucide-react';

interface HistoryItem {
  id: string;
  type: 'question' | 'summary' | 'recommendation';
  content: string;
  timestamp: string;
  response?: string;
}

export default function HistoryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/history?userId=${user?.email}`);
        const data = await response.json();
        setHistory(data);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchHistory();
    }
  }, [user]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'question':
        return '❓';
      case 'summary':
        return '📝';
      case 'recommendation':
        return '💡';
      default:
        return '📄';
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <aside className="w-72 bg-[#1a1a2f] p-6 flex flex-col border-r border-[#2e2e40]">
          <h1 className="text-2xl font-bold mb-6">Research Buddy</h1>
          <nav className="space-y-3">
            <NavItem icon={<Home size={20} />} text="Home" onClick={() => router.push('/home')} />
            <NavItem icon={<History size={20} />} text="History" />
            <NavItem icon={<CreditCard size={20} />} text="Billing" onClick={() => router.push("/billing")} />
            <NavItem icon={<Settings size={20} />} text="Settings" onClick={() => router.push("/settings_pg")} />
          </nav>
        </aside>
        <div className="flex-1 p-8">
          <button onClick={() => router.push('/home')} className="flex items-center text-purple-400 mb-4 hover:underline">
            <ArrowLeft size={20} className="mr-2" /> Back
          </button>
          <Card>
            <CardContent className="flex justify-center items-center h-64">
              <p>Loading history...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-72 bg-[#1a1a2f] p-6 flex flex-col border-r border-[#2e2e40]">
        <h1 className="text-2xl font-bold mb-6">Research Buddy</h1>
        <nav className="space-y-3">
          <NavItem icon={<Home size={20} />} text="Home" onClick={() => router.push('/home')} />
          <NavItem icon={<History size={20} />} text="History" />
          <NavItem icon={<CreditCard size={20} />} text="Billing" onClick={() => router.push("/billing")} />
          <NavItem icon={<Settings size={20} />} text="Settings" onClick={() => router.push("/settings_pg")} />
        </nav>
      </aside>
      <div className="flex-1 p-8">
        <button onClick={() => router.push('/home')} className="flex items-center text-purple-400 mb-4 hover:underline">
          <ArrowLeft size={20} className="mr-2" /> Back
        </button>
        <Card>
          <CardHeader>
            <CardTitle>Your Interaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-center text-gray-500">No history found</p>
            ) : (
              <div className="space-y-4">
                {history.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start space-x-4">
                        <div className="text-2xl">{getTypeIcon(item.type)}</div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium">{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</h3>
                            <span className="text-sm text-gray-500">{formatDate(item.timestamp)}</span>
                          </div>
                          <p className="mt-2 text-gray-600">{item.content}</p>
                          {item.response && (
                            <div className="mt-2 p-2 bg-gray-50 rounded">
                              <p className="text-sm text-gray-700">{item.response}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 