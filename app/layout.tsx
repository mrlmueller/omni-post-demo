import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import Cookiebanner from "./components/Cookiebanner";
import Footer from "./Footer";
import "./globals.css";
import NavBar from "./NavBar";
import { ToasterProvider } from "@/components/ui/toaster-provider";

const roboto = Roboto({
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OmniPost",
  description: "Post your video to multiple platforms in one click",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light text-foreground bg-background">
      {/*<head>
        <Script
          src={`https://cdn-cookieyes.com/client_data/4850c35d9447507793b9f32a/script.js`}
          strategy="beforeInteractive"
        ></Script>
      </head>*/}
      <body className={`${roboto.className} flex flex-col min-h-screen`}>
        <NavBar />
        <main className="flex-grow px-5 sm:px-8 md:px-14 2xl:px-24 max-w-8xl mx-auto w-full mt-32">
          {children}
        </main>
        <Footer />
        <Cookiebanner></Cookiebanner>
        <ToasterProvider />
      </body>
    </html>
  );
}
