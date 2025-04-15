"use client";
import React, { useState } from "react";
import { Toggle } from "@radix-ui/react-toggle";

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(true);

  const plans = [
    {
      name: "Starter",
      monthlyPrice: "Free",
      yearlyPrice: "Free",
      features: [
        "2 Projects",
        "Client Billing",
        "Free Staging",
        "Code Export",
        "White labeling",
        "Site password protection"
      ],
      cta: "Current plan"
    },
    {
      name: "Lite (Recommended)",
      monthlyPrice: "$2",
      yearlyPrice: "$16",
      features: [
        "2 Projects",
        "Client Billing",
        "Free Staging",
        "Code Export",
        "White labeling",
        "Site password protection"
      ],
      cta: "Upgrade plan"
    },
    {
      name: "Pro",
      monthlyPrice: "$5",
      yearlyPrice: "$35",
      features: [
        "2 Projects",
        "Client Billing",
        "Free Staging",
        "Code Export",
        "White labeling",
        "Site password protection"
      ],
      cta: "Upgrade plan"
    }
  ];

  return (
    <div className="min-h-screen bg-[#11111a] text-white py-10 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-4xl font-bold">Our Pricing Plans</h1>
        <p className="text-gray-400 mt-2 mb-6">Pick an account plan that fits your workflow</p>

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
                <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full py-2 px-4 font-semibold">
                  {plan.cta}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
