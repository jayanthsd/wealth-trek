"use client";

import Link from "next/link";
import { Show, UserButton, RedirectToSignIn } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { DashboardSidebar } from "@/components/DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, isSignedIn } = useAuth();

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
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      <div className="flex flex-1 flex-col">
        {/* Compact top bar */}
        <header className="flex h-16 shrink-0 items-center justify-end border-b border-border/60 bg-white/80 px-6 backdrop-blur-md dark:bg-gray-950/80">
          <div className="flex items-center gap-4">
            <Show when="signed-in">
              <Link
                href="/"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Home
              </Link>
              <UserButton />
            </Show>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
