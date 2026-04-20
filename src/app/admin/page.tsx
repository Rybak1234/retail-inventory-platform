import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AlertTriangle, BarChart3, Users, ClipboardList } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string })?.role !== "admin") redirect("/");

  const [products, movements, users, lowStockProducts] = await Promise.all([
    prisma.product.findMany(),
    prisma.movement.findMany({ orderBy: { createdAt: "desc" }, take: 15, include: { product: { select: { name: true, sku: true } }, user: { select: { name: true } } } }),
    prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true }, orderBy: { createdAt: "desc" } }),
    prisma.product.findMany({ where: { stock: { lte: 5 } } }).catch(() => []),
  ]);

  const totalProducts = products.length;
  const totalStock = products.reduce((s, p) => s + p.stock, 0);
  const totalValue = products.reduce((s, p) => s + p.stock * p.price, 0);
  const lowStock = products.filter((p) => p.stock <= p.lowStockThreshold);
  const activeUsers = users.length;

  const categories = [...new Set(products.map((p) => p.categoryName))];
  const categoryStats = categories.map((cat) => {
    const items = products.filter((p) => p.categoryName === cat);
    return { name: cat, count: items.length, stock: items.reduce((s, p) => s + p.stock, 0), value: items.reduce((s, p) => s + p.stock * p.price, 0) };
  }).sort((a, b) => b.value - a.value);

  // Movement stats
  const entryCount = movements.filter((m) => m.type === "entry").length;
  const exitCount = movements.filter((m) => m.type === "exit").length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
        <div className="flex gap-2">
          <Link href="/admin/users" className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-700 transition">
            Gestionar Usuarios
          </Link>
          <Link href="/admin/reports" className="bg-white border text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition">
            Reportes
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">Total Productos</p>
          <p className="text-3xl font-bold text-gray-900">{totalProducts}</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">Unidades en Stock</p>
          <p className="text-3xl font-bold text-gray-900">{totalStock.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">Valor del Inventario</p>
          <p className="text-2xl font-bold text-brand-700">Bs. {totalValue.toLocaleString("es-BO", { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">Alertas Stock Bajo</p>
          <p className={`text-3xl font-bold ${lowStock.length > 0 ? "text-red-600" : "text-green-600"}`}>{lowStock.length}</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">Usuarios Activos</p>
          <p className="text-3xl font-bold text-gray-900">{activeUsers}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl border">
          <div className="px-5 py-4 border-b">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /> Stock Bajo ({lowStock.length})</h2>
          </div>
          <div className="p-5 max-h-64 overflow-y-auto">
            {lowStock.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">Sin alertas</p>
            ) : (
              <div className="space-y-3">
                {lowStock.map((p) => (
                  <Link key={p.id} href={`/products/${p.id}`} className="flex items-center justify-between hover:bg-gray-50 p-2 rounded -mx-2 transition">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.sku}</p>
                    </div>
                    <span className={`text-sm font-bold text-red-600`}>{p.stock} / {p.lowStockThreshold}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl border">
          <div className="px-5 py-4 border-b">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-brand-600" /> Por Categoría</h2>
          </div>
          <div className="p-5">
            <div className="space-y-3">
              {categoryStats.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{cat.name}</p>
                    <p className="text-xs text-gray-400">{cat.count} productos · {cat.stock} uds</p>
                  </div>
                  <span className="text-sm font-semibold text-brand-700">Bs. {cat.value.toLocaleString("es-BO")}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Users Summary */}
        <div className="bg-white rounded-xl border">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2"><Users className="w-4 h-4 text-brand-600" /> Usuarios</h2>
            <Link href="/admin/users" className="text-sm text-brand-600 hover:underline">Ver todos</Link>
          </div>
          <div className="p-5 max-h-64 overflow-y-auto">
            <div className="space-y-3">
              {users.slice(0, 8).map((u) => (
                <div key={u.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{u.name}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded capitalize ${u.role === "admin" ? "bg-purple-100 text-purple-700" : u.role === "manager" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>{u.role}</span>
                    <span className={`w-2 h-2 rounded-full bg-green-500`}></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Movements */}
      <div className="bg-white rounded-xl border">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-brand-600" /> Movimientos Recientes
            <span className="ml-3 text-xs font-normal text-gray-400">
              {entryCount} entradas · {exitCount} salidas (últimos 15)
            </span>
          </h2>
          <Link href="/movements" className="text-sm text-brand-600 hover:underline">Ver todos</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-5 py-3 text-left">Producto</th>
                <th className="px-5 py-3 text-left">Tipo</th>
                <th className="px-5 py-3 text-left">Cantidad</th>
                <th className="px-5 py-3 text-left">Motivo</th>
                <th className="px-5 py-3 text-left">Usuario</th>
                <th className="px-5 py-3 text-left">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {movements.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900">{m.product.name}</p>
                    <p className="text-xs text-gray-400">{m.product.sku}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${m.type === "entry" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {m.type === "entry" ? "Entrada" : "Salida"}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-medium">{m.quantity}</td>
                  <td className="px-5 py-3 text-gray-500">{m.reason || "—"}</td>
                  <td className="px-5 py-3 text-gray-500">{m.user?.name || "Sistema"}</td>
                  <td className="px-5 py-3 text-gray-400">{new Date(m.createdAt).toLocaleDateString("es")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
