"use client";

import Link from "next/link";
import { useState } from "react";
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinkClass =
    "inline-flex min-h-11 items-center rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

  return (
    <nav className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-4 lg:gap-8">
            <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-xl px-1 text-lg font-semibold tracking-tight text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40" aria-label="Go to home page">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20" aria-hidden="true">
                WT
              </span>
              <span>Wealth Tracker</span>
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

          <div className="hidden items-center gap-3 md:flex">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm" className="min-h-11">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm" className="min-h-11">
                  Sign Up
                </Button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Link href="/dashboard" className={navLinkClass}>
                Dashboard
              </Link>
              <UserButton />
            </Show>
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="md:hidden"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? <X aria-hidden className="h-5 w-5" /> : <Menu aria-hidden className="h-5 w-5" />}
          </Button>
        </div>

        <div
          id="mobile-navigation"
          className={`grid overflow-hidden transition-default md:hidden ${isMenuOpen ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
        >
          <div className="min-h-0 rounded-2xl border border-border/70 bg-card/95 p-3 shadow-[var(--shadow-soft)]">
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

            <div className="mt-3 border-t border-border/70 pt-3">
              <Show when="signed-out">
                <div className="flex gap-2">
                  <SignInButton mode="modal">
                    <Button variant="outline" size="sm" className="w-full">
                      Sign In
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button size="sm" className="w-full">
                      Sign Up
                    </Button>
                  </SignUpButton>
                </div>
              </Show>
              <Show when="signed-in">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Signed in</p>
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
