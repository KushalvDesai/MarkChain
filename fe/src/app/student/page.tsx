"use client";

import Navbar from "@/components/Navbar";
import StudentMarks from "@/components/StudentMarks";
import Analytics from "@/components/Analytics";
import LatestCredential from "@/components/LatestCredential";
import MagicBento from "@/components/MagicBento";

export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Rectangle 3 - Navbar */}
      <Navbar />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 h-[calc(100vh-80px)]">
        {/* Rectangle 1 - Student Marks */}
        <div className="bg-gray-800 rounded-lg shadow-lg">
          <MagicBento 
            textAutoHide={true}
            enableStars={true}
            enableSpotlight={true}
            enableBorderGlow={true}
            enableTilt={true}
            enableMagnetism={true}
            clickEffect={true}
            spotlightRadius={300}
            particleCount={12}
            glowColor="132, 0, 255"
            cards={[{
              color: "#1f2937",
              title: "Student Performance",
              description: "Track academic progress",
              label: "Marks",
              children: <StudentMarks />
            }]}
          />
        </div>
        
        {/* Rectangle 2 - Analytics */}
        <div className="bg-gray-800 rounded-lg shadow-lg">
          <MagicBento 
            textAutoHide={true}
            enableStars={true}
            enableSpotlight={true}
            enableBorderGlow={true}
            enableTilt={true}
            enableMagnetism={true}
            clickEffect={true}
            spotlightRadius={300}
            particleCount={8}
            glowColor="132, 0, 255"
            cards={[{
              color: "#1f2937",
              title: "Analytics Dashboard",
              description: "Visualize your data",
              label: "Analytics",
              children: <Analytics />
            }]}
          />
        </div>
        
        {/* Latest Verifiable Credential Section - Full Width */}
        <div className="lg:col-span-2 bg-gray-800 rounded-lg shadow-lg">
          <MagicBento 
            textAutoHide={true}
            enableStars={true}
            enableSpotlight={true}
            enableBorderGlow={true}
            enableTilt={true}
            enableMagnetism={true}
            clickEffect={true}
            spotlightRadius={300}
            particleCount={10}
            glowColor="132, 0, 255"
            cards={[{
              color: "#1f2937",
              title: "Latest Credentials",
              description: "Verifiable achievements",
              label: "Credentials",
              children: <LatestCredential />
            }]}
          />
        </div>
      </div>
    </div>
  );
}