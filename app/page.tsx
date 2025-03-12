import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-green-100 text-gray-900">
      <Image src="/circular.png" alt="App Logo" width={150} height={150} className="mb-4" />
      {/* Headline & Tagline */}
      <h1 className="text-4xl font-bold text-center text-green-800">Unlock the Power of Research with AI!</h1>
      <p className="text-lg text-center mt-2 text-green-800">Upload research papers, extract insights, and chat with AI effortlessly.</p>


      {/* CTA Button */}
      <div className="mt-6">
        <Link href="/signup" className="bg-green-600 text-green px-6 py-3 rounded-lg text-lg shadow-lg hover:bg-green-700">
          Get Started for Free
        </Link>
      </div>

    </main>
  );
}

