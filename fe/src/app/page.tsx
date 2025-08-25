"use client";

import { useEffect, useRef, useState, memo } from "react";
import Hyperspeed from "@/components/Hyperspeed";
import MetaMaskLoginButton from "@/components/MetaMaskLoginButton";
import Link from "next/link";

// Memoize Hyperspeed to prevent re-renders
const MemoizedHyperspeed = memo(() => (
  <Hyperspeed
    effectOptions={{
      distortion: 'mountainDistortion',
      length: 400,
      roadWidth: 10,
      islandWidth: 2,
      lanesPerRoad: 4,
      fov: 90,
      fovSpeedUp: 150,
      speedUp: 2,
      carLightsFade: 0.4,
      totalSideLightSticks: 20,
      lightPairsPerRoadWay: 40,
      shoulderLinesWidthPercentage: 0.05,
      brokenLinesWidthPercentage: 0.1,
      brokenLinesLengthPercentage: 0.5,
      lightStickWidth: [0.12, 0.5],
      lightStickHeight: [1.3, 1.7],
      movingAwaySpeed: [60, 80],
      movingCloserSpeed: [-120, -160],
      carLightsLength: [400 * 0.03, 400 * 0.2],
      carLightsRadius: [0.05, 0.14],
      carWidthPercentage: [0.3, 0.5],
      carShiftX: [-0.8, 0.8],
      carFloorSeparation: [0, 5],
      colors: {
          roadColor: 0x080808,
          islandColor: 0x0a0a0a,
          background: 0x000000,
          shoulderLines: 0x131318,
          brokenLines: 0x131318,
          leftCars: [0xff102a, 0xEB383E, 0xff102a],
          rightCars: [0xdadafa, 0xBEBAE3, 0x8F97E4],
          sticks: 0xdadafa,
      }
    }}
  />
));

MemoizedHyperspeed.displayName = 'MemoizedHyperspeed';

export default function HomePage() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;
      
      const container = scrollContainerRef.current;
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight - container.clientHeight;
      const progress = Math.min(scrollTop / scrollHeight, 1);
      
      setScrollProgress(progress);
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scrollToLogin = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative h-screen overflow-hidden" style={{ backgroundColor: '#0b0b12' }}>
      {/* Hyperspeed Background - Fixed and unaffected by scroll */}
      <div className="fixed inset-0 z-0">
        <MemoizedHyperspeed />
      </div>

      {/* Floating Skip to Login Button */}
      {scrollProgress > 0.1 && scrollProgress < 0.75 && (
        <div className="fixed bottom-6 right-6 z-20">
          <button
            onClick={scrollToLogin}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105"
          >
            <span className="text-sm font-medium">Skip to Login</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7" />
            </svg>
          </button>
        </div>
      )}

      {/* Scrollable Content Container */}
      <div 
        ref={scrollContainerRef}
        className="relative z-10 h-full overflow-y-auto scrollbar-hide"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        
        {/* Section 1: Project Identity */}
        <section className="h-screen flex items-center justify-center text-center px-6 relative">
          <div 
            className="animate-fade-in"
            style={{
              opacity: Math.max(0, 1 - scrollProgress * 2),
              transform: `translateY(${scrollProgress * 50}px)`
            }}
          >
            <h1 className="text-7xl md:text-9xl font-bold text-white mb-6 tracking-tight">
              MarkChain
            </h1>
            <p className="text-2xl md:text-3xl text-gray-300 font-light mb-16">
              Academic Identity. <span className="text-blue-400">Decentralized.</span>
            </p>
            
            {/* Quick Access Button */}
            <div className="mb-8">
              <button
                onClick={scrollToLogin}
                className="shadow-[inset_0_0_0_2px_#616467] text-white px-8 py-3 rounded-full tracking-wide uppercase font-semibold bg-transparent hover:bg-[#616467] hover:text-white transition duration-300 text-sm"
              >
                Get Started Now
              </button>
            </div>
            
            {/* Scroll Indicator */}
            <div className="flex flex-col items-center space-y-2 animate-bounce">
              <p className="text-gray-400 text-sm font-light tracking-wide uppercase">
                Scroll to explore
              </p>
              <div className="w-px h-8 bg-gradient-to-b from-gray-400 to-transparent"></div>
              <svg 
                className="w-4 h-4 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
          </div>
        </section>

        {/* Section 2: A Simple Truth */}
        <section className="h-screen flex items-center justify-center text-center px-6">
          <div 
            className="max-w-4xl"
            style={{
              opacity: scrollProgress > 0.08 ? Math.min(1, (scrollProgress - 0.08) * 15) : 0,
              transform: `translateY(${Math.max(0, (0.15 - scrollProgress) * 30)}px)`
            }}
          >
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
              You don't own <br />
              <span className="text-red-400">your grades.</span>
            </h2>
            <p className="text-3xl md:text-4xl text-gray-300 font-light">
              Your institution does.
            </p>
          </div>
        </section>

        {/* Section 3: A Better Way */}
        <section className="h-screen flex items-center justify-center text-center px-6">
          <div 
            className="max-w-5xl"
            style={{
              opacity: scrollProgress > 0.18 ? Math.min(1, (scrollProgress - 0.18) * 15) : 0,
              transform: `translateY(${Math.max(0, (0.25 - scrollProgress) * 30)}px)`
            }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-12 leading-relaxed">
              MarkChain uses<br />
              <span className="text-purple-400">Self-Sovereign Identity (SSI)</span><br />
              to put your academic records<br />
              <span className="text-blue-400">back in your hands.</span>
            </h2>
          </div>
        </section>

        {/* Section 4: Faculty Issue Credentials */}
        <section className="h-screen flex items-center justify-center text-center px-6">
          <div 
            className="max-w-4xl"
            style={{
              opacity: scrollProgress > 0.28 ? Math.min(1, (scrollProgress - 0.28) * 15) : 0,
              transform: `translateY(${Math.max(0, (0.35 - scrollProgress) * 30)}px)`
            }}
          >
            <h2 className="text-4xl md:text-5xl font-light text-white">
              Faculty issue credentials.
            </h2>
          </div>
        </section>

        {/* Section 5: Students Store Privately */}
        <section className="h-screen flex items-center justify-center text-center px-6">
          <div 
            className="max-w-4xl"
            style={{
              opacity: scrollProgress > 0.38 ? Math.min(1, (scrollProgress - 0.38) * 15) : 0,
              transform: `translateY(${Math.max(0, (0.45 - scrollProgress) * 30)}px)`
            }}
          >
            <h2 className="text-4xl md:text-5xl font-light text-white">
              Students store them privately.
            </h2>
          </div>
        </section>

        {/* Section 6: Globally Verifiable */}
        <section className="h-screen flex items-center justify-center text-center px-6">
          <div 
            className="max-w-4xl"
            style={{
              opacity: scrollProgress > 0.48 ? Math.min(1, (scrollProgress - 0.48) * 15) : 0,
              transform: `translateY(${Math.max(0, (0.55 - scrollProgress) * 30)}px)`
            }}
          >
            <h2 className="text-4xl md:text-5xl font-light text-white">
              Credentials are verifiable — <span className="text-green-400">globally.</span>
            </h2>
          </div>
        </section>

        {/* Section 7: No Intermediaries */}
        <section className="h-screen flex items-center justify-center text-center px-6">
          <div 
            className="max-w-4xl"
            style={{
              opacity: scrollProgress > 0.58 ? Math.min(1, (scrollProgress - 0.58) * 15) : 0,
              transform: `translateY(${Math.max(0, (0.65 - scrollProgress) * 30)}px)`
            }}
          >
            <h2 className="text-4xl md:text-5xl font-light text-white">
              No intermediaries. No paperwork. <span className="text-blue-400">Ever.</span>
            </h2>
          </div>
        </section>

        {/* Section 8: Punch Line */}
        <section className="h-screen flex items-center justify-center text-center px-6">
          <div 
            className="max-w-4xl"
            style={{
              opacity: scrollProgress > 0.68 ? Math.min(1, (scrollProgress - 0.68) * 15) : 0,
            }}
          >
            <h2 className="text-6xl md:text-8xl font-bold text-white mb-8 leading-tight">
              Own your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                academic identity.
              </span>
            </h2>
            <p className="text-3xl md:text-4xl text-gray-300 font-light">
              For the first time.
            </p>
          </div>
        </section>

        {/* Section 9: Call to Action */}
        <section className="h-screen flex items-center justify-center text-center px-6">
          <div 
            className="transform transition-all duration-1000"
            style={{
              opacity: scrollProgress > 0.78 ? Math.min(1, (scrollProgress - 0.78) * 12) : 0,
              transform: `scale(${scrollProgress > 0.78 ? 1 : 0.8})`
            }}
          >
            <div className="mb-8">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Ready to own your credentials?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Connect your MetaMask wallet to get started
              </p>
            </div>
            
            <MetaMaskLoginButton />
            
          </div>
        </section>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 2s ease-out;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}
