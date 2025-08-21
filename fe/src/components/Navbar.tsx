"use client";

import GooeyNav from "./GooeyNav";

export default function Navbar() {
  // Navigation items for GooeyNav
  const navItems = [
    { label: "Dashboard", href: "/student" },
    { label: "Profile", href: "/profile" },
    { label: "Credentials", href: "/student/credentials" },
  ];

  return (
    <GooeyNav 
      items={navItems}
      initialActiveIndex={-1}
      colors={[1, 2, 3, 4]}
      particleCount={12}
      animationTime={500}
    />
  );
}
