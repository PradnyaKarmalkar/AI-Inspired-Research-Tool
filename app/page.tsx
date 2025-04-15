import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#0f0f1b] text-white px-4">
      <Image
        src="/circular.png"
        alt="App Logo"
        width={150}
        height={150}
        className="mb-6"
      />

      {/* Headline & Tagline */}
      <h1 className="text-4xl md:text-5xl font-bold text-center text-purple-400 mb-3">
        Unlock the Power of Research with AI!
      </h1>
      <p className="text-lg md:text-xl text-center text-gray-400 max-w-2xl">
        Upload research papers, extract insights, and chat with AI effortlessly.
      </p>

      {/* CTA Button */}
      <div className="mt-8">
        <Link
          href="/login"
          className="bg-gradient-to-r from-purple-600 to-indigo-700 px-8 py-3 rounded-lg text-lg font-semibold text-white shadow-lg hover:opacity-90 transition"
        >
          Get Started for Free
        </Link>
      </div>
    </main>
  );
}
