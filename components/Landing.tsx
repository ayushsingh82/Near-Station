'use client';

import React from 'react';
import Link from 'next/link';

const Landing: React.FC = () => {
  return (
    <section className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden bg-[#0A0A0A] text-gray-100">
      {/* Orange gradient on left end */}
      <div className="absolute left-0 top-0 w-[77px] md:w-[307px] h-full bg-gradient-to-r from-[#CC4420]/50 to-transparent pointer-events-none" />
      {/* Orange gradient on right end */}
      <div className="absolute right-0 top-0 w-[77px] md:w-[307px] h-full bg-gradient-to-l from-[#CC4420]/50 to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto text-center z-10 relative">
        {/* Branding & Headline */}
        <div className="inline-block mb-2">
          <span className="text-xs font-mono tracking-widest border border-[#CC4420] text-white px-3 py-1.5 rounded mb-4">
            NEARINTENTS-HELPER
          </span>
        </div>

        <h1 className="text-6xl md:text-8xl font-semibold font-serif mb-6 leading-tight text-white">
          Explore <span className="px-2 bg-[#CC4420] text-white">Near</span>.
          <br />
          Launch <span className="px-2 bg-[#CC4420] text-white">Faster</span>.
        </h1>

        <p className="text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto mb-10">
          Discover real-world applications built on Near. Explore live dapps and intents showcasing privacy-preserving computation and seamless cross-chain experiences.
        </p>

        {/* CTAs */}
        <div className="flex justify-center space-x-4">
          <Link href="/explore">
            <button className="relative w-32 h-12 border border-zinc-700 rounded-sm font-semibold text-lg text-white transition duration-300 ease-in-out flex items-center justify-center hover:bg-[#CC4420]/10">
              <div className="absolute top-0 left-0 w-2 h-2 border-l-[3px] border-t-[2px] border-[#CC4420] z-10" />
              <div className="absolute top-0 right-0 w-2 h-2 border-r-[3px] border-t-[2px] border-[#CC4420] z-10" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-l-[3px] border-b-[2px] border-[#CC4420] z-10" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-r-[3px] border-b-[2px] border-[#CC4420] z-10" />
              <span>Explore ↗</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Background glow effects */}
      <div className="absolute w-96 h-96 bg-[#CC4420]/30 rounded-full blur-3xl opacity-60 bottom-10 left-10 animate-pulse pointer-events-none" />
      <div className="absolute w-96 h-96 bg-[#CC4420]/25 rounded-full blur-3xl opacity-50 top-10 right-10 animate-pulse pointer-events-none" />
    </section>
  );
};

export default Landing;
