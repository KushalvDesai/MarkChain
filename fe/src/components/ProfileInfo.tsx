"use client";

import { useState } from "react";
import { UserRole } from "@/gql/types";
import { useSendOTPForVerification, useVerifyOTPAndUpdateProfile } from "@/hooks/useGraphQL";

interface ProfileInfoProps {
  profile: any;
  userAddress: string;
  userRole?: UserRole;
  isEditing: boolean;
  isUpdating?: boolean;
  updateError?: string | null;
  formData: {
    name: string;
    studentId?: string;
    email?: string;
    subjects?: string[];
  };
  onInputChange: (field: string, value: string) => void;
  onSubjectAdd: (subject: string) => void;
  onSubjectRemove: (subject: string) => void;
  onToggleEdit: () => void;
  onSave: () => void;
}

export default function ProfileInfo({
  profile,
  userAddress,
  userRole,
  isEditing,
  isUpdating = false,
  updateError = null,
  formData,
  onInputChange,
  onSubjectAdd,
  onSubjectRemove,
  onToggleEdit,
  onSave
}: ProfileInfoProps) {
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [tempStudentId, setTempStudentId] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState<string | null>(null);
  
  // OTP Mutations
  const [sendOTPForVerification, { loading: sendingOTP }] = useSendOTPForVerification();
  const [verifyOTPAndUpdateProfile, { loading: verifyingOTP }] = useVerifyOTPAndUpdateProfile();

  const handleStudentIdVerification = async () => {
    if (!tempStudentId.trim()) {
      setOtpError("Please enter a student ID");
      return;
    }

    try {
      setOtpError(null);
      setOtpSuccess(null);
      
      const result = await sendOTPForVerification({
        variables: {
          input: {
            studentId: tempStudentId.trim()
          }
        }
      });

      if (result.data?.sendOTPForVerification.success) {
        // For students, we know the email format is studentId@charusat.edu.in
        const emailAddress = `${tempStudentId.trim()}@charusat.edu.in`;
        setOtpSuccess(`OTP sent to ${emailAddress}`);
        setOtpModalOpen(true);
      }
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      setOtpError(error.message || 'Failed to send OTP');
    }
  };

  const handleOTPVerification = async () => {
    if (!otp.trim()) {
      setOtpError("Please enter the OTP");
      return;
    }

    try {
      setOtpError(null);
      
      const result = await verifyOTPAndUpdateProfile({
        variables: {
          input: {
            otp: otp.trim(),
            name: formData.name || profile?.name || "",
            studentId: tempStudentId.trim()
          }
        }
      });

      if (result.data?.verifyOTPAndUpdateProfile.success) {
        setOtpSuccess("Student ID verified and updated successfully!");
        setOtpModalOpen(false);
        setOtp("");
        setTempStudentId("");
        onToggleEdit(); // Exit edit mode
        // Refresh the profile data
        window.location.reload();
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      setOtpError(error.message || 'Failed to verify OTP');
    }
  };

  const closeOtpModal = () => {
    setOtpModalOpen(false);
    setOtp("");
    setOtpError(null);
    setOtpSuccess(null);
  };
  return (
    <div className="p-6 text-white h-full">
      {/* Profile Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-xl font-bold">
              {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold">
              {profile?.name || 'Anonymous User'}
            </h2>
            <p className="text-gray-400 capitalize">
              {profile?.role?.toLowerCase() || 'Student'}
            </p>
          </div>
        </div>
        <button
          onClick={onToggleEdit}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm"
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b border-gray-600 pb-2">
          Basic Information
        </h3>
        
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Full Name
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData.name}
              onChange={(e) => onInputChange('name', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-400 focus:outline-none text-sm"
              placeholder="Enter your full name"
            />
          ) : (
            <p className="px-3 py-2 bg-gray-800 rounded-lg text-sm">
              {profile?.name || 'Not set'}
            </p>
          )}
        </div>

        {/* Email - Auto-generated for students, editable for others */}
        {userRole !== UserRole.STUDENT && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email Address
            </label>
            {isEditing ? (
              <input
                type="email"
                value={formData.email || ""}
                onChange={(e) => onInputChange('email', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-400 focus:outline-none text-sm"
                placeholder="Enter your email address"
              />
            ) : (
              <p className="px-3 py-2 bg-gray-800 rounded-lg text-sm">
                {profile?.email || 'Not set'}
              </p>
            )}
          </div>
        )}

        {/* Email for Students - Auto-generated from Student ID */}
        {userRole === UserRole.STUDENT && profile?.studentId && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email Address
            </label>
            <div className="px-3 py-2 bg-gray-800 rounded-lg text-sm flex items-center justify-between">
              <span>{profile.studentId}@charusat.edu.in</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-blue-400 text-xs">Auto-generated</span>
              </div>
            </div>
          </div>
        )}

        
        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Role
          </label>
          <div className="px-3 py-2 bg-gray-800 rounded-lg text-sm flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              userRole === UserRole.ADMIN ? 'bg-red-400' :
              userRole === UserRole.TEACHER ? 'bg-yellow-400' :
              'bg-blue-400'
            }`}></div>
            <span className="capitalize">
              {profile?.role?.toLowerCase() || 'Student'}
            </span>
          </div>
        </div>

        {/* Student ID - Only show for students */}
        {userRole === UserRole.STUDENT && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Student ID
            </label>
            {profile?.studentId ? (
              // If student ID is already set, show it as read-only
              <div className="px-3 py-2 bg-gray-800 rounded-lg text-sm flex items-center justify-between">
                <span>{profile.studentId}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-green-400 text-xs">Verified</span>
                </div>
              </div>
            ) : isEditing ? (
              // If no student ID and in edit mode, show verification flow
              <div className="space-y-3">
                <input
                  type="text"
                  value={tempStudentId}
                  onChange={(e) => setTempStudentId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-400 focus:outline-none text-sm"
                  placeholder="Enter your student ID"
                />
                <button
                  onClick={handleStudentIdVerification}
                  disabled={sendingOTP || !tempStudentId.trim()}
                  className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed rounded-lg transition-colors text-sm flex items-center justify-center space-x-2"
                >
                  {sendingOTP && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <span>{sendingOTP ? 'Sending OTP...' : 'Verify Student ID'}</span>
                </button>
                {otpError && (
                  <div className="text-red-400 text-xs">{otpError}</div>
                )}
                {otpSuccess && (
                  <div className="text-green-400 text-xs">{otpSuccess}</div>
                )}
              </div>
            ) : (
              // If no student ID and not editing, show not set
              <p className="px-3 py-2 bg-gray-800 rounded-lg text-sm text-gray-400">
                Not verified - Click edit to verify your student ID
              </p>
            )}
          </div>
        )}

        {/* Admin-specific information */}
        {userRole === UserRole.ADMIN && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Admin Privileges
            </label>
            <div className="px-3 py-2 bg-gray-800 rounded-lg text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Full system access</span>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>User management</span>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>System analytics</span>
              </div>
            </div>
          </div>
        )}

        {/* Teacher-specific information */}
        {userRole === UserRole.TEACHER && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Teaching ID
            </label>
            <p className="px-3 py-2 bg-gray-800 rounded-lg text-sm">
              {profile?.teacherId || 'Not set'}
            </p>
          </div>
        )}

        {/* Save Button - Only show if not dealing with student ID verification */}
        {isEditing && (userRole !== UserRole.STUDENT || profile?.studentId) && (
          <div className="space-y-3">
            {/* Error Message */}
            {updateError && (
              <div className="bg-red-900/50 border border-red-500 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.27 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-red-300 text-sm">{updateError}</span>
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-1">
              <button
                onClick={() => onToggleEdit()}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                disabled={isUpdating}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed rounded-lg transition-colors text-sm flex items-center space-x-2"
              >
                {isUpdating && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>{isUpdating ? 'Saving...' : 'Save'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Student ID Verification Notice */}
        {isEditing && userRole === UserRole.STUDENT && !profile?.studentId && (
          <div className="bg-blue-900/50 border border-blue-500 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-blue-300 text-sm">
                Student ID requires email verification. OTP will be sent to your Charusat email (studentID@charusat.edu.in).
              </span>
            </div>
          </div>
        )}
      </div>

      {/* OTP Verification Modal */}
      {otpModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96 max-w-sm mx-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-white mb-2">
                Verify Student ID
              </h3>
              <p className="text-gray-300 text-sm">
                Enter the OTP sent to {tempStudentId}@charusat.edu.in
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Student ID
                </label>
                <input
                  type="text"
                  value={tempStudentId}
                  disabled
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  OTP Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-400 focus:outline-none text-sm"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                />
              </div>

              {otpError && (
                <div className="bg-red-900/50 border border-red-500 rounded-lg p-2">
                  <p className="text-red-300 text-sm">{otpError}</p>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={closeOtpModal}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleOTPVerification}
                  disabled={verifyingOTP || !otp.trim()}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed rounded-lg transition-colors text-sm flex items-center justify-center space-x-2"
                >
                  {verifyingOTP && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <span>{verifyingOTP ? 'Verifying...' : 'Verify'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
