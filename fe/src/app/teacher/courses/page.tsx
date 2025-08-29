"use client";

import { useAuth } from "@/hooks/useAuth";
import DynamicNavbar from "@/components/DynamicNavbar";
import TeacherCourses from "@/components/TeacherCourses";
import MagicBento from "@/components/MagicBento";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function CoursesPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: '#0b0b12' }}>
        {/* Dynamic Navbar based on user role */}
        <DynamicNavbar />
        
        {/* Page Header */}
        <div className="p-6 pb-2">
          <h1 className="text-3xl font-bold text-white mb-2">
            Course Management
          </h1>
          <p className="text-gray-400">
            Manage all your courses, track student progress, and organize content
          </p>
        </div>
        
        <div className="p-6 pt-4">
          {/* Full-width Courses Section */}
          <div className="backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:via-transparent before:to-transparent before:rounded-2xl h-[calc(100vh-200px)]" style={{ backgroundColor: '#12121a' }}>
            <MagicBento 
              textAutoHide={true}
              enableStars={false}
              enableSpotlight={true}
              enableBorderGlow={true}
              enableTilt={false}
              enableMagnetism={false}
              clickEffect={true}
              spotlightRadius={600}
              particleCount={15}
              glowColor="180, 180, 200"
              cards={[{
                color: "transparent",
                title: "All Courses",
                description: "Complete course management interface",
                label: "Courses",
                children: <TeacherCourses />
              }]}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
