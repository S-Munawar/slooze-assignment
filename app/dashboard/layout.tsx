import { redirect } from "next/navigation";

import Sidebar from "@/components/Sidebar";
import { auth } from "@/lib/auth";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen md:flex">
      <Sidebar user={session.user} />
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
