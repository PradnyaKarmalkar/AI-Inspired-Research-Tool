"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Signup Data:", formData);
    router.push("/login"); // Redirect to Home after successful signup
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-green-100">
      <div className="bg-green shadow-lg rounded-2xl border-2 border-green-300 p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-green-800 mb-6">Sign Up</h2>
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-green-600 font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border border-green-300 rounded-lg focus:outline-none focus:ring focus:ring-green-300 text-green-600"
              required
            />
          </div>
          <div>
            <label className="block text-green-600 font-medium">🔏Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border border-green-300 rounded-lg focus:outline-none focus:ring focus:ring-green-300 text-green-600"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-green py-3 rounded-lg hover:bg-green-700 transition duration-300"
          >
            Sign Up
          </button>
        </form>
        <p className="text-green-600 text-center mt-4">
          Already have an account?{" "}
          <span
            className="text-green-800 cursor-pointer hover:underline"
            onClick={() => router.push("/login")}
          >
            Log in
          </span>
        </p>
      </div>
    </div>
  );
}
