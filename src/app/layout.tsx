import type { Metadata } from "next";
import { Toaster } from 'sonner';
import "./globals.css";

export const metadata: Metadata = {
  title: "Sampson's Barbershop | Wheelersburg, Ohio",
  description: "Quality haircuts and grooming services in Wheelersburg, Ohio. Family-friendly barbershop. Walk-ins only!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
