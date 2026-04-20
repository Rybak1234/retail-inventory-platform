import type { Metadata } from "next";
import AuthProvider from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";
import { ScreenLoader } from "@/components/ScreenLoader";
import "./globals.css";

export const metadata: Metadata = {
  title: "SurtiBolivia Inventario · Control de Stock",
  description: "Sistema de control de inventario para SurtiBolivia — gestión de stock, movimientos y alertas",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gray-50 min-h-screen">
        <AuthProvider>
          <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px', padding: '12px 16px', fontSize: '14px' } }} />
          <ScreenLoader />
          <Navbar />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
