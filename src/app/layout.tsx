import type { Metadata } from "next";
import Link from "next/link";
import AuthProvider from "@/components/AuthProvider";
import UserMenu from "@/components/UserMenu";
import "./globals.css";

export const metadata: Metadata = {
  title: "NovaTech Inventario · Control de Stock",
  description: "Sistema de control de inventario para NovaTech — gestión de stock, movimientos y alertas",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gray-50 min-h-screen">
        <AuthProvider>
          <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
              <Link href="/" className="text-lg font-bold text-indigo-700">
                📦 NovaTech Inventario
              </Link>
              <div className="flex gap-4 text-sm items-center">
                <Link href="/" className="text-gray-600 hover:text-indigo-700 transition">
                  Dashboard
                </Link>
                <Link href="/products" className="text-gray-600 hover:text-indigo-700 transition">
                  Productos
                </Link>
                <Link href="/movements" className="text-gray-600 hover:text-indigo-700 transition">
                  Movimientos
                </Link>
                <Link
                  href="/products/new"
                  className="bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 transition"
                >
                  + Producto
                </Link>
                <div className="border-l pl-4 ml-2">
                  <UserMenu />
                </div>
              </div>
            </div>
          </nav>
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
