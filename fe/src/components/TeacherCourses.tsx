"use client";

import { useGetAllUsers, useGetUsersByRole } from "@/hooks/useGraphQL";
import { UserRole } from "@/gql/types";

export default function TeacherCourses() {
  // Get all students data to show enrollment information
  const { data: allStudentsData, loading, error, refetch } = useGetUsersByRole(UserRole.STUDENT);
  const students = allStudentsData?.getUsersByRole || [];

  // Calculate some basic statistics from available data
  const activeStudents = students.filter(student => student.isActive).length;
  const totalStudents = students.length;

  if (loading) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading course data...</p>
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
          <h3 className="text-xl font-semibold mb-2 text-white">Error Loading Data</h3>
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
          <h2 className="text-2xl font-bold text-white mb-2">Course Management</h2>
          <p className="text-gray-400">
            Manage your courses and track student engagement
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white text-sm">
          Create New Course
        </button>
      </div>

      {/* Course Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
          <div className="text-center">
            <h3 className="text-xl font-bold text-blue-400">{totalStudents}</h3>
            <p className="text-sm text-gray-400">Total Students</p>
          </div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
          <div className="text-center">
            <h3 className="text-xl font-bold text-green-400">{activeStudents}</h3>
            <p className="text-sm text-gray-400">Active Students</p>
          </div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
          <div className="text-center">
            <h3 className="text-xl font-bold text-yellow-400">{totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0}%</h3>
            <p className="text-sm text-gray-400">Engagement Rate</p>
          </div>
        </div>
      </div>

      {/* Course Setup Notice */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6 mb-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Course Management System</h3>
            <p className="text-gray-300 mb-4">
              Set up your courses to manage student enrollment, track progress, and organize educational content. 
              Currently showing {totalStudents} students in the system who can be enrolled in your courses.
            </p>
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white text-sm">
                Set Up First Course
              </button>
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white text-sm">
                Import from Template
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Student List for Course Management */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Available Students</h3>
          <button
            onClick={() => refetch()}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-300 hover:text-white"
            title="Refresh"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {students.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No students found in the system</p>
            </div>
          ) : (
            students.map((student: any, index: number) => (
              <div
                key={student.walletAddress || index}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs">
                      {student.name 
                        ? student.name.charAt(0).toUpperCase()
                        : student.walletAddress.slice(2, 4).toUpperCase()
                      }
                    </span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">
                      {student.name || 'Anonymous Student'}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {`${student.walletAddress.slice(0, 6)}...${student.walletAddress.slice(-4)}`}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    student.isActive ? 'bg-green-400' : 'bg-red-400'
                  }`}></div>
                  <span className="text-xs text-gray-400">
                    {student.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
