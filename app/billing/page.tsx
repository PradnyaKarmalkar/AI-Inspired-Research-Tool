"use client";
import React, { useState } from "react";
import { Toggle } from "@radix-ui/react-toggle";
import { useRouter } from "next/navigation";
import { Home, History, CreditCard, Settings, LogOut, ArrowLeft } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function BillingPage() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const [isYearly, setIsYearly] = useState(true);

  // Handle success message from payment page
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Check for success parameter in URL
  React.useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('success') === 'true') {
      setShowSuccess(true);
      // Remove the success parameter from URL
      window.history.replaceState({}, document.title, '/billing');
      
      // Hide success message after 5 seconds
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const plans = [
    {
      name: "Starter",
      monthlyPrice: "Free",
      yearlyPrice: "Free",
      features: [
        "File processing 5mb",
        "Input Limit 20",
        
        
        
      ],
      cta: "Current plan"
    },
    {
      name: "Lite (Recommended)",
      monthlyPrice: "$3",
      yearlyPrice: "$35",
      features: [
        "File processing 10mb",
        "Input Limit 50",
        
        
        
      ],
      cta: "Upgrade plan"
    },
    {
      name: "Pro",
      monthlyPrice: "$5",
      yearlyPrice: "$60",
      features: [
        "File processing upto 20mb",
        "Input Limit 100",
        
        
        
      ],
      cta: "Upgrade plan"
    }
  ];

  // Function to handle plan selection
  const handlePlanSelection = (plan: any) => {
    // Free plan doesn't require payment
    if (plan.name === "Starter") return;
    
    // For other plans, redirect to payment page with plan details
    const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
    const billing = isYearly ? 'yearly' : 'monthly';
    
    router.push(`/payment?plan=${encodeURIComponent(plan.name)}&price=${encodeURIComponent(price)}&billing=${billing}`);
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
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-500 text-white rounded-lg flex items-center justify-between">
            <span>Payment successful! Your plan has been upgraded.</span>
            <button onClick={() => setShowSuccess(false)} className="text-white hover:text-gray-200">✕</button>
          </div>
        )}
        
        {/* Back to Home Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => router.push('/home')}
            className={`flex items-center ${isDarkMode ? 'text-purple-400' : 'text-purple-600'} hover:underline`}
          >
            <ArrowLeft size={20} className="mr-2" /> Back to Home
          </button>
        </div>

        {/* Toggle */}
        <div className="flex justify-center items-center gap-4 mb-10">
          <span className={`${!isYearly ? 'text-white' : 'text-gray-400'}`}>Monthly</span>
          <Toggle
            pressed={isYearly}
            onPressedChange={() => setIsYearly(!isYearly)}
            className="relative inline-flex h-6 w-12 items-center rounded-full bg-blue-600 transition"
          >
            <span className="sr-only">Toggle billing</span>
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isYearly ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </Toggle>
          <span className={`${isYearly ? 'text-white' : 'text-gray-400'}`}>Annually</span>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan, index) => {
            const isRecommended = plan.name.includes("Recommended");
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;

            return (
              <div
                key={index}
                className={`relative bg-[#1e1e2d] rounded-2xl p-6 flex flex-col justify-between shadow-lg border ${
                  isRecommended ? "border-purple-500 ring-1 ring-purple-400/40" : "border-gray-700"
                }`}
              >
                {isRecommended && (
                  <div className="absolute top-3 right-3 bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-semibold shadow">
                    Recommended
                  </div>
                )}

                <div>
                  <h2 className="text-xl font-semibold mb-2">{plan.name.replace(" (Recommended)", "")}</h2>
                  <p className="text-3xl font-bold text-blue-500 mb-4">
                    {price}
                    {price !== "Free" && (
                      <span className="text-sm text-white font-light"> /{isYearly ? "Year" : "Month"}</span>
                    )}
                  </p>
                  <ul className="text-left space-y-2 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="text-white font-medium">
                        <span className="text-purple-500 mr-2">✔</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <button 
                  onClick={() => handlePlanSelection(plan)}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-full py-2 px-4 font-semibold"
                >
                  {plan.cta}
                </button>
              </div>
            );
          })}
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
