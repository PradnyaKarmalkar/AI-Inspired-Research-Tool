"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.status === "success") {
        router.push("/login");
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("An error occurred during signup. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f0f1b] text-white px-4 relative">
      {/* Top Heading */}
      <div className="absolute top-16 text-center">
        <h1 className="text-3xl font-bold text-white drop-shadow-md">
          Welcome to <span className="text-purple-400">AI Inspired Research Buddy</span>
        </h1>
      </div>

      {/* Signup Box */}
      <div className="bg-[#1e1e2f] shadow-2xl border border-[#2e2e40] rounded-2xl p-8 w-full max-w-md mt-32">
        <h2 className="text-2xl font-bold text-center text-white mb-6">Sign Up</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: "First Name", name: "firstName" },
            { label: "Last Name", name: "lastName" },
            { label: "Username", name: "username" },
            { label: "Email", name: "email", type: "email" },
            { label: "🔏 Password", name: "password", type: "password" },
          ].map(({ label, name, type = "text" }) => (
            <div key={name}>
              <label className="block text-sm text-gray-300 mb-1 font-medium">{label}</label>
              <input
                type={type}
                name={name}
                value={(formData as any)[name]}
                onChange={handleChange}
                required
                className="w-full p-3 bg-[#2e2e40] border border-[#3a3a50] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder={label}
              />
            </div>
          ))}

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition"
          >
            Sign Up
          </button>
        </form>
        <p className="text-gray-400 text-center mt-4">
          Already have an account?{" "}
          <span
            className="text-purple-400 cursor-pointer hover:underline"
            onClick={() => router.push("/login")}
          >
            Log in
          </span>
        </p>
      </div>
    </div>
  );
}
