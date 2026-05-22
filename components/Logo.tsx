'use client';

import React from 'react';
import Link from 'next/link';

const Logo = ({ className = "h-10" }: { className?: string }) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof window !== 'undefined' && (window.location.pathname === '/' || window.location.pathname === '')) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <Link 
      href="/" 
      onClick={handleClick}
      className={`flex items-center gap-3 select-none cursor-pointer ${className}`}
    >
      {/* Glowing High-Tech Brand Symbol */}
      <div className="relative h-8 w-8 flex items-center justify-center">
        {/* Ambient glow in the background */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg blur opacity-40 group-hover:opacity-100 transition duration-500"></div>
        
        {/* Dynamic geometric SVG symbol */}
        <svg 
          viewBox="0 0 100 100" 
          className="relative h-8 w-8 text-white drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Inner futuristic 'N' / Nodes connection */}
          <path 
            d="M20 25V75L45 50L20 25Z" 
            fill="url(#logo-grad-primary)" 
          />
          <path 
            d="M80 75V25L55 50L80 75Z" 
            fill="url(#logo-grad-secondary)" 
          />
          <path 
            d="M45 50L50 40L55 50L50 60L45 50Z" 
            fill="#FFFFFF" 
            className="animate-pulse"
          />
          <line 
            x1="20" y1="25" x2="80" y2="25" 
            stroke="url(#logo-grad-line)" 
            strokeWidth="4" 
            strokeLinecap="round"
          />
          <line 
            x1="20" y1="75" x2="80" y2="75" 
            stroke="url(#logo-grad-line)" 
            strokeWidth="4" 
            strokeLinecap="round"
          />
          
          <defs>
            <linearGradient id="logo-grad-primary" x1="20" y1="25" x2="45" y2="75" gradientUnits="userSpaceOnUse">
              <stop stopColor="#06b6d4" />
              <stop offset="1" stopColor="#3b82f6" />
            </linearGradient>
            <linearGradient id="logo-grad-secondary" x1="80" y1="75" x2="55" y2="25" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3b82f6" />
              <stop offset="1" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="logo-grad-line" x1="20" y1="25" x2="80" y2="25" gradientUnits="userSpaceOnUse">
              <stop stopColor="#06b6d4" stopOpacity="0.3" />
              <stop offset="0.5" stopColor="#FFFFFF" />
              <stop offset="1" stopColor="#3b82f6" stopOpacity="0.3" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-center gap-1.5">
          <span className="font-outfit font-black tracking-tighter text-lg text-white">
            CSP
          </span>
          <span className="font-outfit font-black tracking-widest text-lg bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            NEXORA
          </span>
        </div>
        <span className="text-[7px] font-bold tracking-[0.35em] text-gray-500 uppercase mt-0.5">
          Inteligência Artificial
        </span>
      </div>
    </Link>
  );
};

export default Logo;
