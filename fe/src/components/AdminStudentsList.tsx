"use client";

import { useGetAllUsers, useGetUsersByRole } from "@/hooks/useGraphQL";
import { UserRole } from "@/gql/types";

export default function AdminStudentsList() {
  // Use both queries to get comprehensive student data
  const { data: allUsersData, loading: allUsersLoading, error: allUsersError, refetch: refetchAllUsers } = useGetAllUsers();
  const { data: studentRoleData, loading: studentRoleLoading, error: studentRoleError, refetch: refetchStudentRole } = useGetUsersByRole(UserRole.STUDENT);

  // Combine loading states - remove profilesLoading since we're not doing individual fetches
  const loading = allUsersLoading || studentRoleLoading;
  
  // Combine error states
  const error = allUsersError || studentRoleError;

  // Get students from both queries and merge the data
  const allStudents = allUsersData?.getAllUsers?.filter(user => user.role === UserRole.STUDENT) || [];
  const roleStudents = studentRoleData?.getUsersByRole || [];
  
  // Merge and deduplicate students by wallet address, prioritizing more complete data
  const studentMap = new Map();
  
  // Add students from all users query first
  allStudents.forEach(student => {
    studentMap.set(student.walletAddress, student);
  });
  
  // Add/merge students from role-based query (may have more complete data)
  roleStudents.forEach(student => {
    const existing = studentMap.get(student.walletAddress);
    if (existing) {
      // Merge data, prioritizing non-null/non-undefined values
      const merged = {
        ...existing,
        ...Object.fromEntries(
          Object.entries(student).filter(([_, value]) => value !== null && value !== undefined && value !== '')
        )
      };
      studentMap.set(student.walletAddress, merged);
    } else {
      studentMap.set(student.walletAddress, student);
    }
  });
  
  // Convert back to array
  const students = Array.from(studentMap.values());

  // Combined refetch function
  const refetch = () => {
    refetchAllUsers();
    refetchStudentRole();
  };

  // Debug logging
  console.log('AdminStudentsList - All Users Data:', allUsersData);
  console.log('AdminStudentsList - Student Role Data:', studentRoleData);
  console.log('AdminStudentsList - All Students from getAllUsers:', allStudents);
  console.log('AdminStudentsList - Role Students from getUsersByRole:', roleStudents);
  console.log('AdminStudentsList - Final merged students:', students);

  if (loading) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading students...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.27 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-white">Error Loading Students</h3>
          <p className="text-gray-300 mb-4">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Students Overview</h2>
          <p className="text-gray-400">
            Total Students: <span className="text-blue-400 font-semibold">{students.length}</span>
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-300 hover:text-white"
          title="Refresh"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <div className="space-y-4 max-h-[calc(100%-120px)] overflow-y-auto">
        {students.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No Students Found</h3>
            <p className="text-gray-400">No students are currently registered in the system.</p>
          </div>
        ) : (
          students.map((student: any, index: number) => (
            <div
              key={student._id || index}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {student.name 
                        ? student.name.charAt(0).toUpperCase()
                        : student.walletAddress.slice(2, 4).toUpperCase()
                      }
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">
                      {student.name || 'Anonymous Student'}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {student.studentId ? `ID: ${student.studentId}` : 'No Student ID'}
                    </p>
                    {student.email && (
                      <p className="text-xs text-gray-500">
                        {student.email}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 font-mono">
                      {`${student.walletAddress.slice(0, 6)}...${student.walletAddress.slice(-4)}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    {/* Verification Status */}
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-1 ${
                      student.studentId 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        student.studentId ? 'bg-green-500' : 'bg-yellow-500'
                      }`}></div>
                      {student.studentId ? 'Verified' : 'Pending'}
                    </div>
                    
                    {/* Activity Status */}
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      student.isActive 
                        ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {student.isActive ? 'Active' : 'Inactive'}
                    </div>
                    
                    {student.lastLogin && (
                      <p className="text-xs text-gray-500 mt-1">
                        Last login: {new Date(student.lastLogin).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
