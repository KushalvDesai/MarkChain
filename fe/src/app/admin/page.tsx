"use client";

import { useAuth } from "@/hooks/useAuth";
import DynamicNavbar from "@/components/DynamicNavbar";
import AdminStudentsList from "@/components/AdminStudentsList";
import AdminAnalytics from "@/components/AdminAnalytics";
import MagicBento from "@/components/MagicBento";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-950">
        {/* Dynamic Navbar based on user role */}
        <DynamicNavbar />
        
        {/* Welcome Message */}
        <div className="p-6 pb-2">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.name || 'Admin'}!
          </h1>
          <p className="text-gray-400">
            Here's your administrative dashboard with system overview
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 pt-4 h-[calc(100vh-160px)]">
          {/* Rectangle 1 - Students List */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:via-transparent before:to-transparent before:rounded-2xl">
            <MagicBento 
              textAutoHide={true}
              enableStars={false}
              enableSpotlight={true}
              enableBorderGlow={true}
              enableTilt={false}
              enableMagnetism={false}
              clickEffect={true}
              spotlightRadius={500}
              particleCount={12}
              glowColor="132, 0, 255"
              cards={[{
                color: "transparent",
                title: "Students Management",
                description: "View and manage all students",
                label: "Students",
                children: <AdminStudentsList />
              }]}
            />
          </div>
          
          {/* Rectangle 2 - Analytics */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:via-transparent before:to-transparent before:rounded-2xl">
            <MagicBento 
              textAutoHide={true}
              enableStars={false}
              enableSpotlight={true}
              enableBorderGlow={true}
              enableTilt={false}
              enableMagnetism={false}
              clickEffect={true}
              spotlightRadius={300}
              particleCount={8}
              glowColor="132, 0, 255"
              cards={[{
                color: "transparent",
                title: "System Analytics",
                description: "Platform statistics and insights",
                label: "Analytics",
                children: <AdminAnalytics />
              }]}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}