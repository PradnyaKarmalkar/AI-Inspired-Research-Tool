"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (data.status === "success") {
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/home");
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("An error occurred during login. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0f0f1b] text-white px-4 relative">
      {/* Top Heading */}
      <div className="absolute top-16 text-center">
        <h1 className="text-3xl font-bold text-white drop-shadow-md">
          Welcome to <span className="text-purple-400">AI Inspired Research Buddy</span>
        </h1>
      </div>

      {/* Login Box */}
      <div className="w-full max-w-md p-8 space-y-6 bg-[#1e1e2f] border border-[#2e2e40] shadow-xl rounded-2xl mt-24">
        <h2 className="text-2xl font-bold text-center text-white">Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Email or Username</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full p-3 bg-[#2e2e40] border border-[#3a3a50] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
              placeholder="your@email.com or username"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-[#2e2e40] border border-[#3a3a50] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition"
          >
            Login
          </button>
        </form>
        <p className="text-gray-400 text-center mt-4">
          Don&apos;t have an account?{" "}
          <span
            className="text-purple-400 cursor-pointer hover:underline"
            onClick={() => router.push("/signup")}
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}
