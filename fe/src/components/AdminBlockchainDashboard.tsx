"use client";

import { useState } from "react";
import {
  useAssignBlockchainRole,
  useAssignSubjectToTeacher,
  useRemoveSubjectFromTeacher,
  useRevokeBlockchainCredential,
  useGetBlockchainNetworkInfo,
  useTestIPFSConnection
} from "@/hooks/useBlockchain";
import { useGetAllUsers } from "@/hooks/useGraphQL";
import { UserRole } from "@/gql/types";

export default function AdminBlockchainDashboard() {
  const [showDetails, setShowDetails] = useState(false);

  // Get network info and users
  const { data: networkData, loading: networkLoading } = useGetBlockchainNetworkInfo();
  const { data: ipfsData, loading: ipfsLoading } = useTestIPFSConnection();
  const { data: usersData, loading: usersLoading } = useGetAllUsers();

  const users = usersData?.getAllUsers || [];
  const teachers = users.filter(user => user.role === UserRole.TEACHER);
  const students = users.filter(user => user.role === UserRole.STUDENT);

  const networkInfo = networkData?.getBlockchainNetworkInfo;
  const ipfsConnected = ipfsData?.testIPFSConnection;

  const loading = networkLoading || ipfsLoading || usersLoading;

  if (loading) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading blockchain status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Blockchain Overview</h2>
          <p className="text-gray-400">
            System status and quick actions
          </p>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      <div className="space-y-6">
        {/* System Status */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-gray-300">Blockchain Network</span>
              <span className={`flex items-center ${networkInfo?.isConnected ? 'text-green-400' : 'text-red-400'}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${networkInfo?.isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                {networkInfo?.isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-gray-300">IPFS Connection</span>
              <span className={`flex items-center ${ipfsConnected ? 'text-green-400' : 'text-red-400'}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${ipfsConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                {ipfsConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          {showDetails && networkInfo && (
            <div className="mt-4 p-3 bg-white/5 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Network:</span>
                    <span className="text-gray-300">{networkInfo.network}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Chain ID:</span>
                    <span className="text-gray-300">{networkInfo.chainId}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Contract:</span>
                    <span className="text-gray-300 font-mono text-xs">
                      {networkInfo.contractAddress.slice(0, 10)}...{networkInfo.contractAddress.slice(-8)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Wallet:</span>
                    <span className="text-gray-300 font-mono text-xs">
                      {networkInfo.walletAddress.slice(0, 10)}...{networkInfo.walletAddress.slice(-8)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Statistics */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-white mb-4">User Statistics</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <div className="text-2xl font-bold text-blue-400">{teachers.length}</div>
              <div className="text-sm text-gray-400">Teachers</div>
            </div>
            <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="text-2xl font-bold text-green-400">{students.length}</div>
              <div className="text-sm text-gray-400">Students</div>
            </div>
            <div className="text-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <div className="text-2xl font-bold text-purple-400">{users.length}</div>
              <div className="text-sm text-gray-400">Total Users</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <a
              href="/admin/blockchain"
              className="p-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/30 rounded-lg transition-all duration-300 text-center group"
            >
              <div className="text-blue-400 group-hover:text-blue-300 font-medium">Assign Roles</div>
              <div className="text-xs text-gray-400 mt-1">Grant blockchain roles to users</div>
            </a>
            
            <a
              href="/admin/blockchain"
              className="p-3 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 hover:border-green-500/30 rounded-lg transition-all duration-300 text-center group"
            >
              <div className="text-green-400 group-hover:text-green-300 font-medium">Manage Subjects</div>
              <div className="text-xs text-gray-400 mt-1">Assign subjects to teachers</div>
            </a>
            
            <a
              href="/admin/blockchain"
              className="p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 rounded-lg transition-all duration-300 text-center group"
            >
              <div className="text-red-400 group-hover:text-red-300 font-medium">Revoke Credentials</div>
              <div className="text-xs text-gray-400 mt-1">Remove student credentials</div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}