"use client";

import { useAuth } from "@/hooks/useAuth";
import DynamicNavbar from "@/components/DynamicNavbar";
import StudentMarks from "@/components/StudentMarks";
import Analytics from "@/components/Analytics";
import LatestCredential from "@/components/LatestCredential";
import MagicBento from "@/components/MagicBento";
import ProtectedRoute from "@/components/ProtectedRoute";
import StudentBlockchainStatus from "@/components/StudentBlockchainStatus";
import StudentCredentialsWidget from "@/components/StudentCredentialsWidget";
// import UserDebugInfo from "@/components/UserDebugInfo";

export default function StudentDashboard() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: '#0b0b12' }}>
        {/* Dynamic Navbar based on user role */}
        <DynamicNavbar />
        
        {/* Welcome Message */}
        <div className="p-6 pb-2">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.name || 'Student'}!
          </h1>
          <p className="text-gray-400">
            Here's your academic dashboard with the latest updates
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6 p-6 pt-4 h-[calc(100vh-160px)]">

          {/* Rectangle 3 - Blockchain Status */}
          <div className="backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:via-transparent before:to-transparent before:rounded-2xl" style={{ backgroundColor: '#12121a' }}>
            <MagicBento 
              textAutoHide={true}
              enableStars={false}
              enableSpotlight={true}
              enableBorderGlow={true}
              enableTilt={false}
              enableMagnetism={false}
              clickEffect={true}
              spotlightRadius={400}
              particleCount={10}
              glowColor="100, 150, 255"
              cards={[{
                color: "transparent",
                title: "Blockchain Status",
                description: "Monitor your Web3 setup",
                label: "Blockchain",
                children: <StudentBlockchainStatus />
              }]}
            />
          </div>

          {/* Rectangle 4 - Credentials */}
          <div className="backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:via-transparent before:to-transparent before:rounded-2xl" style={{ backgroundColor: '#12121a' }}>
            <MagicBento 
              textAutoHide={true}
              enableStars={false}
              enableSpotlight={true}
              enableBorderGlow={true}
              enableTilt={false}
              enableMagnetism={false}
              clickEffect={true}
              spotlightRadius={350}
              particleCount={15}
              glowColor="50, 255, 100"
              cards={[{
                color: "transparent",
                title: "My Credentials",
                description: "Verified blockchain credentials",
                label: "Credentials",
                children: <StudentCredentialsWidget />
              }]}
            />
          </div>
        </div>
      </div>
      
      {/* Debug component - remove in production */}
      {/* <UserDebugInfo /> */}
    </ProtectedRoute>
  );
}