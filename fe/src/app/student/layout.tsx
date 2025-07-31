import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Dashboard - MarkChain",
  description: "View your academic credentials and performance analytics",
};

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
