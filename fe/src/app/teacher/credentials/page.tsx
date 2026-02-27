'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  useTeacherSubjectManagement,
  useTeacherCredentialManagement,
  useTeacherStudentsBySubject,
  useBlockchainSetupStatus
} from '@/hooks/useBlockchain';
import DynamicNavbar from '@/components/DynamicNavbar';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Student {
  userId: string;
  name: string;
  email: string;
  walletAddress?: string;
  didHash?: string;
  hasCredential: boolean;
}

interface Credential {
  ipfsHash: string;
  issuer: string;
  updatedAt: string;
  subject: string;
  studentName: string;
  grade: string;
  blockchainTxHash: string;
  action?: string;
}

export default function TeacherCredentialsPage() {
  const { user } = useAuth();
  const { isSetupComplete } = useBlockchainSetupStatus();
  
  // Teacher data hooks
  const { subjects } = useTeacherSubjectManagement();
  const { 
    issueCredential, 
    issuedCredentials, 
    refetch: refetchCredentials
  } = useTeacherCredentialManagement();
  
  // State management
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'students' | 'issued'>('students');
  
  // Form states
  const [credentialForm, setCredentialForm] = useState({
    grade: '',
    additionalData: ''
  });
  
  // Get students for selected subject
  const { students } = useTeacherStudentsBySubject(selectedSubject);

  // Auto-select first subject if available
  useEffect(() => {
    if (subjects.length > 0 && !selectedSubject) {
      setSelectedSubject(subjects[0]);
    }
  }, [subjects, selectedSubject]);

  // Handle credential issuance
  const handleIssueCredential = async () => {
    if (!selectedStudent || !selectedSubject || !credentialForm.grade) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // Create credential data object as expected by backend
      const credentialData = {
        studentName: selectedStudent.name,
        studentId: selectedStudent.userId,
        subject: selectedSubject,
        grade: credentialForm.grade,
        institution: "MarkChain University", // Default institution
        issueDate: new Date().toISOString(),
        additionalNotes: credentialForm.additionalData || ""
      };

      const result = await issueCredential({
        variables: {
          input: {
            studentAddress: selectedStudent.walletAddress || '',
            subject: selectedSubject,
            credentialData: JSON.stringify(credentialData)
          }
        }
      });

      if (result.data?.issueBlockchainCredential.success) {
        alert('Credential issued successfully!');
        setShowIssueModal(false);
        setCredentialForm({ grade: '', additionalData: '' });
        setSelectedStudent(null);
        refetchCredentials();
      } else {
        alert(`Error: ${result.data?.issueBlockchainCredential.error}`);
      }
    } catch (error) {
      console.error('Error issuing credential:', error);
      alert('Failed to issue credential');
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: '#0b0b12' }}>
        <DynamicNavbar />
        
        {!isSetupComplete ? (
          <div className="p-6">
            <div className="bg-red-600/20 border border-red-600/50 rounded-lg p-4">
              <p className="text-white">
                Please complete your blockchain setup to access teacher features.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">Credential Management</h1>
                <p className="text-gray-400">Manage student credentials and grades</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-blue-400 text-sm bg-blue-500/20 px-2 py-1 rounded">
                  {subjects.length} Subjects
                </span>
              </div>
            </div>

            {/* Subject Selection */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Select Subject</h2>
              <select 
                value={selectedSubject} 
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a subject to manage</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            {selectedSubject && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                {/* Tab Navigation */}
                <div className="flex space-x-4 mb-6 border-b border-gray-600">
                  <button
                    className={`pb-2 px-1 ${
                      activeTab === 'students'
                        ? 'text-blue-400 border-b-2 border-blue-400'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    onClick={() => setActiveTab('students')}
                  >
                    Students
                  </button>
                  <button
                    className={`pb-2 px-1 ${
                      activeTab === 'issued'
                        ? 'text-blue-400 border-b-2 border-blue-400'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    onClick={() => setActiveTab('issued')}
                  >
                    Issued Credentials
                  </button>
                </div>

                {/* Students Tab */}
                {activeTab === 'students' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">
                        Students in {selectedSubject}
                      </h3>
                      <span className="text-gray-400 text-sm bg-gray-600/50 px-2 py-1 rounded">
                        {students.length} Students
                      </span>
                    </div>

                    {students.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        No students enrolled in this subject
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {students.map((student: Student) => (
                          <div
                            key={student.userId}
                            className="flex items-center justify-between p-4 bg-gray-700/30 border border-gray-600 rounded-lg"
                          >
                            <div className="flex-1">
                              <h4 className="font-medium text-white">{student.name}</h4>
                              <p className="text-sm text-gray-400">{student.email}</p>
                              <div className="flex items-center space-x-2 mt-2">
                                <span className={`text-xs px-2 py-1 rounded ${
                                  student.walletAddress
                                    ? 'bg-green-600/20 text-green-400'
                                    : 'bg-gray-600/20 text-gray-400'
                                }`}>
                                  {student.walletAddress ? "Wallet Linked" : "No Wallet"}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  student.hasCredential
                                    ? 'bg-blue-600/20 text-blue-400'
                                    : 'bg-gray-600/20 text-gray-400'
                                }`}>
                                  {student.hasCredential ? "Has Credential" : "No Credential"}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors"
                                onClick={() => {
                                  setSelectedStudent(student);
                                  setShowIssueModal(true);
                                }}
                                disabled={!student.walletAddress}
                              >
                                Issue Credential
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Issued Credentials Tab */}
                {activeTab === 'issued' && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Issued Credentials</h3>
                    
                    {issuedCredentials.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        No credentials issued yet
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {issuedCredentials
                          .filter((cred: any) => cred.subject === selectedSubject)
                          .map((credential: any) => (
                            <div
                              key={credential.ipfsHash}
                              className="flex items-center justify-between p-4 bg-gray-700/30 border border-gray-600 rounded-lg"
                            >
                              <div className="flex-1">
                                <h4 className="font-medium text-white">{credential.studentName}</h4>
                                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                                  <span>Grade: {credential.grade}</span>
                                  <span>Issued: {new Date(credential.updatedAt).toLocaleDateString()}</span>
                                  <span>Subject: {credential.subject}</span>
                                </div>
                                {credential.blockchainTxHash && (
                                  <div className="mt-1">
                                    <span className="text-xs font-mono text-gray-500">
                                      {credential.blockchainTxHash.substring(0, 10)}...
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Issue Credential Modal */}
            {showIssueModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
                  <h2 className="text-xl font-semibold text-white mb-4">Issue Credential</h2>
                  
                  {selectedStudent && (
                    <div className="bg-gray-700/50 p-3 rounded-lg mb-4">
                      <p className="text-white"><strong>Student:</strong> {selectedStudent.name}</p>
                      <p className="text-gray-400"><strong>Subject:</strong> {selectedSubject}</p>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-300 block mb-2">
                        Grade *
                      </label>
                      <input
                        type="text"
                        value={credentialForm.grade}
                        onChange={(e) => setCredentialForm({ ...credentialForm, grade: e.target.value })}
                        placeholder="e.g., A+, 95, Excellent"
                        required
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-300 block mb-2">
                        Additional Notes (Optional)
                      </label>
                      <textarea
                        value={credentialForm.additionalData}
                        onChange={(e) => setCredentialForm({ ...credentialForm, additionalData: e.target.value })}
                        placeholder="Any additional information or comments"
                        rows={3}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-4">
                      <button
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
                        onClick={() => setShowIssueModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
                        onClick={handleIssueCredential}
                      >
                        Issue Credential
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}