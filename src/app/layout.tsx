import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FairShare",
  description: "Split restaurant bills easily with OCR and smart calculation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <Navigation />
        <main className="flex-1">
          {children}
        </main>
        <footer className="bg-gray-50 border-t border-gray-200 py-4 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Vibe coded using{' '}
                <span className="font-semibold text-gray-800">GitHub Copilot</span>
                {' '}by{' '}
                <a 
                  href="https://github.com/Abhinavmohanan" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200"
                >
                  Abhinav Mohanan
                </a>
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
