import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MovementsPage() {
  const movements = await prisma.movement.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { product: { select: { name: true, sku: true } } },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Bitácora de Movimientos</h1>

      {movements.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border">
          <p className="text-gray-400 text-lg">No hay movimientos registrados</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Producto</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Tipo</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Cantidad</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Motivo</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {movements.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <p className="text-sm font-medium text-gray-900">{m.product.name}</p>
                    <p className="text-xs text-gray-400 font-mono">{m.product.sku}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${m.type === "entry" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {m.type === "entry" ? "Entrada" : "Salida"}
                    </span>
                  </td>
                  <td className={`px-5 py-3 text-right text-sm font-bold ${m.type === "entry" ? "text-green-600" : "text-red-600"}`}>
                    {m.type === "entry" ? "+" : "-"}{m.quantity}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">{m.reason || "—"}</td>
                  <td className="px-5 py-3 text-sm text-gray-400">
                    {new Date(m.createdAt).toLocaleString("es")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
