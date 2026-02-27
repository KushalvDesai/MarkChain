"use client";

import { useState } from "react";
import { 
  useGetMyBlockchainStatus,
  useGetBlockchainNetworkInfo, 
  useTestIPFSConnection,
  useBlockchainSetupStatus,
  useStudentCredentials,
  useLinkWalletAddress,
  useRegisterUserDID
} from "@/hooks/useBlockchain";
import { 
  FiShield, 
  FiGlobe, 
  FiAward, 
  FiWifi, 
  FiWifiOff,
  FiLink,
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle
} from "react-icons/fi";

export default function StudentBlockchainStatus() {
  const [walletAddress, setWalletAddress] = useState("");
  const [didAddress, setDidAddress] = useState("");
  
  const { status, isSetupComplete, loading, refetch } = useBlockchainSetupStatus();
  const { credentials } = useStudentCredentials();
  const { data: networkInfo } = useGetBlockchainNetworkInfo();
  const { data: ipfsStatus } = useTestIPFSConnection();
  const [linkWallet, { loading: linkingWallet }] = useLinkWalletAddress();
  const [registerDID, { loading: registeringDID }] = useRegisterUserDID();

  const handleLinkWallet = async () => {
    if (!walletAddress) return;
    
    try {
      const result = await linkWallet({
        variables: { input: { walletAddress } }
      });
      
      if (result.data?.linkWalletAddress.success) {
        alert("Wallet linked successfully!");
        setWalletAddress("");
        refetch();
      }
    } catch (error) {
      console.error("Error linking wallet:", error);
    }
  };

  const handleRegisterDID = async () => {
    if (!didAddress) return;
    
    try {
      const result = await registerDID({
        variables: { input: { did: didAddress } }
      });
      
      if (result.data?.registerUserDID.success) {
        alert("DID registered successfully!");
        setDidAddress("");
        refetch();
      }
    } catch (error) {
      console.error("Error registering DID:", error);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-300 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-300 rounded"></div>
          <div className="h-4 bg-gray-300 rounded"></div>
          <div className="h-4 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-6 text-white">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <FiShield className="mr-2 text-blue-400" />
          Blockchain Status
        </h2>
        <button
          onClick={() => refetch()}
          className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <FiRefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Setup Status Overview */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center mb-3">
            {isSetupComplete ? (
              <FiCheckCircle className="text-green-400 mr-2" />
            ) : (
              <FiAlertCircle className="text-yellow-400 mr-2" />
            )}
            <h3 className="font-semibold">
              Setup {isSetupComplete ? "Complete" : "Incomplete"}
            </h3>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">DID Registered:</span>
              <span className={status?.didRegistered ? "text-green-400" : "text-red-400"}>
                {status?.didRegistered ? "✓" : "✗"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Blockchain Role:</span>
              <span className={status?.hasBlockchainRole ? "text-green-400" : "text-red-400"}>
                {status?.hasBlockchainRole ? "✓" : "✗"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Wallet Address:</span>
              <span className="text-blue-400">
                {status?.walletAddress ? 
                  `${status.walletAddress.slice(0, 6)}...${status.walletAddress.slice(-4)}` : 
                  "Not Set"
                }
              </span>
            </div>
          </div>
        </div>

        {/* Network Information */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <h3 className="font-semibold mb-3 flex items-center">
            <FiGlobe className="mr-2 text-blue-400" />
            Network Info
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Network:</span>
              <span className="text-blue-400">
                {networkInfo?.getBlockchainNetworkInfo?.network || "Unknown"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Chain ID:</span>
              <span className="text-blue-400">
                {networkInfo?.getBlockchainNetworkInfo?.chainId || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">IPFS:</span>
              <span className={ipfsStatus?.testIPFSConnection ? "text-green-400" : "text-red-400"}>
                {ipfsStatus?.testIPFSConnection ? (
                  <span className="flex items-center">
                    <FiWifi className="mr-1" /> Connected
                  </span>
                ) : (
                  <span className="flex items-center">
                    <FiWifiOff className="mr-1" /> Disconnected
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Credentials Summary */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <h3 className="font-semibold mb-3 flex items-center">
            <FiAward className="mr-2 text-green-400" />
            My Credentials
          </h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-1">
              {credentials.length}
            </div>
            <div className="text-sm text-gray-300">Verified Credentials</div>
          </div>
          {credentials.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-700">
              <div className="text-xs text-gray-400">Recent:</div>
              <div className="text-sm">
                {credentials[0]?.subject} - {credentials[0]?.grade}
              </div>
            </div>
          )}
        </div>

        {/* Quick Setup Actions */}
        {!isSetupComplete && (
          <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-400 mb-3">Complete Setup</h3>
            
            {!status?.walletAddress && (
              <div className="mb-4">
                <label className="block text-xs text-gray-300 mb-1">Link Wallet</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="0x..."
                    className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs"
                  />
                  <button
                    onClick={handleLinkWallet}
                    disabled={!walletAddress || linkingWallet}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-1 rounded text-xs"
                  >
                    {linkingWallet ? "..." : "Link"}
                  </button>
                </div>
              </div>
            )}

            {!status?.didRegistered && (
              <div>
                <label className="block text-xs text-gray-300 mb-1">Register DID</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={didAddress}
                    onChange={(e) => setDidAddress(e.target.value)}
                    placeholder="did:ethr:0x..."
                    className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs"
                  />
                  <button
                    onClick={handleRegisterDID}
                    disabled={!didAddress || registeringDID}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-3 py-1 rounded text-xs"
                  >
                    {registeringDID ? "..." : "Register"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}