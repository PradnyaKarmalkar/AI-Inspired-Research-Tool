"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Perform authentication logic here
    router.push("/home"); // Redirect to home page after login
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-green-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-green border border-green-300 shadow-lg rounded-xl">
        <h2 className="text-2xl font-bold text-center text-green-700">Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-green-600">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-green-600"
              required
            />
          </div>
          <div>
            <label className="block text-green-600">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-green-600"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full p-3 text-green bg-green-600 rounded-lg hover:bg-green-700"
          >
            Login
          </button>
        </form>
        <p className="text-green-600 text-center mt-4">
          Don't have an account?{" "}
          <span
            className="text-green-800 cursor-pointer hover:underline"
            onClick={() => router.push("/signup")}
          >
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
}
