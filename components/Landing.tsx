'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const Antigravity = dynamic(() => import('./Antigravity'), { ssr: false });

const Landing: React.FC = () => {
  return (
    <section className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden bg-[#0A0A0A] text-gray-100">
      {/* Full-page Antigravity background (orange) */}
      <div className="absolute inset-0 z-0">
        <Antigravity
          count={300}
          magnetRadius={6}
          ringRadius={7}
          waveSpeed={0.4}
          waveAmplitude={1}
          particleSize={1.5}
          lerpSpeed={0.05}
          color="#CC4420"
          autoAnimate
          particleVariance={1}
          rotationSpeed={0}
          depthFactor={1}
          pulseSpeed={3}
          particleShape="capsule"
          fieldStrength={10}
        />
      </div>

      {/* Content on top */}
      <div className="max-w-6xl mx-auto text-center z-10 relative">
        <div className="inline-block mb-2">
          <span className="text-xs font-mono tracking-widest border border-[#CC4420] text-white px-3 py-1.5 rounded mb-4">
            NEAR STATION
          </span>
        </div>

        <h1 className="text-6xl md:text-8xl font-semibold font-serif mb-6 leading-tight text-white">
          <span className="curved-underline text-white text-[0.85em]">Explore</span> <span className="px-2 bg-[#CC4420] text-white text-[0.85em]">Near Tech</span>
          <br />
          <span className="curved-underline text-white text-[0.85em]">Launch</span> <span className="px-2 bg-[#CC4420] text-white text-[0.85em]">faster</span>.
        </h1>

        <p className="text-lg md:text-xl text-zinc-300 max-w-2xl mx-auto mb-8">
          One stop for all Near tech—this is what we&apos;re building.
        </p>

        <div className="flex justify-center space-x-4">
          <Link href="/intents">
            <button className="relative w-32 h-12 border border-zinc-700 rounded-sm font-semibold text-lg text-white transition duration-300 ease-in-out flex items-center justify-center hover:bg-[#CC4420]/10">
              <div className="absolute top-0 left-0 w-2 h-2 border-l-[3px] border-t-[2px] border-[#CC4420] z-10" />
              <div className="absolute top-0 right-0 w-2 h-2 border-r-[3px] border-t-[2px] border-[#CC4420] z-10" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-l-[3px] border-b-[2px] border-[#CC4420] z-10" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-r-[3px] border-b-[2px] border-[#CC4420] z-10" />
              <span>Intents ↗</span>
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Landing;
