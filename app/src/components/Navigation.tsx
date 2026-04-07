"use client";

import Link from "next/link";
import { useState } from "react";
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WealthTrekLogo } from "@/components/WealthTrekLogo";

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinkClass =
    "inline-flex min-h-11 items-center rounded-xl px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

  return (
    <nav className="sticky top-0 z-40 surface-nav-glass">
      <div className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-4 lg:gap-8">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center gap-2.5 rounded-xl px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              aria-label="Go to home page"
            >
              <WealthTrekLogo size={24} className="text-primary" />
              <span className="text-[17px] font-bold tracking-tight text-foreground">Wealth Trek</span>
            </Link>
            <div className="hidden items-center gap-1 md:flex">
              <Link href="/" className={navLinkClass}>
                Home
              </Link>
              <Link href="/pricing" className={navLinkClass}>
                Pricing
              </Link>
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <ThemeToggle />
            <Show when="signed-out">
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm" className="min-h-11 text-foreground/70 hover:text-primary hover:bg-primary/5">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="min-h-11 border border-primary/40 bg-primary/8 text-primary rounded-full px-6 py-2 text-sm font-medium transition-all hover:bg-primary/15 active:scale-95">
                  Sign Up
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Link href="/dashboard" className={navLinkClass}>
                Dashboard
              </Link>
              <UserButton appearance={{
                elements: {
                  userButtonAvatarBox: "h-9 w-9 border border-border"
                }
              }} />
            </Show>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="border-border bg-background text-foreground/70"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setIsMenuOpen((open) => !open)}
            >
              {isMenuOpen ? <X aria-hidden className="h-5 w-5" /> : <Menu aria-hidden className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <div
          id="mobile-navigation"
          className={`grid overflow-hidden transition-default md:hidden ${isMenuOpen ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
        >
          <div className="min-h-0 rounded-2xl border border-border surface-dark-glass p-3 shadow-lg">
            <div className="flex flex-col gap-1">
              <Link href="/" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
              <Link href="/pricing" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>
                Pricing
              </Link>
              <Show when="signed-in">
                <Link href="/dashboard" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>
                  Dashboard
                </Link>
              </Show>
            </div>

            <div className="mt-3 border-t border-border pt-3">
              <Show when="signed-out">
                <div className="flex flex-col gap-2">
                  <SignInButton mode="modal">
                    <Button variant="outline" size="sm" className="w-full border-border text-foreground/70">
                      Sign In
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="w-full min-h-11 border border-primary/40 bg-primary/8 text-primary rounded-full px-6 py-2 text-sm font-medium transition-all hover:bg-primary/15">
                      Sign Up
                    </button>
                  </SignUpButton>
                </div>
              </Show>
              <Show when="signed-in">
                <div className="flex items-center justify-between px-2">
                  <p className="text-sm text-foreground/50 italic font-display">Your Account</p>
                  <UserButton />
                </div>
              </Show>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
