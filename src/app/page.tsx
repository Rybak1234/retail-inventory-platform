import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AlertTriangle, ClipboardList, BarChart3, Package, Layers, DollarSign } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const products = await prisma.product.findMany();
  const movements = await prisma.movement.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { product: { select: { name: true } } },
  });

  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockItems = products.filter((p) => p.stock <= p.lowStockThreshold);
  const totalValue = products.reduce((sum, p) => sum + p.stock * p.price, 0);

  const categories = [...new Set(products.map((p) => p.categoryName))];
  const categoryStats = categories.map((cat) => {
    const items = products.filter((p) => p.categoryName === cat);
    return {
      name: cat,
      count: items.length,
      stock: items.reduce((s, p) => s + p.stock, 0),
    };
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard de Inventario</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">Productos</p>
          <p className="text-3xl font-bold text-gray-900">{totalProducts}</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">Unidades en Stock</p>
          <p className="text-3xl font-bold text-gray-900">{totalStock}</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">Stock Bajo</p>
          <p className={`text-3xl font-bold ${lowStockItems.length > 0 ? "text-red-600" : "text-green-600"}`}>
            {lowStockItems.length}
          </p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">Valor Total</p>
          <p className="text-3xl font-bold text-brand-700">
            Bs. {totalValue.toLocaleString("es-BO", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Alertas de stock bajo */}
        <div className="bg-white rounded-xl border">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /> Alertas de Stock Bajo</h2>
            <Link href="/products" className="text-sm text-brand-600 hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="p-5">
            {lowStockItems.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">Sin alertas</p>
            ) : (
              <div className="space-y-3">
                {lowStockItems.slice(0, 5).map((p) => (
                  <div key={p.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{p.name}</p>
                      <p className="text-xs text-gray-400">SKU: {p.sku}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-red-600">{p.stock}</span>
                      <span className="text-xs text-gray-400"> / min {p.lowStockThreshold}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Últimos movimientos */}
        <div className="bg-white rounded-xl border">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2"><ClipboardList className="w-4 h-4 text-brand-600" /> Últimos Movimientos</h2>
            <Link href="/movements" className="text-sm text-brand-600 hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="p-5">
            {movements.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">Sin movimientos</p>
            ) : (
              <div className="space-y-3">
                {movements.map((m) => (
                  <div key={m.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{m.product.name}</p>
                      <p className="text-xs text-gray-400">
                        {m.reason || (m.type === "entry" ? "Entrada" : "Salida")}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-bold ${
                        m.type === "entry" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {m.type === "entry" ? "+" : "-"}{m.quantity}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Por categoría */}
        <div className="bg-white rounded-xl border lg:col-span-2">
          <div className="px-5 py-4 border-b">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-brand-600" /> Stock por Categoría</h2>
          </div>
          <div className="p-5">
            {categoryStats.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">Sin categorías</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categoryStats.map((cat) => (
                  <div key={cat.name} className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-sm font-medium text-gray-700">{cat.name}</p>
                    <p className="text-xl font-bold text-brand-600">{cat.stock}</p>
                    <p className="text-xs text-gray-400">{cat.count} productos</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
