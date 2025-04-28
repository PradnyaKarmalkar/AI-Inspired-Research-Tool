'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface NavItemProps {
  icon: ReactNode;
  text: string;
  onClick?: () => void;
}

export default function NavItem({ icon, text, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-[#2e2e40] transition-colors text-gray-300 hover:text-white"
    >
      <span>{icon}</span>
      <span>{text}</span>
    </button>
  );
} 