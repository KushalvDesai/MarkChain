"use client";

import { useState } from "react";
import { FiExternalLink, FiCopy, FiCheck, FiHash } from "react-icons/fi";

interface BlockchainTransactionProps {
  txHash?: string;
  ipfsHash?: string;
  issuerAddress?: string;
  networkInfo?: {
    network: string;
    chainId: number;
  };
  className?: string;
}

export default function BlockchainTransaction({ 
  txHash, 
  ipfsHash, 
  issuerAddress, 
  networkInfo,
  className = ""
}: BlockchainTransactionProps) {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const copyToClipboard = async (text: string, item: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(item);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const getExplorerUrl = (hash: string, type: 'tx' | 'address' = 'tx') => {
    const baseUrls: { [key: string]: string } = {
      'mainnet': 'https://etherscan.io',
      'polygon': 'https://polygonscan.com',
      'sepolia': 'https://sepolia.etherscan.io',
      'mumbai': 'https://mumbai.polygonscan.com',
      'localhost': '#'
    };
    
    const network = networkInfo?.network?.toLowerCase() || 'mainnet';
    const baseUrl = baseUrls[network] || baseUrls.mainnet;
    
    if (network === 'localhost') return '#';
    
    return type === 'tx' 
      ? `${baseUrl}/tx/${hash}`
      : `${baseUrl}/address/${hash}`;
  };

  const getIPFSUrl = (hash: string) => {
    return `https://ipfs.io/ipfs/${hash}`;
  };

  const truncateHash = (hash: string, start = 6, end = 4) => {
    return `${hash.slice(0, start)}...${hash.slice(-end)}`;
  };

  return (
    <div className={`bg-gray-800/30 border border-gray-700 rounded-lg p-4 ${className}`}>
      <div className="flex items-center mb-3">
        <FiHash className="text-blue-400 mr-2" />
        <h4 className="text-sm font-semibold text-white">Blockchain Details</h4>
      </div>

      <div className="space-y-3 text-sm">
        {/* Transaction Hash */}
        {txHash && (
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Transaction:</span>
            <div className="flex items-center space-x-2">
              <code className="text-blue-400 bg-gray-900/50 px-2 py-1 rounded text-xs">
                {truncateHash(txHash)}
              </code>
              <button
                onClick={() => copyToClipboard(txHash, 'tx')}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
                title="Copy transaction hash"
              >
                {copiedItem === 'tx' ? (
                  <FiCheck className="w-3 h-3 text-green-400" />
                ) : (
                  <FiCopy className="w-3 h-3 text-gray-400" />
                )}
              </button>
              <a
                href={getExplorerUrl(txHash, 'tx')}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 hover:bg-gray-700 rounded transition-colors"
                title="View on blockchain explorer"
              >
                <FiExternalLink className="w-3 h-3 text-gray-400" />
              </a>
            </div>
          </div>
        )}

        {/* IPFS Hash */}
        {ipfsHash && (
          <div className="flex items-center justify-between">
            <span className="text-gray-300">IPFS Hash:</span>
            <div className="flex items-center space-x-2">
              <code className="text-purple-400 bg-gray-900/50 px-2 py-1 rounded text-xs">
                {truncateHash(ipfsHash)}
              </code>
              <button
                onClick={() => copyToClipboard(ipfsHash, 'ipfs')}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
                title="Copy IPFS hash"
              >
                {copiedItem === 'ipfs' ? (
                  <FiCheck className="w-3 h-3 text-green-400" />
                ) : (
                  <FiCopy className="w-3 h-3 text-gray-400" />
                )}
              </button>
              <a
                href={getIPFSUrl(ipfsHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 hover:bg-gray-700 rounded transition-colors"
                title="View on IPFS"
              >
                <FiExternalLink className="w-3 h-3 text-gray-400" />
              </a>
            </div>
          </div>
        )}

        {/* Issuer Address */}
        {issuerAddress && (
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Issuer:</span>
            <div className="flex items-center space-x-2">
              <code className="text-green-400 bg-gray-900/50 px-2 py-1 rounded text-xs">
                {truncateHash(issuerAddress)}
              </code>
              <button
                onClick={() => copyToClipboard(issuerAddress, 'issuer')}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
                title="Copy issuer address"
              >
                {copiedItem === 'issuer' ? (
                  <FiCheck className="w-3 h-3 text-green-400" />
                ) : (
                  <FiCopy className="w-3 h-3 text-gray-400" />
                )}
              </button>
              <a
                href={getExplorerUrl(issuerAddress, 'address')}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 hover:bg-gray-700 rounded transition-colors"
                title="View issuer on blockchain explorer"
              >
                <FiExternalLink className="w-3 h-3 text-gray-400" />
              </a>
            </div>
          </div>
        )}

        {/* Network Info */}
        {networkInfo && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-700">
            <span className="text-gray-300">Network:</span>
            <div className="text-right">
              <div className="text-blue-400 capitalize">{networkInfo.network}</div>
              <div className="text-xs text-gray-400">Chain ID: {networkInfo.chainId}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}