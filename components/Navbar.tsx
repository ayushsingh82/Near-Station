'use client';

import React from 'react';
import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="border-b border-gray-500 bg-[#0A0A0A] font-serif">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            href="/"
            className="text-2xl font-bold text-white"
          >
            NearIntents-Helper
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
