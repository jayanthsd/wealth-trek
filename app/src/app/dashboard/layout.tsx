"use client";

import { UserButton, RedirectToSignIn, Show } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-foreground/40">Securing environment...</p>
        </div>
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
        {/* Midnight Ink Header */}
        <header className="flex h-20 shrink-0 items-center justify-between border-b border-white/5 surface-dark-glass px-6 lg:px-10">
          <div /> {/* Spacer for layout balance */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Show when="signed-in">
              <UserButton appearance={{
                elements: {
                  userButtonAvatarBox: "h-9 w-9 border border-white/10 hover:border-primary/50 transition-colors"
                }
              }} />
            </Show>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-background/50">
          {children}
        </main>
      </div>
    </div>
  );
}
