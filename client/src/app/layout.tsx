// src/app/layout.tsx
import type { Metadata } from "next";
import { Poppins, Playfair_Display, Open_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
  weight: ["700"],
});

export const metadata: Metadata = {
  title: "Nnata — E-invoicing via WhatsApp",
  description: "Send FIRS-compliant invoices on WhatsApp. Get paid faster.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html
      lang="en"
      className={`${poppins.variable} ${openSans.variable} ${playfair.variable}`}
    >
      <body className="font-sans antialiased">
          {children}
          <Toaster position="top-right" />
      </body>
    </html>
  );
}