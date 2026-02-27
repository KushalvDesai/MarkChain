'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  useTeacherSubjectManagement,
  useTeacherStudentsBySubject,
  useBlockchainSetupStatus
} from '@/hooks/useBlockchain';
import DynamicNavbar from '@/components/DynamicNavbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

interface Student {
  userId: string;
  name: string;
  email: string;
  walletAddress?: string;
  didHash?: string;
  hasCredential: boolean;
}

export default function TeacherStudentsPage() {
  const { user } = useAuth();
  const { isSetupComplete } = useBlockchainSetupStatus();
  const { subjects, loading: subjectsLoading } = useTeacherSubjectManagement();
  
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'with-wallet' | 'with-credential' | 'without-credential'>('all');
  
  const { students, loading: studentsLoading } = useTeacherStudentsBySubject(selectedSubject);

  // Auto-select first subject if available
  React.useEffect(() => {
    if (subjects.length > 0 && !selectedSubject) {
      setSelectedSubject(subjects[0]);
    }
  }, [subjects, selectedSubject]);

  // Filter students based on search term and filter status
  const filteredStudents = students.filter((student: Student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = (() => {
      switch (filterStatus) {
        case 'with-wallet': return !!student.walletAddress;
        case 'with-credential': return student.hasCredential;
        case 'without-credential': return !student.hasCredential;
        default: return true;
      }
    })();
    
    return matchesSearch && matchesFilter;
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: '#0b0b12' }}>
        <DynamicNavbar />
        
        {!isSetupComplete ? (
          <div className="p-6">
            <div className="bg-red-600/20 border border-red-600/50 rounded-lg p-4">
              <p className="text-white">
                Please complete your blockchain setup (wallet linking and DID registration) to access teacher features.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">My Students</h1>
                <p className="text-gray-400">Manage and view students across your subjects</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-blue-400 text-sm bg-blue-500/20 px-2 py-1 rounded">
                  {filteredStudents.length} Students
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-4">
              <h2 className="text-xl font-semibold text-white">Filters & Search</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Subject Selection */}
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-2">Subject</label>
                  <select 
                    value={selectedSubject} 
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a subject</option>
                    {subjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search */}
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-2">Search Students</label>
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Filter Status */}
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-2">Filter by Status</label>
                  <select 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Students</option>
                    <option value="with-wallet">With Wallet</option>
                    <option value="with-credential">Has Credentials</option>
                    <option value="without-credential">No Credentials</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Students List */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  Students in {selectedSubject || 'Selected Subject'}
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 text-sm bg-gray-600/50 px-2 py-1 rounded">
                    {filteredStudents.length} Found
                  </span>
                  <Link href="/teacher/credentials">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors">
                      Manage Credentials
                    </button>
                  </Link>
                </div>
              </div>

              {subjectsLoading || studentsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading students...</p>
                </div>
              ) : !selectedSubject ? (
                <div className="text-center py-12 text-gray-400">
                  <p>Please select a subject to view students</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p>No students found</p>
                  <p className="text-sm">
                    {searchTerm || filterStatus !== 'all' 
                      ? 'Try adjusting your search or filter criteria' 
                      : 'No students are enrolled in this subject'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredStudents.map((student: Student) => (
                    <div
                      key={student.userId}
                      className="flex items-center justify-between p-6 bg-gray-700/30 border border-gray-600 rounded-lg hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-full bg-blue-600/20">
                          <div className="h-6 w-6 bg-blue-400 rounded-full"></div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-white">{student.name}</h4>
                          <p className="text-gray-400">{student.email}</p>
                          {student.walletAddress && (
                            <p className="text-sm text-gray-500 font-mono mt-1">
                              {student.walletAddress.substring(0, 6)}...{student.walletAddress.substring(-4)}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="flex flex-col space-y-2">
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
                          {student.didHash && (
                            <span className="text-xs px-2 py-1 rounded bg-purple-600/20 text-purple-400">
                              DID Registered
                            </span>
                          )}
                        </div>
                        
                        <div className="flex flex-col space-y-2">
                          <Link href={`/teacher/credentials?student=${student.userId}&subject=${selectedSubject}`}>
                            <button className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm transition-colors">
                              View Details
                            </button>
                          </Link>
                          <Link href={`/teacher/credentials?issue=${student.userId}&subject=${selectedSubject}`}>
                            <button 
                              className={`px-3 py-2 rounded text-sm transition-colors ${
                                student.walletAddress
                                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                  : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                              }`}
                              disabled={!student.walletAddress}
                            >
                              {student.hasCredential ? 'Update' : 'Issue'} Credential
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Summary Stats */}
            {selectedSubject && filteredStudents.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {students.length}
                  </div>
                  <div className="text-sm text-gray-400">Total Students</div>
                </div>
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {students.filter((s: Student) => s.walletAddress).length}
                  </div>
                  <div className="text-sm text-gray-400">With Wallets</div>
                </div>
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {students.filter((s: Student) => s.hasCredential).length}
                  </div>
                  <div className="text-sm text-gray-400">Have Credentials</div>
                </div>
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-orange-400">
                    {Math.round((students.filter((s: Student) => s.hasCredential).length / students.length) * 100)}%
                  </div>
                  <div className="text-sm text-gray-400">Completion Rate</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}