import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Warung Pa Tito",
  description: "Sistem Manajemen Warung Kelontong",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}