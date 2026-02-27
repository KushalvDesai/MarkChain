"use client";

import DynamicNavbar from "@/components/DynamicNavbar";
import CredentialVerification from "@/components/CredentialVerification";
import { useGetBlockchainNetworkInfo, useTestIPFSConnection } from "@/hooks/useBlockchain";
import { FiGlobe, FiWifi, FiWifiOff, FiShield } from "react-icons/fi";

export default function VerifyCredential() {
  const { data: networkInfo } = useGetBlockchainNetworkInfo();
  const { data: ipfsStatus } = useTestIPFSConnection();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0b0b12' }}>
      <DynamicNavbar />
      
      <div className="p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Credential Verification</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Verify the authenticity of academic credentials stored on the blockchain. 
            This public verification system ensures the integrity and validity of educational achievements.
          </p>
        </div>

        {/* Network Status Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center text-sm">
                  <FiGlobe className="mr-2 text-blue-400" />
                  <span className="text-gray-300">Network:</span>
                  <span className="ml-1 text-blue-400">
                    {networkInfo?.getBlockchainNetworkInfo?.network || "Unknown"}
                  </span>
                </div>
                
                <div className="flex items-center text-sm">
                  <span className="text-gray-300">Chain ID:</span>
                  <span className="ml-1 text-blue-400">
                    {networkInfo?.getBlockchainNetworkInfo?.chainId || "N/A"}
                  </span>
                </div>
                
                <div className="flex items-center text-sm">
                  {ipfsStatus?.testIPFSConnection ? (
                    <span className="text-green-400 flex items-center">
                      <FiWifi className="mr-1" />
                      IPFS Connected
                    </span>
                  ) : (
                    <span className="text-red-400 flex items-center">
                      <FiWifiOff className="mr-1" />
                      IPFS Disconnected
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center text-sm text-green-400">
                <FiShield className="mr-1" />
                Secure Verification
              </div>
            </div>
          </div>
        </div>

        {/* Main Verification Component */}
        <CredentialVerification />

        {/* Information Section */}
        <div className="max-w-4xl mx-auto mt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center">
              <FiShield className="mx-auto text-3xl text-blue-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Blockchain Secured</h3>
              <p className="text-gray-400 text-sm">
                All credentials are stored on the blockchain, ensuring immutability and preventing tampering.
              </p>
            </div>
            
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center">
              <FiGlobe className="mx-auto text-3xl text-green-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Publicly Verifiable</h3>
              <p className="text-gray-400 text-sm">
                Anyone can verify the authenticity of credentials without requiring special access.
              </p>
            </div>
            
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center">
              <FiWifi className="mx-auto text-3xl text-purple-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">IPFS Storage</h3>
              <p className="text-gray-400 text-sm">
                Credential data is stored on IPFS for decentralized, permanent access.
              </p>
            </div>
          </div>
        </div>

        {/* How to Use Section */}
        <div className="max-w-4xl mx-auto mt-12">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">How to Verify Credentials</h3>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">1</span>
                <p>Enter the student's wallet address (Ethereum address starting with 0x)</p>
              </div>
              <div className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">2</span>
                <p>Specify the subject for which you want to verify the credential</p>
              </div>
              <div className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">3</span>
                <p>Click "Verify Credential" to check the blockchain for the credential</p>
              </div>
              <div className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">4</span>
                <p>View the verified credential details including grade, issuer, and blockchain proof</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}