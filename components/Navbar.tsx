'use client';

import React from 'react';
import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="border-b border-white/25 border-b-[0.5px] bg-[#0A0A0A] font-serif">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            href="/"
            className="text-2xl font-bold text-white"
          >
            Near Station
          </Link>
          <Link
            href="/intents"
            className="text-white/90 hover:text-white text-sm font-medium transition-colors"
          >
            Intents
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
