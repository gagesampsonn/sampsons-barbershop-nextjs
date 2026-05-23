import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { Toaster } from 'sonner';
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sampson's Barbershop | Wheelersburg, Ohio",
  description: "Quality haircuts and grooming services in Wheelersburg, Ohio. Family-friendly barbershop. Walk-ins only!",
  icons: {
    icon: [{ url: '/icon-barber-pole.png', type: 'image/png' }],
    apple: [{ url: '/icon-barber-pole.png', type: 'image/png' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="antialiased font-sans">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
