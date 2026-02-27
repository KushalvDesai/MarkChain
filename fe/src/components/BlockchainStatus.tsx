"use client";

import { useGetBlockchainNetworkInfo, useTestIPFSConnection } from "@/hooks/useBlockchain";

interface BlockchainStatusProps {
  compact?: boolean;
  showDetails?: boolean;
}

export default function BlockchainStatus({ compact = false, showDetails = true }: BlockchainStatusProps) {
  const { data: networkData, loading: networkLoading } = useGetBlockchainNetworkInfo();
  const { data: ipfsData, loading: ipfsLoading } = useTestIPFSConnection();

  const networkInfo = networkData?.getBlockchainNetworkInfo;
  const ipfsConnected = ipfsData?.testIPFSConnection;
  const loading = networkLoading || ipfsLoading;

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
        <span className="text-gray-400 text-sm">Checking blockchain status...</span>
      </div>
    );
  }

  if (compact) {
    const isConnected = networkInfo?.isConnected && ipfsConnected;
    return (
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
        <span className={`text-sm ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
          Blockchain {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
        <span className="text-gray-300">Blockchain Network</span>
        <span className={`flex items-center ${networkInfo?.isConnected ? 'text-green-400' : 'text-red-400'}`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${networkInfo?.isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
          {networkInfo?.isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      
      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
        <span className="text-gray-300">IPFS Storage</span>
        <span className={`flex items-center ${ipfsConnected ? 'text-green-400' : 'text-red-400'}`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${ipfsConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
          {ipfsConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {showDetails && networkInfo && (
        <div className="p-3 bg-white/5 rounded-lg space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Network:</span>
            <span className="text-gray-300">{networkInfo.network}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Chain ID:</span>
            <span className="text-gray-300">{networkInfo.chainId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Contract:</span>
            <span className="text-gray-300 font-mono text-xs">
              {networkInfo.contractAddress.slice(0, 8)}...{networkInfo.contractAddress.slice(-6)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}