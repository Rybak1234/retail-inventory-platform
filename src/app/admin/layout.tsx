import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { BarChart3, Users, TrendingUp, Package, ArrowLeftRight, ArrowLeft } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string })?.role !== "admin") redirect("/");

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <aside className="w-56 bg-white border-r hidden lg:block">
        <nav className="p-4 space-y-1">
          <Link href="/admin" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition">
            <BarChart3 className="w-4 h-4" /> Dashboard
          </Link>
          <Link href="/admin/users" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition">
            <Users className="w-4 h-4" /> Usuarios
          </Link>
          <Link href="/admin/reports" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition">
            <TrendingUp className="w-4 h-4" /> Reportes
          </Link>
          <Link href="/products" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition">
            <Package className="w-4 h-4" /> Productos
          </Link>
          <Link href="/movements" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition">
            <ArrowLeftRight className="w-4 h-4" /> Movimientos
          </Link>
          <hr className="my-3" />
          <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition">
            <ArrowLeft className="w-4 h-4" /> Volver al sitio
          </Link>
        </nav>
      </aside>
      <main className="flex-1 bg-gray-50">{children}</main>
    </div>
  );
}
