"use client";

import Navbar from "@/components/Navbar";
import StudentMarks from "@/components/StudentMarks";
import Analytics from "@/components/Analytics";
import LatestCredential from "@/components/LatestCredential";

export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Rectangle 3 - Navbar */}
      <Navbar />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 h-[calc(100vh-80px)]">
        {/* Rectangle 1 - Student Marks */}
        <div className="bg-gray-800 rounded-lg shadow-lg">
          <StudentMarks />
        </div>
        
        {/* Rectangle 2 - Analytics */}
        <div className="bg-gray-800 rounded-lg shadow-lg">
          <Analytics />
        </div>
        
        {/* Latest Verifiable Credential Section - Full Width */}
        <div className="lg:col-span-2 bg-gray-800 rounded-lg shadow-lg">
          <LatestCredential />
        </div>
      </div>
    </div>
  );
}
