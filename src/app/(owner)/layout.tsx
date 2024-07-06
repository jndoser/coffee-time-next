import type { Metadata } from "next";
import OwnerLayout from "./layout/layout";
import { checkRole } from "../utils/roles";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (!checkRole("owner")) {
    redirect("/sign-in");
  }

  return <OwnerLayout>{children}</OwnerLayout>;
}