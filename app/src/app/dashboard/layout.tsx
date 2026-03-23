"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Show, UserButton, RedirectToSignIn } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { LayoutDashboard, ArrowLeft } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isLoaded, isSignedIn } = useAuth();
  const isHub = pathname === "/dashboard";

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            {!isHub && (
              <Link
                href="/dashboard"
                className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            )}
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-xl font-bold text-foreground hover:text-primary transition-colors"
            >
              <LayoutDashboard className="h-5 w-5" />
              Wealth Tracker
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Show when="signed-in">
              <Link
                href="/"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </Link>
              <UserButton />
            </Show>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
