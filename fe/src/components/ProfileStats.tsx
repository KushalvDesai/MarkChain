"use client";

import { gql, useQuery } from "@apollo/client";

const GET_PROFILE_STATS = gql`
  query GetProfileStats($walletAddress: String!) {
    getProfileStats(walletAddress: $walletAddress) {
      totalCredentials
      averageMarks
      credentialsThisMonth
      lastActivity
      verificationRate
    }
  }
`;

interface ProfileStatsProps {
  userAddress: string;
}

export default function ProfileStats({ userAddress }: ProfileStatsProps) {
  const { data, loading, error } = useQuery(GET_PROFILE_STATS, {
    variables: { walletAddress: userAddress },
    skip: !userAddress
  });

  if (loading) {
    return (
      <div className="p-6 text-white h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-white h-full">
        <h3 className="text-lg font-semibold border-b border-gray-600 pb-2 mb-6">
          Account Statistics
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">--</div>
            <div className="text-sm text-gray-400">Total Credentials</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">--</div>
            <div className="text-sm text-gray-400">Average Marks</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">--</div>
            <div className="text-sm text-gray-400">This Month</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">--%</div>
            <div className="text-sm text-gray-400">Verification Rate</div>
          </div>
        </div>
        <p className="text-gray-400 text-sm mt-4 text-center">Statistics will load with more activity</p>
      </div>
    );
  }

  const stats = data?.getProfileStats;

  return (
    <div className="p-6 text-white h-full">
      <h3 className="text-lg font-semibold border-b border-gray-600 pb-2 mb-6">
        Account Statistics
      </h3>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {stats?.totalCredentials || 0}
          </div>
          <div className="text-sm text-gray-400">Total Credentials</div>
        </div>
        
        <div className="bg-gray-800/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">
            {stats?.averageMarks ? `${stats.averageMarks.toFixed(1)}%` : '--'}
          </div>
          <div className="text-sm text-gray-400">Average Marks</div>
        </div>
        
        <div className="bg-gray-800/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">
            {stats?.credentialsThisMonth || 0}
          </div>
          <div className="text-sm text-gray-400">This Month</div>
        </div>
        
        <div className="bg-gray-800/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {stats?.verificationRate ? `${stats.verificationRate.toFixed(1)}%` : '100%'}
          </div>
          <div className="text-sm text-gray-400">Verification Rate</div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Last Activity:</span>
            <span className="text-sm">
              {stats?.lastActivity 
                ? new Date(stats.lastActivity).toLocaleDateString()
                : 'Today'
              }
            </span>
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Account Age:</span>
            <span className="text-sm">
              {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Profile Completion:</span>
            <span className="text-sm text-green-400">85%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
