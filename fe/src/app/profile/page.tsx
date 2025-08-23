"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useGetUserProfile, useUpdateUserProfile } from "@/hooks/useGraphQL";
import { UserRole } from "@/gql/types";
import DynamicNavbar from "@/components/DynamicNavbar";
import MagicBento from "@/components/MagicBento";
import ProfileInfo from "@/components/ProfileInfo";
import BlockchainInfo from "@/components/BlockchainInfo";
import ProtectedRoute from "@/components/ProtectedRoute";

interface UserProfile {
  walletAddress: string;
  name?: string;
  email?: string;
  role: string;
  subjects?: string[];
  isActive?: boolean;
  did?: string;
  lastLogin?: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    studentId: "",
    subjects: [] as string[]
  });

  // Fetch user profile using GraphQL
  const { data, loading, error, refetch } = useGetUserProfile(user?.walletAddress || "");
  
  // Update user profile mutation
  const [updateUserProfile, { loading: updating }] = useUpdateUserProfile();

  // Update form data when profile data loads
  useEffect(() => {
    if (data?.getUserProfile) {
      const profile = data.getUserProfile;
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        studentId: profile.studentId || "",
        subjects: profile.subjects || []
      });
    }
  }, [data]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubjectAdd = (subject: string) => {
    if (subject.trim() && !formData.subjects.includes(subject.trim())) {
      setFormData(prev => ({
        ...prev,
        subjects: [...prev.subjects, subject.trim()]
      }));
    }
  };

  const handleSubjectRemove = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s !== subject)
    }));
  };

  const handleSave = async () => {
    try {
      setUpdateError(null); // Clear any previous errors
      
      // For student ID updates, we use OTP verification
      // Only update basic profile information here (name, email)
      const updateInput: any = {
        name: formData.name || undefined
      };

      // For students, email is auto-generated from studentId, so don't include it in updates
      // For admins/teachers, include email if provided
      if (user?.role !== UserRole.STUDENT) {
        updateInput.email = formData.email || undefined;
      }

      const result = await updateUserProfile({
        variables: {
          walletAddress: user?.walletAddress || "",
          input: updateInput
        }
      });

      if (result.data) {
        console.log('Profile updated successfully:', result.data);
        // Refetch the profile data to get the latest version
        await refetch();
        setIsEditing(false);
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      
      // Extract a meaningful error message
      let errorMessage = 'Failed to update profile';
      if (err.networkError?.result?.errors) {
        errorMessage = err.networkError.result.errors[0]?.message || errorMessage;
      } else if (err.graphQLErrors && err.graphQLErrors.length > 0) {
        errorMessage = err.graphQLErrors[0].message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setUpdateError(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <DynamicNavbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950">
        <DynamicNavbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="text-red-400 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.27 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-white">Error Loading Profile</h2>
            <p className="text-gray-300 mb-4">{error.message}</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const profile = data?.getUserProfile;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-950">
        {/* Dynamic Navbar */}
        <DynamicNavbar />
        
        {/* Welcome Message */}
        <div className="p-6 pb-2">
          <h1 className="text-3xl font-bold text-white mb-2">
            Profile Settings
          </h1>
          <p className="text-gray-400">
            Manage your account information and blockchain identity
          </p>
        </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 pt-4 h-[calc(100vh-160px)]">
        {/* Profile Information */}
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
              title: "Profile Information",
              description: "Manage your personal details",
              label: "Profile",
              children: <ProfileInfo 
                profile={profile}
                userAddress={user?.walletAddress || ""}
                userRole={user?.role}
                isEditing={isEditing}
                isUpdating={updating}
                updateError={updateError}
                formData={formData}
                onInputChange={handleInputChange}
                onSubjectAdd={handleSubjectAdd}
                onSubjectRemove={handleSubjectRemove}
                onToggleEdit={() => setIsEditing(!isEditing)}
                onSave={handleSave}
              />
            }]}
          />
        </div>
        
        {/* Blockchain Information */}
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
              title: "Blockchain Identity",
              description: "Your Web3 credentials",
              label: "Blockchain",
              children: <BlockchainInfo 
                profile={profile}
                userAddress={user?.walletAddress || ""}
              />
            }]}
          />
        </div>
      </div>
      </div>
    </ProtectedRoute>
  );
}
