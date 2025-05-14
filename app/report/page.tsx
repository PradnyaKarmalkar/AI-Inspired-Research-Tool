'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, History, CreditCard, Settings, ArrowLeft, LogOut, Copy, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import ReactMarkdown from 'react-markdown';

export default function ReportGeneratorPage() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const [url, setUrl] = useState('');
  const [report, setReport] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [numPages, setNumPages] = useState(3);
  const [processingTime, setProcessingTime] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-pro-exp-03-25');

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
      formData.append('model', selectedModel);

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

  const handleCopyReport = () => {
    if (report) {
      navigator.clipboard.writeText(report)
        .then(() => {
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
        });
    }
  };

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-[#0f0f1b] text-white' : 'bg-gray-100 text-gray-900'} font-sans`}>
      {/* Sidebar */}
      <aside className={`w-72 p-6 flex flex-col shadow-md ${isDarkMode ? 'bg-[#1e1e2f]' : 'bg-white'}`}>
        <h1 className="text-3xl font-bold mb-6">Research Buddy</h1>
        <nav className="flex-grow space-y-4">
          <NavItem icon={<Home size={20} />} text="Home" onClick={() => router.push("/home")} />
          
          <NavItem icon={<CreditCard size={20} />} text="Billing" onClick={() => router.push("/billing")} />
          <NavItem icon={<Settings size={20} />} text="Setting" onClick={() => router.push("/settings_pg")}/>
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
      <main className="flex-1 p-6 overflow-y-auto">
        {/* <div className={`p-8 rounded-xl shadow-md mb-8 ${isDarkMode ? 'bg-[#1e1e2f]' : 'bg-white'}`}>
          <h2 className="text-3xl font-bold mb-4">Reports</h2>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            View and manage your research reports.
          </p>
        </div> */}

        {/* Top Navigation */}
        <div className="flex justify-between items-center mb-6">
          <input
            type="text"
            placeholder="🔍 Explore"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-96 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDarkMode 
                ? 'bg-[#2e2e40] text-white border-[#3a3a50]' 
                : 'bg-white text-gray-900 border-gray-200'
            }`}
          />
          <button
            onClick={() => router.push('/billing')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:scale-105 transition">
            Join Us for $3/month
          </button>
        </div>

        {/* Back Button */}
        <button
          className={`flex items-center text-purple-400 mb-4 hover:underline ${isDarkMode ? '' : 'text-gray-600'}`}
          onClick={() => router.push('/home')}
        >
          <ArrowLeft size={20} className="mr-2" /> Back
        </button>

        {/* Report Generator Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className={`bg-[#1e1e2f] p-6 rounded-lg border border-[#2e2e40] ${isDarkMode ? '' : 'bg-white'}`}>
            <h3 className={`text-lg font-semibold text-purple-400 mb-2 ${isDarkMode ? '' : 'text-gray-900'}`}>📄 Report Generator</h3>
            <p className={`text-sm text-gray-400 mb-3 ${isDarkMode ? '' : 'text-gray-600'}`}>Upload a PDF to generate a comprehensive report.</p>
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
                <span className={`text-sm text-gray-400 ${isDarkMode ? '' : 'text-gray-600'}`}>
                  {fileName || 'Click to upload PDF'}
                </span>
              </label>
            </div>

            {/* Report Length Control 
            <div className="mb-4">
              <label className={`block text-sm text-gray-400 mb-2 ${isDarkMode ? '' : 'text-gray-600'}`}>
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
            </div>*/}

            {/* Model Selection */}
            <div className="mb-4">
              <label className={`block text-sm text-gray-400 mb-2 ${isDarkMode ? '' : 'text-gray-600'}`}>
                Select Model:
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className={`w-full p-2 rounded-md ${
                  isDarkMode 
                    ? 'bg-[#2e2e40] text-white border border-[#3a3a50]' 
                    : 'bg-gray-100 text-gray-900 border border-gray-300'
                }`}
              >
                <option value="gemini-2.5-flash-preview-04-17">gemini-2.5-flash-preview-04-17</option>
                <option value="gemini-2.0-flash">gemini-2.0-flash</option>
              </select>
            </div>

            {uploadError && (
              <p className={`text-red-500 text-sm mb-4 ${isDarkMode ? '' : 'text-gray-600'}`}>{uploadError}</p>
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
          <div className={`bg-[#1e1e2f] p-6 rounded-lg border border-[#2e2e40] ${isDarkMode ? '' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-semibold text-purple-300 ${isDarkMode ? '' : 'text-gray-900'}`}>📑 Generated Report</h3>
              <div className="flex items-center gap-2">
                {processingTime && (
                  <span className={`text-xs text-gray-400 ${isDarkMode ? '' : 'text-gray-600'}`}>
                    Generated in {processingTime}
                  </span>
                )}
                {report && (
                  <button 
                    onClick={handleCopyReport}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-[#2a2a40] hover:bg-[#3a3a50] transition-colors"
                    title="Copy to clipboard"
                  >
                    {copySuccess ? 
                      <><Check size={16} className="text-green-400" /> <span className="text-xs text-green-400">Copied!</span></> : 
                      <><Copy size={16} className="text-purple-300" /> <span className="text-xs text-purple-300">Copy</span></>
                    }
                  </button>
                )}
              </div>
            </div>
            <div className="border border-[#3a3a50] p-4 max-h-[600px] overflow-y-auto rounded-md bg-[#2a2a40] text-gray-300 whitespace-pre-wrap">
              {report ? (
                <div className="markdown-content prose prose-invert max-w-none">
                  <ReactMarkdown
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4 text-purple-300" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-3 text-purple-300" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-lg font-semibold mt-4 mb-2" {...props} />,
                      p: ({node, ...props}) => <p className="text-gray-300 mb-3 leading-relaxed" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 text-gray-300" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 text-gray-300" {...props} />,
                      li: ({node, ...props}) => <li className="mb-2" {...props} />,
                      code: ({node, ...props}) => <code className="bg-[#3a3a50] px-2 py-1 rounded text-sm" {...props} />,
                      pre: ({node, ...props}) => <pre className="bg-[#3a3a50] p-4 rounded-lg overflow-x-auto mb-4" {...props} />,
                      blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-purple-500 pl-4 italic my-4" {...props} />,
                      a: ({node, ...props}) => <a className="text-purple-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                    }}
                  >
                    {report}
                  </ReactMarkdown>
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
  const { isDarkMode } = useTheme();
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
        isDarkMode ? 'hover:bg-[#2e2e40]' : 'hover:bg-gray-100'
      }`}
      onClick={onClick}
    >
      {icon}
      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{text}</span>
    </div>
  );
}