/**
 * Demo component showing how to use the blockchain hooks
 * This file demonstrates the usage of all blockchain operations
 */

import React, { useState } from 'react';
import {
  // Admin hooks
  useAssignBlockchainRole,
  useAssignSubjectToTeacher,
  useRemoveSubjectFromTeacher,
  useRevokeBlockchainCredential,
  
  // User hooks
  useLinkWalletAddress,
  useRegisterUserDID,
  useGetMyBlockchainStatus,
  
  // Teacher hooks
  useIssueBlockchainCredential,
  useGetMyAssignedSubjects,
  
  // Student hooks
  useGetMySubjectCredential,
  useGetMyBlockchainCredentials,
  
  // Public hooks
  useVerifyBlockchainCredential,
  
  // Utility hooks
  useGetBlockchainNetworkInfo,
  useTestIPFSConnection,
  
  // Composite hooks
  useBlockchainSetupStatus,
  useTeacherSubjectManagement,
  useStudentCredentials
} from '../hooks/useBlockchain';

export const BlockchainDemo: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [subject, setSubject] = useState('');

  // Admin operations
  const [assignRole] = useAssignBlockchainRole();
  const [assignSubject] = useAssignSubjectToTeacher();
  const [removeSubject] = useRemoveSubjectFromTeacher();
  const [revokeCredential] = useRevokeBlockchainCredential();

  // User operations
  const [linkWallet] = useLinkWalletAddress();
  const [registerDID] = useRegisterUserDID();
  const { data: blockchainStatus } = useGetMyBlockchainStatus();

  // Teacher operations
  const [issueCredential] = useIssueBlockchainCredential();
  const { data: assignedSubjects } = useGetMyAssignedSubjects();

  // Student operations
  const { data: subjectCredential } = useGetMySubjectCredential(subject);
  const { data: allCredentials } = useGetMyBlockchainCredentials();

  // Public operations
  const { data: verifiedCredential } = useVerifyBlockchainCredential({
    studentAddress: walletAddress,
    subject: subject
  }, { skip: !walletAddress || !subject });

  // Utility operations
  const { data: networkInfo } = useGetBlockchainNetworkInfo();
  const { data: ipfsStatus } = useTestIPFSConnection();

  // Composite hooks
  const { status: setupStatus, isSetupComplete } = useBlockchainSetupStatus();
  const { subjects: teacherSubjects } = useTeacherSubjectManagement();
  const { credentials: studentCreds } = useStudentCredentials();

  // Handler functions
  const handleAssignRole = async () => {
    try {
      const result = await assignRole({
        variables: {
          input: {
            userAddress: walletAddress,
            role: 'TEACHER_ROLE'
          }
        }
      });
      console.log('Role assigned:', result.data?.assignBlockchainRole);
    } catch (error) {
      console.error('Error assigning role:', error);
    }
  };

  const handleLinkWallet = async () => {
    try {
      const result = await linkWallet({
        variables: {
          input: {
            walletAddress: walletAddress
          }
        }
      });
      console.log('Wallet linked:', result.data?.linkWalletAddress);
    } catch (error) {
      console.error('Error linking wallet:', error);
    }
  };

  const handleIssueCredential = async () => {
    try {
      const credentialData = JSON.stringify({
        studentName: "John Doe",
        studentId: "23CS001",
        subject: subject,
        grade: "A+",
        marks: 95,
        semester: "Fall 2023",
        institution: "Charusat University"
      });

      const result = await issueCredential({
        variables: {
          input: {
            studentAddress: walletAddress,
            subject: subject,
            credentialData: credentialData
          }
        }
      });
      console.log('Credential issued:', result.data?.issueBlockchainCredential);
    } catch (error) {
      console.error('Error issuing credential:', error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Blockchain Operations Demo</h1>
      
      {/* Input fields */}
      <div className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Wallet Address:</label>
          <input
            type="text"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="0x742d35cc6c6c12a4c3e7e4dae5e5b5b5b5b5b5b5"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Subject:</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Mathematics"
          />
        </div>
      </div>

      {/* Status Information */}
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">Status Information</h2>
        <p>Blockchain Setup Complete: {isSetupComplete ? 'Yes' : 'No'}</p>
        <p>Network: {networkInfo?.getBlockchainNetworkInfo?.network || 'Unknown'}</p>
        <p>IPFS Connected: {ipfsStatus?.testIPFSConnection ? 'Yes' : 'No'}</p>
        <p>Assigned Subjects: {teacherSubjects?.length || 0}</p>
        <p>Student Credentials: {studentCreds?.length || 0}</p>
      </div>

      {/* Action buttons */}
      <div className="space-y-4">
        <div className="space-x-2">
          <button
            onClick={handleAssignRole}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={!walletAddress}
          >
            Assign Teacher Role
          </button>
          <button
            onClick={handleLinkWallet}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            disabled={!walletAddress}
          >
            Link Wallet
          </button>
          <button
            onClick={handleIssueCredential}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            disabled={!walletAddress || !subject}
          >
            Issue Credential
          </button>
        </div>
      </div>

      {/* Data Display */}
      <div className="mt-6 space-y-4">
        {blockchainStatus?.getMyBlockchainStatus && (
          <div className="p-4 border rounded">
            <h3 className="font-semibold">My Blockchain Status:</h3>
            <pre className="text-sm bg-gray-100 p-2 rounded mt-2">
              {JSON.stringify(blockchainStatus.getMyBlockchainStatus, null, 2)}
            </pre>
          </div>
        )}

        {assignedSubjects?.getMyAssignedSubjects && (
          <div className="p-4 border rounded">
            <h3 className="font-semibold">Assigned Subjects:</h3>
            <ul className="list-disc pl-4">
              {assignedSubjects.getMyAssignedSubjects.map((sub, index) => (
                <li key={index}>{sub}</li>
              ))}
            </ul>
          </div>
        )}

        {allCredentials?.getMyBlockchainCredentials && (
          <div className="p-4 border rounded">
            <h3 className="font-semibold">My Credentials:</h3>
            <pre className="text-sm bg-gray-100 p-2 rounded mt-2">
              {JSON.stringify(allCredentials.getMyBlockchainCredentials, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockchainDemo;