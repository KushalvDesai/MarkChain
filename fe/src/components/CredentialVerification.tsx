"use client";

import { useState } from "react";
import { useVerifyBlockchainCredential } from "@/hooks/useBlockchain";
import { FiSearch, FiShield, FiCheckCircle, FiXCircle, FiUser, FiCalendar, FiAward } from "react-icons/fi";

export default function CredentialVerification() {
  const [studentAddress, setStudentAddress] = useState("");
  const [subject, setSubject] = useState("");
  const [showResults, setShowResults] = useState(false);
  
  const { data: verifiedCredential, loading, error } = useVerifyBlockchainCredential(
    { studentAddress, subject },
    { skip: !showResults || !studentAddress || !subject }
  );

  const handleVerify = () => {
    if (studentAddress && subject) {
      setShowResults(true);
    }
  };

  const handleReset = () => {
    setShowResults(false);
    setStudentAddress("");
    setSubject("");
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <div className="text-center mb-6">
          <FiShield className="mx-auto text-4xl text-blue-400 mb-3" />
          <h2 className="text-2xl font-bold text-white mb-2">Verify Blockchain Credential</h2>
          <p className="text-gray-400">
            Enter student details to verify their academic credentials on the blockchain
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Student Wallet Address
            </label>
            <input
              type="text"
              value={studentAddress}
              onChange={(e) => setStudentAddress(e.target.value)}
              placeholder="0x123d35cc6c6c12a4c3e7e4dae5e5b5b5b5b5b5b5"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Mathematics"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400"
            />
          </div>
        </div>

        <div className="flex space-x-3 mb-6">
          <button
            onClick={handleVerify}
            disabled={!studentAddress || !subject || loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors"
          >
            <FiSearch className="mr-2" />
            {loading ? "Verifying..." : "Verify Credential"}
          </button>
          <button
            onClick={handleReset}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Results */}
        {showResults && (
          <div className="border-t border-gray-700 pt-6">
            {loading && (
              <div className="text-center text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
                Verifying credential on blockchain...
              </div>
            )}

            {error && (
              <div className="bg-red-900/30 border border-red-600/50 rounded-lg p-4">
                <div className="flex items-center text-red-400 mb-2">
                  <FiXCircle className="mr-2" />
                  <span className="font-semibold">Verification Failed</span>
                </div>
                <p className="text-red-300 text-sm">{error.message}</p>
              </div>
            )}

            {!loading && !error && verifiedCredential?.verifyBlockchainCredential && (
              <div className="bg-green-900/30 border border-green-600/50 rounded-lg p-4">
                <div className="flex items-center text-green-400 mb-4">
                  <FiCheckCircle className="mr-2" />
                  <span className="font-semibold">Credential Verified Successfully</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center text-white">
                    <FiUser className="mr-2 text-blue-400" />
                    <span className="font-medium">Student:</span>
                    <span className="ml-2">{verifiedCredential.verifyBlockchainCredential.studentName}</span>
                  </div>
                  
                  <div className="flex items-center text-white">
                    <FiAward className="mr-2 text-green-400" />
                    <span className="font-medium">Subject:</span>
                    <span className="ml-2">{verifiedCredential.verifyBlockchainCredential.subject}</span>
                  </div>
                  
                  <div className="flex items-center text-white">
                    <span className="font-medium">Grade:</span>
                    <span className="ml-2 text-green-400 font-bold text-lg">
                      {verifiedCredential.verifyBlockchainCredential.grade}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-white">
                    <FiCalendar className="mr-2 text-yellow-400" />
                    <span className="font-medium">Updated:</span>
                    <span className="ml-2">
                      {new Date(verifiedCredential.verifyBlockchainCredential.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-white">
                    <FiShield className="mr-2 text-purple-400" />
                    <span className="font-medium">Issuer:</span>
                    <span className="ml-2 text-sm font-mono">
                      {verifiedCredential.verifyBlockchainCredential.issuer.slice(0, 20)}...
                    </span>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-700">
                    <p className="text-xs text-gray-400">
                      <strong>Transaction Hash:</strong> {verifiedCredential.verifyBlockchainCredential.blockchainTxHash}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      <strong>IPFS Hash:</strong> {verifiedCredential.verifyBlockchainCredential.ipfsHash}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!loading && !error && !verifiedCredential?.verifyBlockchainCredential && showResults && (
              <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4">
                <div className="flex items-center text-yellow-400 mb-2">
                  <FiXCircle className="mr-2" />
                  <span className="font-semibold">Credential Not Found</span>
                </div>
                <p className="text-yellow-300 text-sm">
                  No credential found for the specified student and subject. Please verify the details and try again.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}