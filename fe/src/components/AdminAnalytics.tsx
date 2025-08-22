"use client";

import { useGetAllUsers } from "@/hooks/useGraphQL";
import { UserRole } from "@/gql/types";

export default function AdminAnalytics() {
  const { data, loading, error } = useGetAllUsers();

  const users = data?.getAllUsers || [];
  const students = users.filter(user => user.role === UserRole.STUDENT);
  const teachers = users.filter(user => user.role === UserRole.TEACHER);
  const admins = users.filter(user => user.role === UserRole.ADMIN);
  const activeUsers = users.filter(user => user.isActive);

  const stats = [
    {
      label: "Total Students",
      value: students.length,
      icon: "👨‍🎓",
      color: "from-blue-500 to-cyan-500"
    },
    {
      label: "Total Teachers", 
      value: teachers.length,
      icon: "👨‍🏫",
      color: "from-green-500 to-emerald-500"
    },
    {
      label: "Total Admins",
      value: admins.length,
      icon: "👨‍💼",
      color: "from-purple-500 to-pink-500"
    },
    {
      label: "Active Users",
      value: activeUsers.length,
      icon: "✅",
      color: "from-orange-500 to-red-500"
    }
  ];

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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M17.656 7.343l-1.414-1.414m0 0l-1.414 1.414m1.414-1.414l1.414 1.414M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-white">Error Loading Analytics</h3>
          <p className="text-gray-300">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">System Analytics</h2>
        <p className="text-gray-400">Overview of platform usage and statistics</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center text-2xl`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Recent User Activity</h3>
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {users
            .filter(user => user.lastLogin)
            .sort((a, b) => new Date(b.lastLogin!).getTime() - new Date(a.lastLogin!).getTime())
            .slice(0, 5)
            .map((user, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {user.name 
                        ? user.name.charAt(0).toUpperCase()
                        : user.walletAddress.slice(2, 4).toUpperCase()
                      }
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">
                      {user.name || 'Anonymous User'}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {user.role} • {`${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`}
                    </p>
                  </div>
                </div>
                <p className="text-gray-500 text-xs">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                </p>
              </div>
            ))}
          {users.filter(user => user.lastLogin).length === 0 && (
            <p className="text-gray-400 text-sm text-center py-4">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}
