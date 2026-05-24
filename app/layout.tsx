// For adding custom fonts with other frameworks, see:
// https://tailwindcss.com/docs/font-family
import type { Metadata } from "next";
import { Inter, Source_Serif_4, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Warder TVET College — Digital Examination System",
  description:
    "The official digital examination system for Warder Technical Vocational Education and Training College, Somali Regional State, Ethiopia. Secure, modern, and aligned with national competency standards.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={false}>
      <body className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} antialiased`}>
        <QueryProvider>
          <main className="w-full">
             <Toaster position="bottom-right" />
             <TooltipProvider>
            {children}
             </TooltipProvider>
          </main>
        </QueryProvider>
      </body>
    </html>
  );
}