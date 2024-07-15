import type { Metadata } from "next";
import { checkRole } from "../utils/roles";
import { redirect } from "next/navigation";
import AdminLayout from "./layout/admin-layout";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin Page for Coffee Time Ap",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (!checkRole("admin")) {
    // ßredirect("/sign-in");
  }

  return <AdminLayout>{children}</AdminLayout>;
}
