"use client";

import { useAuth } from "@/hooks/useAuth";
import DynamicNavbar from "@/components/DynamicNavbar";
import TeacherCourses from "@/components/TeacherCourses";
import TeacherAnalytics from "@/components/TeacherAnalytics";
import MagicBento from "@/components/MagicBento";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminStudentsList from "@/components/AdminStudentsList";

export default function TeacherDashboard() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: '#0b0b12' }}>
        {/* Dynamic Navbar based on user role */}
        <DynamicNavbar />
        
        {/* Welcome Message */}
        <div className="p-6 pb-2">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.name || 'Professor'}!
          </h1>
          <p className="text-gray-400">
            Here's your teaching dashboard with course management tools
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 pt-4 h-[calc(100vh-160px)]">
          {/* Rectangle 1 - Courses Management */}
          <div className="backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:via-transparent before:to-transparent before:rounded-2xl" style={{ backgroundColor: '#12121a' }}>
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
              glowColor="180, 180, 200"
              cards={[{
                color: "transparent",
                title: "Course Management",
                description: "Manage your courses and students",
                label: "Courses",
                children: <TeacherCourses />
              }]}
            />
          </div>
          
          {/* Rectangle 2 - Student Management */}
          <div className="backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:via-transparent before:to-transparent before:rounded-2xl" style={{ backgroundColor: '#12121a' }}>
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
              glowColor="180, 180, 200"
              cards={[{
                color: "transparent",
                title: "Student Management",
                description: "View and manage your students",
                label: "Students",
                children: <AdminStudentsList />
              }]}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}