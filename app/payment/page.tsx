"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Home, History, CreditCard, Settings, LogOut, ArrowLeft, CheckCircle } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isDarkMode } = useTheme();
  
  // Get plan details from URL parameters
  const planName = searchParams.get('plan') || '';
  const price = searchParams.get('price') || '';
  const billing = searchParams.get('billing') || 'yearly';
  
  // Payment form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [processing, setProcessing] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  
  // Format card number as user types (add spaces every 4 digits)
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };
  
  // Format expiry date as MM/YY
  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    
    return value;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors: {[key: string]: string} = {};
    
    if (!cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
      errors.cardNumber = 'Please enter a valid 16-digit card number';
    }
    
    if (!cardName) {
      errors.cardName = 'Please enter the name on card';
    }
    
    if (!expiry.match(/^\d{2}\/\d{2}$/)) {
      errors.expiry = 'Please enter a valid expiry date (MM/YY)';
    }
    
    if (!cvc.match(/^\d{3,4}$/)) {
      errors.cvc = 'Please enter a valid CVC (3-4 digits)';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    // Clear errors
    setFormErrors({});
    
    // Simulate payment processing
    setProcessing(true);
    
    // In a real app, you would integrate with a payment processor here
    setTimeout(() => {
      setProcessing(false);
      // Redirect to success page or show success message
      router.push('/billing?success=true');
    }, 2000);
  };
  
  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-[#0f0f1b] text-white' : 'bg-gray-100 text-gray-900'} font-sans`}>
      {/* Sidebar */}
      <aside className={`w-72 p-6 flex flex-col shadow-md ${isDarkMode ? 'bg-[#1e1e2f]' : 'bg-white'}`}>
        <h1 className="text-3xl font-bold mb-6">Research Buddy</h1>
        <nav className="flex-grow space-y-4">
          <NavItem icon={<Home size={20} />} text="Home" onClick={() => router.push("/home")} />
          <NavItem icon={<History size={20} />} text="History" onClick={() => router.push("/history")} />
          <NavItem icon={<CreditCard size={20} />} text="Billing" onClick={() => router.push("/billing")} />
          <NavItem icon={<Settings size={20} />} text="Setting" onClick={() => router.push("/settings_pg")}/>
        </nav>
        <button
          onClick={() => {
            localStorage.removeItem('user');
            router.push('/home');
          }}
          className="mt-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-xl flex items-center justify-center hover:opacity-90 transition duration-200"
        >
          <LogOut size={18} className="mr-2" />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* Back to Billing Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => router.push('/billing')}
            className={`flex items-center ${isDarkMode ? 'text-purple-400' : 'text-purple-600'} hover:underline`}
          >
            <ArrowLeft size={20} className="mr-2" /> Back to Billing
          </button>
        </div>

        {/* Payment Content */}
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Complete Your Purchase</h1>
          
          {/* Order Summary */}
          <div className={`mb-8 p-6 rounded-xl ${isDarkMode ? 'bg-[#1e1e2d]' : 'bg-white'} shadow-lg`}>
            <h2 className="text-xl font-semibold mb-4 border-b pb-2 border-gray-700">Order Summary</h2>
            <div className="flex justify-between items-center mb-2">
              <span>Plan:</span>
              <span className="font-semibold">{planName}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span>Billing:</span>
              <span className="font-semibold">{billing === 'yearly' ? 'Annual' : 'Monthly'}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-700 mt-2">
              <span>Total:</span>
              <span className="text-xl font-bold text-blue-500">{price}</span>
            </div>
          </div>
          
          {/* Payment Form */}
          <form onSubmit={handleSubmit} className={`p-6 rounded-xl ${isDarkMode ? 'bg-[#1e1e2d]' : 'bg-white'} shadow-lg`}>
            <h2 className="text-xl font-semibold mb-4 border-b pb-2 border-gray-700">Payment Information</h2>
            
            {/* Card Number */}
            <div className="mb-4">
              <label className="block mb-2">Card Number</label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode 
                    ? 'bg-[#2e2e40] text-white border-[#3a3a50]' 
                    : 'bg-white text-gray-900 border-gray-300'
                } ${formErrors.cardNumber ? 'border-red-500' : ''}`}
              />
              {formErrors.cardNumber && <p className="text-red-500 text-sm mt-1">{formErrors.cardNumber}</p>}
            </div>
            
            {/* Name on Card */}
            <div className="mb-4">
              <label className="block mb-2">Name on Card</label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="John Doe"
                className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode 
                    ? 'bg-[#2e2e40] text-white border-[#3a3a50]' 
                    : 'bg-white text-gray-900 border-gray-300'
                } ${formErrors.cardName ? 'border-red-500' : ''}`}
              />
              {formErrors.cardName && <p className="text-red-500 text-sm mt-1">{formErrors.cardName}</p>}
            </div>
            
            {/* Expiry Date and CVC */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <label className="block mb-2">Expiry Date</label>
                <input
                  type="text"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  placeholder="MM/YY"
                  maxLength={5}
                  className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode 
                      ? 'bg-[#2e2e40] text-white border-[#3a3a50]' 
                      : 'bg-white text-gray-900 border-gray-300'
                  } ${formErrors.expiry ? 'border-red-500' : ''}`}
                />
                {formErrors.expiry && <p className="text-red-500 text-sm mt-1">{formErrors.expiry}</p>}
              </div>
              <div className="flex-1">
                <label className="block mb-2">CVC</label>
                <input
                  type="text"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                  placeholder="123"
                  maxLength={4}
                  className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode 
                      ? 'bg-[#2e2e40] text-white border-[#3a3a50]' 
                      : 'bg-white text-gray-900 border-gray-300'
                  } ${formErrors.cvc ? 'border-red-500' : ''}`}
                />
                {formErrors.cvc && <p className="text-red-500 text-sm mt-1">{formErrors.cvc}</p>}
              </div>
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={processing}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:opacity-90 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {processing ? (
                <>
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                  Processing...
                </>
              ) : (
                <>
                  Complete Payment
                </>
              )}
            </button>
            
            <p className="mt-4 text-center text-sm text-gray-400">
              Your payment information is securely processed
            </p>
          </form>
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