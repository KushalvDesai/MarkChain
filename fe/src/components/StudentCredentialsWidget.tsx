"use client";

import { useState } from "react";
import { useStudentCredentials, useGetMySubjectCredential } from "@/hooks/useBlockchain";
import { FiAward, FiEye, FiDownload, FiRefreshCw, FiSearch } from "react-icons/fi";
import Link from "next/link";

export default function StudentCredentialsWidget() {
  const [searchSubject, setSearchSubject] = useState("");
  const { credentials, loading, error, refetch } = useStudentCredentials();
  const { data: subjectCredential } = useGetMySubjectCredential(searchSubject, { skip: !searchSubject });

  const gradeColor = (grade: string) => {
    if (grade.includes('A')) return 'text-green-400';
    if (grade.includes('B')) return 'text-blue-400';
    if (grade.includes('C')) return 'text-yellow-400';
    return 'text-gray-400';
  };

  const handleDownload = (credential: any) => {
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

  if (loading) {
    return (
      <div className="h-full p-6 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
          Loading credentials...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full p-6 flex items-center justify-center">
        <div className="text-center text-red-400">
          <FiAward className="mx-auto text-4xl mb-2 opacity-50" />
          <p>Error loading credentials</p>
          <button
            onClick={() => refetch()}
            className="mt-2 text-sm bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-6 text-white">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <FiAward className="mr-2 text-green-400" />
          My Credentials
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => refetch()}
            className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          >
            <FiRefreshCw className="w-4 h-4" />
          </button>
          <Link
            href="/student/credentials"
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors"
          >
            View All
          </Link>
        </div>
      </div>

      {/* Subject Search */}
      <div className="mb-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchSubject}
            onChange={(e) => setSearchSubject(e.target.value)}
            placeholder="Search for a specific subject..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400"
          />
        </div>
        
        {searchSubject && subjectCredential?.getMySubjectCredential && (
          <div className="mt-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-semibold">{subjectCredential.getMySubjectCredential.subject}</h4>
                <p className="text-sm text-gray-400">
                  {subjectCredential.getMySubjectCredential.studentName}
                </p>
              </div>
              <div className={`text-xl font-bold ${gradeColor(subjectCredential.getMySubjectCredential.grade)}`}>
                {subjectCredential.getMySubjectCredential.grade}
              </div>
            </div>
            <div className="mt-2 flex space-x-2">
              <button
                onClick={() => handleDownload(subjectCredential.getMySubjectCredential)}
                className="flex items-center text-xs bg-green-600 hover:bg-green-700 px-2 py-1 rounded"
              >
                <FiDownload className="mr-1" />
                Download
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Credentials Summary */}
      <div className="mb-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
            <div className="text-2xl font-bold text-green-400">{credentials.length}</div>
            <div className="text-xs text-gray-300">Total</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
            <div className="text-2xl font-bold text-blue-400">
              {credentials.filter(c => c.grade.includes('A')).length}
            </div>
            <div className="text-xs text-gray-300">A Grades</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
            <div className="text-2xl font-bold text-yellow-400">
              {credentials.filter(c => new Date(c.updatedAt) > new Date(Date.now() - 30*24*60*60*1000)).length}
            </div>
            <div className="text-xs text-gray-300">Recent</div>
          </div>
        </div>
      </div>

      {/* Recent Credentials */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Recent Credentials</h3>
        
        {credentials.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <FiAward className="mx-auto text-6xl mb-4 opacity-20" />
            <p>No credentials found</p>
            <p className="text-sm">Your verified credentials will appear here</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {credentials.slice(0, 5).map((credential, index) => (
              <div 
                key={index}
                className="bg-gray-800/30 rounded-lg p-3 border border-gray-700 hover:border-blue-500/50 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{credential.subject}</h4>
                    <p className="text-xs text-gray-400">
                      {new Date(credential.updatedAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      TX: {credential.blockchainTxHash.slice(0, 10)}...
                    </p>
                  </div>
                  <div className={`text-lg font-bold ${gradeColor(credential.grade)}`}>
                    {credential.grade}
                  </div>
                </div>
                
                <div className="mt-2 flex space-x-2">
                  <button
                    onClick={() => handleDownload(credential)}
                    className="flex items-center text-xs bg-green-600 hover:bg-green-700 px-2 py-1 rounded transition-colors"
                  >
                    <FiDownload className="mr-1" />
                    Download
                  </button>
                  <Link
                    href={`/student/credentials?subject=${credential.subject}`}
                    className="flex items-center text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded transition-colors"
                  >
                    <FiEye className="mr-1" />
                    View
                  </Link>
                </div>
              </div>
            ))}
            
            {credentials.length > 5 && (
              <Link
                href="/student/credentials"
                className="block text-center text-blue-400 hover:text-blue-300 text-sm py-2"
              >
                View {credentials.length - 5} more credentials →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}