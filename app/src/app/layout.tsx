import type { Metadata } from "next";
import { DM_Sans, Lora, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wealth Trek — Wealth, measured with intention.",
  description: "Your money has a story. Track it clearly, consistently, and understand what it should be doing for you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} ${lora.variable} ${jetBrainsMono.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <ClerkProvider
            signInFallbackRedirectUrl="/dashboard"
            signUpFallbackRedirectUrl="/dashboard"
            afterSignOutUrl="/"
          >
            {children}
            <Analytics />
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
