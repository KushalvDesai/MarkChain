"use client";

import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/gql/types";
import GooeyNav from "./GooeyNav";

export default function DynamicNavbar() {
  const { user } = useAuth();

  // Debug: Log user role for troubleshooting
  console.log('DynamicNavbar - User:', user);
  console.log('DynamicNavbar - User Role:', user?.role);
  console.log('DynamicNavbar - UserRole.ADMIN:', UserRole.ADMIN);

  // Admin navigation items
  const adminNavItems = [
    { label: "Dashboard", href: "/admin" },
    { label: "Students", href: "/admin/students" },
    { label: "Blockchain", href: "/admin/blockchain" },
    { label: "Schedule", href: "/admin/schedule" },
    { label: "Profile", href: "/profile" },
  ];

  // Faculty navigation items
  const facultyNavItems = [
    { label: "Dashboard", href: "/teacher"},
    { label: "Students", href: "/teacher/students"},
    { label: "Credentials", href: "/teacher/credentials"},
    { label: "Profile", href: "/profile"},
  ]

  // Student navigation items
  const studentNavItems = [
    { label: "Dashboard", href: "/student" },
    { label: "Profile", href: "/profile" },
    { label: "Credentials", href: "/student/credentials" },
  ];

  // Choose navigation items based on user role
  const getNavItems = () => {
    console.log('getNavItems - Checking user role:', user?.role);
    console.log('getNavItems - Is role ADMIN?', user?.role === UserRole.ADMIN);
    console.log('getNavItems - Is role TEACHER?', user?.role === UserRole.TEACHER);
    console.log('getNavItems - UserRole enum values:', UserRole);
    
    if (user?.role === UserRole.ADMIN) {
      console.log('getNavItems - Using admin navigation');
      return adminNavItems;
    } else if (user?.role === UserRole.TEACHER) {
      console.log('getNavItems - Using faculty navigation');
      return facultyNavItems;
    }
    // Default to student navigation for STUDENT role or any other role
    console.log('getNavItems - Using student navigation');
    return studentNavItems;
  };

  return (
    <>
      {/* Debug info - remove in production
      {user && (
        <div className="fixed top-4 left-4 bg-black/80 text-white p-2 rounded text-xs z-50">
          Role: {user.role} | Navigation: {user.role === UserRole.ADMIN ? 'Admin' : 'Student'}
        </div>
      )} */}
      
      <GooeyNav 
        items={getNavItems()}
        initialActiveIndex={-1}
        colors={[1, 2, 3, 4]}
        particleCount={12}
        animationTime={500}
      />
    </>
  );
}
