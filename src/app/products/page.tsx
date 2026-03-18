import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
        <Link
          href="/products/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
        >
          + Nuevo Producto
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-gray-400 text-lg mb-4">No hay productos registrados</p>
          <Link
            href="/products/new"
            className="inline-block bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition"
          >
            Agregar primer producto
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Producto
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                  SKU
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Categoría
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Stock
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Precio
                </th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500 font-mono">{product.sku}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{product.category}</td>
                  <td className="px-5 py-3 text-right">
                    <span
                      className={`text-sm font-bold ${
                        product.stock <= product.minStock ? "text-red-600" : "text-gray-900"
                      }`}
                    >
                      {product.stock}
                    </span>
                    {product.stock <= product.minStock && (
                      <span className="ml-1.5 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
                        Bajo
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right text-sm text-gray-600">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/products/${product.id}`}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      Ver
                    </Link>
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
