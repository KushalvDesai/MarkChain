"use client";

import { useState } from "react";

interface BlockchainInfoProps {
  profile: any;
  userAddress: string;
}

export default function BlockchainInfo({ profile, userAddress }: BlockchainInfoProps) {
  const [copied, setCopied] = useState<string>("");

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(""), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const truncateAddress = (address: string, length: number = 10) => {
    if (!address) return '';
    return `${address.slice(0, length)}...${address.slice(-6)}`;
  };

  return (
    <div className="p-6 text-white h-full">
      <h3 className="text-lg font-semibold border-b border-gray-600 pb-2 mb-6">
        Blockchain Identity
      </h3>
      
      <div className="space-y-4">
        {/* Wallet Address */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Wallet Address
          </label>
          <div className="px-3 py-2 bg-gray-800 rounded-lg flex items-center justify-between">
            <p className="font-mono text-xs break-all flex-1">
              {truncateAddress(profile?.walletAddress || userAddress)}
            </p>
            <button
              onClick={() => handleCopy(profile?.walletAddress || userAddress, 'wallet')}
              className="ml-2 p-1 hover:bg-gray-700 rounded transition-colors"
              title="Copy wallet address"
            >
              {copied === 'wallet' ? (
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* DID */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Decentralized Identity (DID)
          </label>
          <div className="px-3 py-2 bg-gray-800 rounded-lg flex items-center justify-between">
            <p className="font-mono text-xs break-all text-blue-400 flex-1">
              {profile?.did ? truncateAddress(profile.did, 15) : 'Not generated'}
            </p>
            {profile?.did && (
              <button
                onClick={() => handleCopy(profile.did, 'did')}
                className="ml-2 p-1 hover:bg-gray-700 rounded transition-colors"
                title="Copy DID"
              >
                {copied === 'did' ? (
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Account Status
          </label>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${profile?.isActive ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className={`text-sm ${profile?.isActive ? 'text-green-400' : 'text-red-400'}`}>
              {profile?.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Last Login */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Last Login
          </label>
          <p className="px-3 py-2 bg-gray-800 rounded-lg text-sm">
            {profile?.lastLogin 
              ? new Date(profile.lastLogin).toLocaleString()
              : 'Never'
            }
          </p>
        </div>

        {/* Quick Actions */}
        <div className="pt-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Quick Actions
          </label>
          <div className="space-y-2">
            <button
              onClick={() => window.open(`https://etherscan.io/address/${profile?.walletAddress || userAddress}`, '_blank')}
              className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm"
            >
              View on Etherscan
            </button>
            {profile?.did && (
              <button
                onClick={() => handleCopy(profile.did, 'did-full')}
                className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm"
              >
                {copied === 'did-full' ? 'Copied!' : 'Copy Full DID'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
