'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, History, CreditCard, Settings, ArrowLeft } from 'lucide-react';

export default function ReportGeneratorPage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [report, setReport] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [numPages, setNumPages] = useState(3);
  const [processingTime, setProcessingTime] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setUploadError('Please upload a PDF file');
        return;
      }
      setSelectedFile(file);
      setFileName(file.name);
      setUploadError('');
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('pdf', selectedFile);
      formData.append('filename', fileName);
      formData.append('numPages', numPages.toString());

      const response = await fetch('http://localhost:5000/api/upload-pdf-report', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Failed to upload PDF');
      }

      const data = await response.json();

      if (data.status === 'success') {
        setReport(data.report);
        setProcessingTime(data.processing_time || '');
        setUploadError('');
      } else {
        throw new Error(data.message || 'Failed to generate report');
      }
    } catch (error) {
      if (error instanceof Error) {
        setUploadError(`Failed to generate report: ${error.message}`);
        console.error('Upload error:', error);
      } else {
        setUploadError('An unknown error occurred');
        console.error('Unknown upload error:', error);
      }
    } finally {
      setIsUploading(false);
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
          <NavItem icon={<CreditCard size={20} />} text="Billing" onClick={() => router.push("/billing")} />
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
            <p className="text-sm text-gray-400 mb-3">Upload a PDF to generate a comprehensive report.</p>
            <div className="border-2 border-dashed border-[#3a3a50] rounded-md p-6 mb-4">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="pdf-upload"
              />
              <label
                htmlFor="pdf-upload"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <svg
                  className="w-12 h-12 text-purple-400 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <span className="text-sm text-gray-400">
                  {fileName || 'Click to upload PDF'}
                </span>
              </label>
            </div>

            {/* Report Length Control */}
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">
                Report Length (pages):
              </label>
              <div className="flex items-center">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={numPages}
                  onChange={(e) => setNumPages(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-[#2e2e40] rounded-lg appearance-none cursor-pointer"
                />
                <span className="ml-3 text-white font-medium">{numPages}</span>
              </div>
            </div>

            {uploadError && (
              <p className="text-red-500 text-sm mb-4">{uploadError}</p>
            )}

            <button
              onClick={handleGenerateReport}
              disabled={!selectedFile || isUploading}
              className={`w-full py-3 rounded-md font-semibold ${selectedFile && !isUploading
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                } transition`}
            >
              {isUploading ? 'Generating Report...' : 'Generate Report'}
            </button>
          </div>

          {/* Result Section */}
          <div className="bg-[#1e1e2f] p-6 rounded-lg border border-[#2e2e40]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-purple-300">📑 Generated Report</h3>
              {processingTime && (
                <span className="text-xs text-gray-400">
                  Generated in {processingTime}
                </span>
              )}
            </div>
            <div className="border border-[#3a3a50] p-4 max-h-[600px] overflow-y-auto rounded-md bg-[#2a2a40] text-gray-300 whitespace-pre-wrap">
              {report ? (
                <div className="markdown-content">
                  {report}
                </div>
              ) : (
                'Your generated report will appear here.'
              )}
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