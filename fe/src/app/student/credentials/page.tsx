"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSearchParams } from "next/navigation";
import DynamicNavbar from "@/components/DynamicNavbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  useGetMyBlockchainCredentials,
  useGetMySubjectCredential,
  useLinkWalletAddress,
  useRegisterUserDID,
  useGetMyBlockchainStatus,
  useGetBlockchainNetworkInfo,
  useTestIPFSConnection,
  useBlockchainSetupStatus,
  useStudentCredentials
} from "@/hooks/useBlockchain";
import {
  useGetMyCredential,
  useIsCredentialValid
} from "@/hooks/useCredentialManagement";
import {
  FiUser,
  FiAward,
  FiCalendar,
  FiGlobe,
  FiLink,
  FiShield,
  FiRefreshCw,
  FiDownload,
  FiEye,
  FiWifi,
  FiWifiOff
} from "react-icons/fi";
import CredentialModal from "@/components/CredentialModal"; interface CredentialCardProps {
  credential: {
    ipfsHash: string;
    issuer: string;
    updatedAt: string;
    subject: string;
    studentName: string;
    grade: string;
    blockchainTxHash: string;
  };
  onView: () => void;
  onDownload: () => void;
}

const CredentialCard: React.FC<CredentialCardProps> = ({ credential, onView, onDownload }) => {
  const gradeColor = (grade: string) => {
    if (grade.includes('A')) return 'text-green-400';
    if (grade.includes('B')) return 'text-blue-400';
    if (grade.includes('C')) return 'text-yellow-400';
    return 'text-gray-400';
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-white mb-1">{credential.subject}</h3>
          <div className="flex items-center text-gray-400 text-sm">
            <FiUser className="mr-1" />
            {credential.studentName}
          </div>
        </div>
        <div className={`text-2xl font-bold ${gradeColor(credential.grade)}`}>
          {credential.grade}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-gray-300 text-sm">
          <FiShield className="mr-2" />
          Issuer: {credential.issuer.slice(0, 20)}...
        </div>
        <div className="flex items-center text-gray-300 text-sm">
          <FiCalendar className="mr-2" />
          Updated: {new Date(credential.updatedAt).toLocaleDateString()}
        </div>
        <div className="flex items-center text-gray-300 text-sm">
          <FiLink className="mr-2" />
          TX: {credential.blockchainTxHash.slice(0, 20)}...
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={onView}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors"
        >
          <FiEye className="mr-2" />
          View Details
        </button>
        <button
          onClick={onDownload}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors"
        >
          <FiDownload className="mr-2" />
          Download
        </button>
      </div>
    </div>
  );
};

export default function StudentCredentials() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [selectedSubject, setSelectedSubject] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [didAddress, setDidAddress] = useState("");
  const [selectedCredential, setSelectedCredential] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle URL parameters
  useEffect(() => {
    const subjectParam = searchParams.get('subject');
    if (subjectParam) {
      setSelectedSubject(subjectParam);
    }
  }, [searchParams]);

  // Blockchain hooks
  const { credentials, loading: credentialsLoading, error: credentialsError, refetch } = useStudentCredentials();
  const { data: subjectCredential } = useGetMySubjectCredential(selectedSubject, { skip: !selectedSubject });
  const [linkWallet, { loading: linkingWallet }] = useLinkWalletAddress();
  const [registerDID, { loading: registeringDID }] = useRegisterUserDID();
  const { status, isSetupComplete, loading: statusLoading } = useBlockchainSetupStatus();
  const { data: networkInfo } = useGetBlockchainNetworkInfo();
  const { data: ipfsStatus } = useTestIPFSConnection();

  // New credential management hooks
  const { data: myCredentialData, loading: myCredentialLoading, error: myCredentialError } = useGetMyCredential(
    selectedSubject,
    { skip: !selectedSubject }
  );
  const { data: validityData, loading: validityLoading } = useIsCredentialValid(
    { studentAddress: user?.walletAddress || '', subject: selectedSubject },
    { skip: !selectedSubject || !user?.walletAddress }
  );

  const handleLinkWallet = async () => {
    if (!walletAddress) return;

    try {
      // Debug: Check if we have a valid token
      const token = localStorage.getItem('accessToken');
      console.log('Token exists:', !!token);
      console.log('Token preview:', token ? token.substring(0, 50) + '...' : 'No token');

      // Debug: Check user info
      console.log('Current user:', user);

      const result = await linkWallet({
        variables: {
          input: { walletAddress }
        }
      });

      console.log('Link wallet result:', result);

      if (result.data?.linkWalletAddress.success) {
        alert("Wallet linked successfully!");
        setWalletAddress("");
      } else {
        alert(`Error: ${result.data?.linkWalletAddress.error}`);
      }
    } catch (error) {
      console.error("Error linking wallet:", error);
      alert("Failed to link wallet");
    }
  };

  const handleRegisterDID = async () => {
    if (!didAddress) return;

    try {
      const result = await registerDID({
        variables: {
          input: { did: didAddress }
        }
      });

      if (result.data?.registerUserDID.success) {
        alert("DID registered successfully!");
        setDidAddress("");
      } else {
        alert(`Error: ${result.data?.registerUserDID.error}`);
      }
    } catch (error) {
      console.error("Error registering DID:", error);
      alert("Failed to register DID");
    }
  };

  const handleViewCredential = (credential: any) => {
    setSelectedCredential(credential);
    setIsModalOpen(true);
  };

  const handleDownloadCredential = (credential: any) => {
    // Generate and download credential
    const credentialData = {
      subject: credential.subject,
      studentName: credential.studentName,
      grade: credential.grade,
      issuer: credential.issuer,
      updatedAt: credential.updatedAt,
      blockchainTx: credential.blockchainTxHash,
      ipfsHash: credential.ipfsHash
    };

    const blob = new Blob([JSON.stringify(credentialData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${credential.subject}-credential.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (statusLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-white">Loading blockchain status...</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: '#0b0b12' }}>
        <DynamicNavbar />

        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">My Blockchain Credentials</h1>
            <p className="text-gray-400">
              Manage your verified academic credentials on the blockchain
            </p>
          </div>

          {/* Blockchain Setup Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Setup Status Card */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FiShield className="mr-2" />
                Blockchain Setup
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">DID Registered:</span>
                  <span className={status?.didRegistered ? "text-green-400" : "text-red-400"}>
                    {status?.didRegistered ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Blockchain Role:</span>
                  <span className={status?.hasBlockchainRole ? "text-green-400" : "text-red-400"}>
                    {status?.hasBlockchainRole ? "Assigned" : "Not Assigned"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Setup Complete:</span>
                  <span className={isSetupComplete ? "text-green-400" : "text-yellow-400"}>
                    {isSetupComplete ? "Complete" : "Incomplete"}
                  </span>
                </div>
              </div>
            </div>

            {/* Network Info Card */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FiGlobe className="mr-2" />
                Network Info
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Network:</span>
                  <span className="text-blue-400">{networkInfo?.getBlockchainNetworkInfo?.network || "Unknown"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Chain ID:</span>
                  <span className="text-blue-400">{networkInfo?.getBlockchainNetworkInfo?.chainId || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">IPFS:</span>
                  <span className={ipfsStatus?.testIPFSConnection ? "text-green-400 flex items-center" : "text-red-400 flex items-center"}>
                    {ipfsStatus?.testIPFSConnection ? <FiWifi className="mr-1" /> : <FiWifiOff className="mr-1" />}
                    {ipfsStatus?.testIPFSConnection ? "Connected" : "Disconnected"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FiRefreshCw className="mr-2" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => refetch()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Refresh Credentials
                </button>
                <button
                  onClick={() => setSelectedSubject("Mathematics")}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  View Math Credential
                </button>
              </div>
            </div>
          </div>

          {/* Setup Actions (if not complete) */}
          {!isSetupComplete && (
            <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-yellow-400 mb-4">Complete Your Blockchain Setup</h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Link Wallet */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Link Wallet Address
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      placeholder="0x742d35cc6c6c12a4c3e7e4dae5e5b5b5b5b5b5b5"
                      className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    />
                    <button
                      onClick={handleLinkWallet}
                      disabled={!walletAddress || linkingWallet}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      {linkingWallet ? "Linking..." : "Link"}
                    </button>
                  </div>
                </div>

                {/* Register DID */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Register DID
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={didAddress}
                      onChange={(e) => setDidAddress(e.target.value)}
                      placeholder="did:ethr:0x742d35cc6c6c12a4c3e7e4dae5e5b5b5b5b5b5b5"
                      className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    />
                    <button
                      onClick={handleRegisterDID}
                      disabled={!didAddress || registeringDID}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      {registeringDID ? "Registering..." : "Register"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subject Credential Lookup */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Look up Subject Credential</h3>
            <div className="flex space-x-4">
              <input
                type="text"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                placeholder="Enter subject name (e.g., Mathematics)"
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              />
              <button
                onClick={() => setSelectedSubject("")}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Clear
              </button>
            </div>

            {selectedSubject && subjectCredential?.getMySubjectCredential && (
              <div className="mt-4">
                <CredentialCard
                  credential={subjectCredential.getMySubjectCredential}
                  onView={() => handleViewCredential(subjectCredential.getMySubjectCredential)}
                  onDownload={() => handleDownloadCredential(subjectCredential.getMySubjectCredential)}
                />
              </div>
            )}

            {/* Enhanced Credential Details from New API */}
            {selectedSubject && myCredentialData?.getMyCredential && (
              <div className="mt-6 bg-gray-700/50 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-white">Detailed Credential Info</h4>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${validityData?.isCredentialValid
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                    {validityLoading ? 'Checking...' : validityData?.isCredentialValid ? '✓ Valid' : '✗ Invalid'}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-600/30 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Version</div>
                    <div className="text-white font-semibold">{myCredentialData.getMyCredential.version}</div>
                  </div>
                  <div className="bg-gray-600/30 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Components</div>
                    <div className="text-white font-semibold">{myCredentialData.getMyCredential.totalComponents}</div>
                  </div>
                  <div className="bg-gray-600/30 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Created</div>
                    <div className="text-white font-semibold text-sm">
                      {new Date(myCredentialData.getMyCredential.createdAt * 1000).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="bg-gray-600/30 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Expires</div>
                    <div className={`font-semibold text-sm ${myCredentialData.getMyCredential.isExpired ? 'text-red-400' : 'text-green-400'
                      }`}>
                      {new Date(myCredentialData.getMyCredential.expiresAt * 1000).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-600/30 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">IPFS Hash</div>
                    <div className="text-white font-mono text-xs break-all">{myCredentialData.getMyCredential.ipfsHash}</div>
                  </div>
                  <div className="bg-gray-600/30 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Last Updated</div>
                    <div className="text-white font-semibold">
                      {new Date(myCredentialData.getMyCredential.lastUpdatedAt * 1000).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-4">
                  <div className={`flex items-center text-sm ${myCredentialData.getMyCredential.revoked ? 'text-red-400' : 'text-green-400'
                    }`}>
                    <span className={`w-2 h-2 rounded-full mr-2 ${myCredentialData.getMyCredential.revoked ? 'bg-red-400' : 'bg-green-400'
                      }`}></span>
                    {myCredentialData.getMyCredential.revoked ? 'Revoked' : 'Active'}
                  </div>
                  <div className={`flex items-center text-sm ${myCredentialData.getMyCredential.isExpired ? 'text-red-400' : 'text-green-400'
                    }`}>
                    <span className={`w-2 h-2 rounded-full mr-2 ${myCredentialData.getMyCredential.isExpired ? 'bg-red-400' : 'bg-green-400'
                      }`}></span>
                    {myCredentialData.getMyCredential.isExpired ? 'Expired' : 'Not Expired'}
                  </div>
                </div>
              </div>
            )}

            {selectedSubject && myCredentialLoading && (
              <div className="mt-4 text-center text-gray-400 py-4">Loading credential details...</div>
            )}

            {selectedSubject && myCredentialError && (
              <div className="mt-4 text-center text-red-400 py-4">Error: {myCredentialError.message}</div>
            )}
          </div>

          {/* All Credentials */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <FiAward className="mr-2" />
                All My Credentials ({credentials.length})
              </h3>
              <button
                onClick={() => refetch()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
              >
                <FiRefreshCw className="mr-2" />
                Refresh
              </button>
            </div>

            {credentialsLoading ? (
              <div className="text-center text-gray-400 py-8">Loading credentials...</div>
            ) : credentialsError ? (
              <div className="text-center text-red-400 py-8">Error loading credentials: {credentialsError.message}</div>
            ) : credentials.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <FiAward className="mx-auto text-6xl mb-4 opacity-20" />
                <p>No credentials found</p>
                <p className="text-sm">Complete your blockchain setup to view credentials</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {credentials.map((credential, index) => (
                  <CredentialCard
                    key={index}
                    credential={credential}
                    onView={() => handleViewCredential(credential)}
                    onDownload={() => handleDownloadCredential(credential)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Credential Modal */}
        {selectedCredential && (
          <CredentialModal
            credential={selectedCredential}
            networkInfo={networkInfo?.getBlockchainNetworkInfo}
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedCredential(null);
            }}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}