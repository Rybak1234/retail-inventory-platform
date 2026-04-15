import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string })?.role !== "admin") redirect("/");

  const [products, movements] = await Promise.all([
    prisma.product.findMany(),
    prisma.movement.findMany({
      include: { product: { select: { name: true, sku: true, category: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Category report
  const categories = [...new Set(products.map((p) => p.category))];
  const categoryReport = categories.map((cat) => {
    const items = products.filter((p) => p.category === cat);
    const catMovements = movements.filter((m) => m.product.category === cat);
    const entries = catMovements.filter((m) => m.type === "entry").reduce((s, m) => s + m.quantity, 0);
    const exits = catMovements.filter((m) => m.type === "exit").reduce((s, m) => s + m.quantity, 0);
    return {
      name: cat,
      products: items.length,
      stock: items.reduce((s, p) => s + p.stock, 0),
      value: items.reduce((s, p) => s + p.stock * p.price, 0),
      entries,
      exits,
    };
  }).sort((a, b) => b.value - a.value);

  // Top movers
  const productMovements = products.map((p) => {
    const pMov = movements.filter((m) => m.productId === p.id);
    const totalEntries = pMov.filter((m) => m.type === "entry").reduce((s, m) => s + m.quantity, 0);
    const totalExits = pMov.filter((m) => m.type === "exit").reduce((s, m) => s + m.quantity, 0);
    return { ...p, totalEntries, totalExits, totalMovements: totalEntries + totalExits };
  });

  const topMovers = [...productMovements].sort((a, b) => b.totalMovements - a.totalMovements).slice(0, 10);
  const highValue = [...products].sort((a, b) => b.stock * b.price - a.stock * a.price).slice(0, 10);

  // Summary stats
  const totalEntries = movements.filter((m) => m.type === "entry").reduce((s, m) => s + m.quantity, 0);
  const totalExits = movements.filter((m) => m.type === "exit").reduce((s, m) => s + m.quantity, 0);
  const totalValue = products.reduce((s, p) => s + p.stock * p.price, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Reportes de Inventario</h1>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">Total Entradas</p>
          <p className="text-3xl font-bold text-green-600">{totalEntries.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">Total Salidas</p>
          <p className="text-3xl font-bold text-red-600">{totalExits.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">Movimientos Totales</p>
          <p className="text-3xl font-bold text-gray-900">{movements.length}</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">Valor Inventario</p>
          <p className="text-2xl font-bold text-indigo-700">Bs. {totalValue.toLocaleString("es-BO", { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Category Report */}
        <div className="bg-white rounded-xl border">
          <div className="px-5 py-4 border-b">
            <h2 className="font-semibold text-gray-900">📊 Reporte por Categoría</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Categoría</th>
                  <th className="px-4 py-3 text-right">Prod.</th>
                  <th className="px-4 py-3 text-right">Stock</th>
                  <th className="px-4 py-3 text-right">Valor</th>
                  <th className="px-4 py-3 text-right">E / S</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {categoryReport.map((r) => (
                  <tr key={r.name} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{r.name}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{r.products}</td>
                    <td className="px-4 py-3 text-right">{r.stock}</td>
                    <td className="px-4 py-3 text-right text-indigo-700">Bs. {r.value.toLocaleString("es-BO")}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-green-600">{r.entries}</span> / <span className="text-red-600">{r.exits}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Movers */}
        <div className="bg-white rounded-xl border">
          <div className="px-5 py-4 border-b">
            <h2 className="font-semibold text-gray-900">🔄 Productos Más Activos</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Producto</th>
                  <th className="px-4 py-3 text-right">Entradas</th>
                  <th className="px-4 py-3 text-right">Salidas</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {topMovers.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.sku}</p>
                    </td>
                    <td className="px-4 py-3 text-right text-green-600">{p.totalEntries}</td>
                    <td className="px-4 py-3 text-right text-red-600">{p.totalExits}</td>
                    <td className="px-4 py-3 text-right font-bold">{p.totalMovements}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Highest Value Products */}
      <div className="bg-white rounded-xl border">
        <div className="px-5 py-4 border-b">
          <h2 className="font-semibold text-gray-900">💰 Productos de Mayor Valor en Inventario</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-5 py-3 text-left">Producto</th>
                <th className="px-5 py-3 text-left">Categoría</th>
                <th className="px-5 py-3 text-right">Precio Unit.</th>
                <th className="px-5 py-3 text-right">Stock</th>
                <th className="px-5 py-3 text-right">Valor Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {highValue.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.sku}</p>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{p.category}</td>
                  <td className="px-5 py-3 text-right">Bs. {p.price.toLocaleString("es-BO")}</td>
                  <td className="px-5 py-3 text-right">{p.stock}</td>
                  <td className="px-5 py-3 text-right font-bold text-indigo-700">Bs. {(p.stock * p.price).toLocaleString("es-BO", { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
