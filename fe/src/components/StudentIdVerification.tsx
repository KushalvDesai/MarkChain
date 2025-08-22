"use client";

import { useState } from 'react';
import { useSendOTPForVerification, useVerifyOTPAndUpdateProfile } from '@/hooks/useGraphQL';

export default function StudentIdVerification() {
  const [step, setStep] = useState(1); // 1: Send OTP, 2: Verify OTP
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');

  const [sendOTP, { loading: sendingOTP }] = useSendOTPForVerification();
  const [verifyOTP, { loading: verifyingOTP }] = useVerifyOTPAndUpdateProfile();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await sendOTP({
        variables: {
          input: {
            studentId: studentId.trim()
          }
        }
      });

      if (result.data?.sendOTPForVerification.success) {
        setEmail(result.data.sendOTPForVerification.email);
        setStep(2);
        alert(`OTP sent successfully to ${result.data.sendOTPForVerification.email}`);
      } else {
        alert(result.data?.sendOTPForVerification.message || 'Failed to send OTP');
      }
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      alert(error.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await verifyOTP({
        variables: {
          input: {
            otp: otp.trim(),
            name: name.trim(),
            studentId: studentId.trim()
          }
        }
      });

      if (result.data?.verifyOTPAndUpdateProfile.success) {
        alert('Profile verified and updated successfully!');
        // Reset form or redirect
        setStep(1);
        setStudentId('');
        setName('');
        setOtp('');
        setEmail('');
      } else {
        alert(result.data?.verifyOTPAndUpdateProfile.message || 'Verification failed');
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      alert(error.message || 'Verification failed');
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Student ID Verification</h2>
      
      {step === 1 ? (
        <form onSubmit={handleSendOTP} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Student ID
            </label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your student ID"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={sendingOTP}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sendingOTP ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div className="text-center mb-4">
            <p className="text-gray-300 text-sm">
              OTP sent to: <span className="text-blue-400">{email}</span>
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your full name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              OTP Code
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter OTP code"
              maxLength={6}
              required
            />
          </div>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 px-4 py-3 text-gray-300 border border-gray-600 rounded-lg hover:bg-white/5"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={verifyingOTP}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verifyingOTP ? 'Verifying...' : 'Verify & Update'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
