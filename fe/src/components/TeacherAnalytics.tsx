"use client";

import { useGetAllUsers, useGetUsersByRole } from "@/hooks/useGraphQL";
import { UserRole } from "@/gql/types";
import { useMemo } from "react";

export default function TeacherAnalytics() {
  // Get all users data for analytics
  const { data: allUsersData, loading: allUsersLoading, error: allUsersError } = useGetAllUsers();
  const { data: studentsData, loading: studentsLoading, error: studentsError } = useGetUsersByRole(UserRole.STUDENT);
  const { data: teachersData, loading: teachersLoading, error: teachersError } = useGetUsersByRole(UserRole.TEACHER);

  const loading = allUsersLoading || studentsLoading || teachersLoading;
  const error = allUsersError || studentsError || teachersError;

  const analytics = useMemo(() => {
    const allUsers = allUsersData?.getAllUsers || [];
    const students = studentsData?.getUsersByRole || [];
    const teachers = teachersData?.getUsersByRole || [];

    // Calculate statistics from real data
    const totalStudents = students.length;
    const activeStudents = students.filter(student => student.isActive).length;
    const totalTeachers = teachers.length;
    const recentLogins = allUsers.filter(user => 
      user.lastLogin && 
      new Date(user.lastLogin).getTime() > Date.now() - (7 * 24 * 60 * 60 * 1000) // Last 7 days
    ).length;

    // Calculate engagement rate
    const engagementRate = totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0;

    // Generate recent activity from real data
    const recentActivity = [];
    
    if (students.length > 0) {
      const recentStudents = students
        .filter(s => s.lastLogin)
        .sort((a, b) => {
          const dateA = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
          const dateB = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 3);

      recentStudents.forEach((student, index) => {
        if (student.lastLogin) {
          const timeDiff = Date.now() - new Date(student.lastLogin).getTime();
          const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
          
          recentActivity.push({
            id: index + 1,
            type: index === 0 ? "login" : index === 1 ? "activity" : "engagement",
            message: `${student.name || 'Student'} ${index === 0 ? 'logged in' : index === 1 ? 'accessed platform' : 'showed activity'}`,
            time: hoursAgo < 24 ? `${hoursAgo} hours ago` : `${Math.floor(hoursAgo / 24)} days ago`,
            course: "Platform Activity"
          });
        }
      });
    }

    // If no real activity, show system status
    if (recentActivity.length === 0) {
      recentActivity.push({
        id: 1,
        type: "system",
        message: "System ready for course management",
        time: "Now",
        course: "Platform Status"
      });
    }

    return {
      totalStudents,
      activeStudents,
      engagementRate,
      totalTeachers,
      recentActivity,
      systemStats: {
        totalUsers: allUsers.length,
        recentLogins,
        verifiedStudents: students.filter(s => s.isActive).length
      }
    };
  }, [allUsersData, studentsData, teachersData]);

  if (loading) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading analytics...</p>
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
          <h3 className="text-xl font-semibold mb-2 text-white">Error Loading Analytics</h3>
          <p className="text-gray-300 mb-4">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Teaching Analytics</h2>
        <p className="text-gray-400">
          Overview of platform engagement and student activity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-blue-400">{analytics.totalStudents}</h3>
            <p className="text-sm text-gray-400">Total Students</p>
          </div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-green-400">{analytics.activeStudents}</h3>
            <p className="text-sm text-gray-400">Active Students</p>
          </div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-yellow-400">{analytics.engagementRate}%</h3>
            <p className="text-sm text-gray-400">Engagement Rate</p>
          </div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-purple-400">{analytics.systemStats.recentLogins}</h3>
            <p className="text-sm text-gray-400">Recent Logins</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {analytics.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'login' ? 'bg-green-400' :
                  activity.type === 'activity' ? 'bg-blue-400' : 
                  activity.type === 'engagement' ? 'bg-purple-400' : 'bg-yellow-400'
                }`}></div>
                <div className="flex-1">
                  <p className="text-white text-sm">{activity.message}</p>
                  <p className="text-gray-400 text-xs">{activity.course} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Overview */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Platform Overview</h3>
          <div className="space-y-4">
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-medium">Total Users</span>
                <span className="text-blue-400 font-semibold">{analytics.systemStats.totalUsers}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>System Registration</span>
                <span>All Roles</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: '100%' }}
                ></div>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-medium">Student Engagement</span>
                <span className="text-green-400 font-semibold">{analytics.engagementRate}%</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>Active vs Total</span>
                <span>{analytics.activeStudents}/{analytics.totalStudents}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${analytics.engagementRate}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-medium">Teaching Staff</span>
                <span className="text-yellow-400 font-semibold">{analytics.totalTeachers}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>Platform Educators</span>
                <span>Teachers</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: analytics.totalTeachers > 0 ? '100%' : '10%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
