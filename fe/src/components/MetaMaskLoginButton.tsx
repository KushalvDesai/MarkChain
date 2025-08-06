"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMetaMaskAuth } from "@/hooks/useMetaMaskAuth";

export default function MetaMaskLoginButton() {
  const router = useRouter();
  const { account, isConnecting, error, authenticateWithMetaMask, disconnect } = useMetaMaskAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = async () => {
    try {
      const result = await authenticateWithMetaMask();
      if (result) {
        setIsAuthenticated(true);
        console.log('Authentication successful:', result);
        // Show success message briefly before redirecting
        setTimeout(() => {
          router.push('/student');
        }, 2000);
      }
    } catch (err) {
      console.error('Authentication failed:', err);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setIsAuthenticated(false);
  };

  if (isAuthenticated && account) {
    return (
      <div className="flex flex-col items-center space-y-4">
        <div className="text-green-400 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-xl font-semibold mb-2">Successfully Connected!</p>
          <p className="text-sm text-gray-300">Redirecting to dashboard...</p>
          <p className="font-mono text-xs break-all mt-2 px-4 py-2 bg-gray-800 rounded-lg">
            {account}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <button
        onClick={handleLogin}
        disabled={isConnecting}
        className="shadow-[inset_0_0_0_2px_#616467] text-white px-12 py-3 rounded-full tracking-wide uppercase font-semibold bg-transparent hover:bg-[#616467] hover:text-white transition duration-300 text-sm"
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
      
      {error && (
        <div className="text-red-400 text-sm text-center max-w-md">
          {error}
        </div>
      )}
    </div>
  );
}
