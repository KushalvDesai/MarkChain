"use client";

import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/gql/types";

export default function UserDebugInfo() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg border border-white/20 backdrop-blur-sm text-xs font-mono z-50">
      <h3 className="text-sm font-bold mb-2">User Debug Info</h3>
      <div className="space-y-1">
        <div>Name: {user.name || 'N/A'}</div>
        <div>Wallet: {user.walletAddress}</div>
        <div>Role: {user.role || 'N/A'}</div>
        <div>Role Type: {typeof user.role}</div>
        <div>Expected ADMIN: {UserRole.ADMIN}</div>
        <div>Is Admin: {user.role === UserRole.ADMIN ? 'YES' : 'NO'}</div>
        <div>Raw User: {JSON.stringify(user, null, 2)}</div>
      </div>
    </div>
  );
}
