import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Package, Plus, ImageIcon, Search } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { q?: string; cat?: string };
}) {
  const where: any = {};
  if (searchParams.q) {
    where.OR = [
      { name: { contains: searchParams.q, mode: "insensitive" } },
      { sku: { contains: searchParams.q, mode: "insensitive" } },
    ];
  }
  if (searchParams.cat) {
    where.categoryName = searchParams.cat;
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { updatedAt: "desc" },
  });

  const allCategories = await prisma.product.findMany({
    select: { categoryName: true },
    distinct: ["categoryName"],
    orderBy: { categoryName: "asc" },
  });
  const categories = allCategories.map((c) => c.categoryName);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
        <Link
          href="/products/new"
          className="flex items-center gap-1 bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Nuevo Producto
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <form method="GET" className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            name="q"
            type="text"
            defaultValue={searchParams.q || ""}
            placeholder="Buscar por nombre o SKU..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white"
          />
        </div>
        <select
          name="cat"
          defaultValue={searchParams.cat || ""}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-brand-500 outline-none"
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition text-sm font-medium shrink-0"
        >
          Buscar
        </button>
        {(searchParams.q || searchParams.cat) && (
          <Link
            href="/products"
            className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition text-sm text-center shrink-0"
          >
            Limpiar
          </Link>
        )}
      </form>

      {(searchParams.q || searchParams.cat) && (
        <p className="text-sm text-gray-500 mb-4">
          {products.length} resultado{products.length !== 1 ? "s" : ""}
          {searchParams.q && <> para &quot;{searchParams.q}&quot;</>}
          {searchParams.cat && <> en {searchParams.cat}</>}
        </p>
      )}

      {products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-400 text-lg mb-4">No hay productos registrados</p>
          <Link
            href="/products/new"
            className="inline-block bg-brand-600 text-white px-5 py-2.5 rounded-lg hover:bg-brand-700 transition"
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
                    <div className="flex items-center gap-3">
                      {product.image ? (
                        <img src={product.image} alt="" className="h-9 w-9 rounded-lg object-cover border flex-shrink-0" />
                      ) : (
                        <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <ImageIcon className="h-4 w-4 text-gray-300" />
                        </div>
                      )}
                      <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500 font-mono">{product.sku}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{product.categoryName}</td>
                  <td className="px-5 py-3 text-right">
                    <span
                      className={`text-sm font-bold ${
                        product.stock <= product.lowStockThreshold ? "text-red-600" : "text-gray-900"
                      }`}
                    >
                      {product.stock}
                    </span>
                    {product.stock <= product.lowStockThreshold && (
                      <span className="ml-1.5 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
                        Bajo
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right text-sm text-gray-600">
                    Bs. {product.price.toFixed(2)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/products/${product.id}`}
                      className="text-brand-600 hover:text-brand-800 text-sm font-medium"
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
