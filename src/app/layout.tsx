import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollObserver } from "@/components/layout/ScrollObserver";
import { getSettings, getNavigation } from "@/lib/cms";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: {
      default: settings.siteTitle,
      template: `%s | ${settings.siteName}`
    },
    description: settings.siteDescription,
    openGraph: {
      title: settings.siteTitle,
      description: settings.siteDescription,
      siteName: settings.siteName,
      locale: "en_US",
      type: "website"
    }
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();
  const navigation = await getNavigation();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0A0A0C] text-[#F4F4F5] transition-colors duration-200">
        <ScrollObserver />
        <Navbar settings={settings} navigation={navigation} />
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        <Footer settings={settings} navigation={navigation} />
      </body>
    </html>
  );
}
