"use client";

import { useState } from "react";

interface ProfileInfoProps {
  profile: any;
  userAddress: string;
  isEditing: boolean;
  isUpdating?: boolean;
  updateError?: string | null;
  formData: {
    name: string;
    studentId?: string;
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

        
        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Role
          </label>
          <p className="px-3 py-2 bg-gray-800 rounded-lg capitalize text-sm">
            {profile?.role?.toLowerCase() || 'Student'}
          </p>
        </div>

        {/* Student ID */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Student ID
          </label>
          <p className="px-3 py-2 bg-gray-800 rounded-lg capitalize text-sm">
            {profile?.studentId || 'Not set'}
          </p>
        </div>

        {/* Save Button */}
        {isEditing && (
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
      </div>
    </div>
  );
}
