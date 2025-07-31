"use client";

import Navbar from "@/components/Navbar";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="flex items-center space-x-6 mb-8">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">KD</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Kushal Desai</h1>
              <p className="text-gray-400">Student ID: ST2024001</p>
              <p className="text-gray-400">Department: Computer Engineering</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-700 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Personal Information</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-400">Email</label>
                  <p className="text-white">kushal.desai@example.com</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Phone</label>
                  <p className="text-white">+91 98765 43210</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Date of Birth</label>
                  <p className="text-white">January 15, 2002</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Academic Details</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-400">Enrollment Year</label>
                  <p className="text-white">2024</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Current Semester</label>
                  <p className="text-white">6th Semester</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">CGPA</label>
                  <p className="text-white">8.75</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Blockchain Identity</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-400">DID</label>
                  <p className="text-white font-mono text-sm break-all">did:mark:0x1234...5678</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Wallet Address</label>
                  <p className="text-white font-mono text-sm break-all">0xabcd...ef90</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Credentials Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Credentials</span>
                  <span className="text-white font-semibold">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Verified Credentials</span>
                  <span className="text-green-400 font-semibold">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Updated</span>
                  <span className="text-white">2 days ago</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex space-x-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
              Edit Profile
            </button>
            <button className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors">
              Download Credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
