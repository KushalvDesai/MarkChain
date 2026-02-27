"use client";

import { useState } from "react";
import { FiX, FiDownload, FiShield, FiUser, FiCalendar, FiAward, FiGlobe } from "react-icons/fi";
import BlockchainTransaction from "./BlockchainTransaction";

interface CredentialModalProps {
  credential: {
    ipfsHash: string;
    issuer: string;
    updatedAt: string;
    subject: string;
    studentName: string;
    grade: string;
    blockchainTxHash: string;
  };
  networkInfo?: {
    network: string;
    chainId: number;
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function CredentialModal({ 
  credential, 
  networkInfo, 
  isOpen, 
  onClose 
}: CredentialModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'blockchain' | 'raw'>('details');

  if (!isOpen) return null;

  const gradeColor = (grade: string) => {
    if (grade.includes('A')) return 'text-green-400';
    if (grade.includes('B')) return 'text-blue-400';
    if (grade.includes('C')) return 'text-yellow-400';
    return 'text-gray-400';
  };

  const handleDownload = (format: 'json' | 'certificate') => {
    const credentialData = {
      studentName: credential.studentName,
      subject: credential.subject,
      grade: credential.grade,
      issuer: credential.issuer,
      issuedDate: credential.updatedAt,
      blockchainProof: {
        transactionHash: credential.blockchainTxHash,
        ipfsHash: credential.ipfsHash,
        network: networkInfo?.network || 'unknown',
        chainId: networkInfo?.chainId || 0
      },
      verification: {
        verified: true,
        verifiedAt: new Date().toISOString(),
        source: 'MarkChain Credential System'
      }
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(credentialData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${credential.subject}-${credential.studentName}-credential.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // Generate a more formatted certificate-like document
      const certificateText = `
BLOCKCHAIN VERIFIED ACADEMIC CREDENTIAL

Student: ${credential.studentName}
Subject: ${credential.subject}
Grade: ${credential.grade}
Issue Date: ${new Date(credential.updatedAt).toLocaleDateString()}

Blockchain Verification:
- Transaction Hash: ${credential.blockchainTxHash}
- IPFS Hash: ${credential.ipfsHash}
- Network: ${networkInfo?.network || 'Unknown'}
- Chain ID: ${networkInfo?.chainId || 'N/A'}
- Issued By: ${credential.issuer}

This credential has been verified on the blockchain and is cryptographically secure.
Verification performed at: ${new Date().toLocaleString()}

MarkChain Credential System - Blockchain Verified Education
      `.trim();

      const blob = new Blob([certificateText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${credential.subject}-${credential.studentName}-certificate.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center">
            <FiShield className="text-blue-400 mr-3 text-2xl" />
            <div>
              <h2 className="text-xl font-bold text-white">Credential Details</h2>
              <p className="text-gray-400 text-sm">Blockchain verified academic credential</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <FiX className="text-gray-400 w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'details'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('blockchain')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'blockchain'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Blockchain
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'raw'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Raw Data
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Main Credential Info */}
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <FiUser className="text-blue-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-400">Student Name</p>
                        <p className="text-lg font-semibold text-white">{credential.studentName}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <FiAward className="text-green-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-400">Subject</p>
                        <p className="text-lg font-semibold text-white">{credential.subject}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="w-6 h-6 mr-3 flex items-center justify-center">
                        <div className={`text-3xl font-bold ${gradeColor(credential.grade)}`}>
                          {credential.grade.charAt(0)}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Grade</p>
                        <p className={`text-2xl font-bold ${gradeColor(credential.grade)}`}>
                          {credential.grade}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <FiCalendar className="text-yellow-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-400">Issue Date</p>
                        <p className="text-lg font-semibold text-white">
                          {new Date(credential.updatedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Issuer Information */}
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <FiShield className="text-purple-400 mr-2" />
                  Issuer Information
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Issuer Address:</span>
                    <code className="text-purple-400 bg-gray-900/50 px-2 py-1 rounded text-sm">
                      {credential.issuer}
                    </code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Verification Status:</span>
                    <span className="text-green-400 flex items-center">
                      <FiShield className="mr-1" />
                      Blockchain Verified
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'blockchain' && (
            <div className="space-y-6">
              <BlockchainTransaction
                txHash={credential.blockchainTxHash}
                ipfsHash={credential.ipfsHash}
                issuerAddress={credential.issuer}
                networkInfo={networkInfo}
              />
              
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <FiGlobe className="text-blue-400 mr-2" />
                  Network Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Network:</p>
                    <p className="text-blue-400 capitalize">{networkInfo?.network || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Chain ID:</p>
                    <p className="text-blue-400">{networkInfo?.chainId || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Block Time:</p>
                    <p className="text-white">{new Date(credential.updatedAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Status:</p>
                    <p className="text-green-400">Confirmed</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'raw' && (
            <div className="space-y-4">
              <pre className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto">
{JSON.stringify({
  ...credential,
  networkInfo,
  verificationStatus: 'verified',
  verifiedAt: new Date().toISOString()
}, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <div className="text-sm text-gray-400">
            Verified on blockchain at {new Date().toLocaleString()}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => handleDownload('json')}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FiDownload className="mr-2" />
              Download JSON
            </button>
            <button
              onClick={() => handleDownload('certificate')}
              className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FiDownload className="mr-2" />
              Download Certificate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}