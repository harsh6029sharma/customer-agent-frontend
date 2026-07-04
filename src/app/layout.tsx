import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Customer Support",
  description: "AI Customer Support System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
   <html lang="en" className="dark">
  <body className={inter.className}>
    <AuthProvider>
      {children}
      <Toaster richColors position="top-right" theme="dark" />
    </AuthProvider>
  </body>
</html>
  );
}