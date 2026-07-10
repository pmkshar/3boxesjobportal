import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "3 Boxes Jobs - AI-Powered Job Portal",
  description: "India's first AI-powered job portal with smart resume building, AI mock interviews, skill auto-updates, and intelligent job matching. Built for job seekers, corporates, and recruiters.",
  keywords: ["3 Boxes Jobs", "AI Job Portal", "Smart Resume", "AI Interview", "Job Search", "Recruitment", "Skills Training"],
  authors: [{ name: "3 Boxes Jobs Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "3 Boxes Jobs - AI-Powered Job Portal",
    description: "Smart job matching, AI resume builder, mock interviews & skill auto-updates",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
