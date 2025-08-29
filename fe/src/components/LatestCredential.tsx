"use client";

import { gql, useQuery } from "@apollo/client";
import { useState } from "react";
import { GetLatestCredentialResponse } from "@/types/graphql";

const GET_LATEST_CREDENTIAL = gql`
  query GetLatestCredential {
    getLatestCredential {
      subject
      ipfsHash
      issuer
      updatedAt
      subjectHash
    }
  }
`;

export default function LatestCredential() {
  const { loading, error, data } = useQuery<GetLatestCredentialResponse>(GET_LATEST_CREDENTIAL);
  const [copied, setCopied] = useState(false);

  const handleCopyHash = async () => {
    if (!data?.getLatestCredential) return;
    
    try {
      await navigator.clipboard.writeText(data.getLatestCredential.ipfsHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (loading) return <p className="text-white p-6">Loading latest credential...</p>;
  if (error) return <p className="text-red-500 p-6">Error loading credential: {error.message}</p>;

  const credential = data?.getLatestCredential;

  if (!credential) {
    return (
      <div className="p-6 text-white">
        <h2 className="text-xl font-semibold mb-4">Latest Verifiable Credential</h2>
        <p className="text-gray-400">No credentials found</p>
      </div>
    );
  }

  const formatDate = (timestamp: string) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateHash = (hash: string, length: number = 16) => {
    return `${hash.substring(0, length)}...${hash.substring(hash.length - length)}`;
  };

  return (
    <div className="p-6 text-white">
      <h2 className="text-xl font-semibold mb-4">Latest Verifiable Credential</h2>
      
      <div className="bg-gray-700 rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Subject</h3>
            <p className="text-lg font-semibold text-blue-400">{credential.subject}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Last Updated</h3>
            <p className="text-sm text-gray-200">{formatDate(credential.updatedAt)}</p>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-2">Issuer Address</h3>
          <p className="text-sm font-mono text-green-400 break-all">
            {credential.issuer}
          </p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-2">Subject Hash</h3>
          <p className="text-sm font-mono text-yellow-400 break-all">
            {credential.subjectHash}
          </p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-2">IPFS Hash</h3>
          <div className="flex items-center justify-between bg-gray-600 rounded p-3">
            <p className="text-sm font-mono text-purple-400 flex-1">
              {truncateHash(credential.ipfsHash, 20)}
            </p>
            <button 
              onClick={handleCopyHash}
              className={`ml-3 px-3 py-1 ${copied ? 'bg-blue-500' : 'bg-blue-600 hover:bg-blue-700'} text-white text-xs rounded transition-colors`}
            >
              {copied ? 'Copied!' : 'Copy Full Hash'}
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-300">Verified Credential</span>
          </div>
          
          <button 
            onClick={() => window.open(`https://ipfs.io/ipfs/${credential.ipfsHash}`, '_blank')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
          >
            View on IPFS
          </button>
        </div>
      </div>
    </div>
  );
}
