"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";

interface Movement {
  id: string;
  type: string;
  quantity: number;
  reason: string;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  category: string;
  unit: string;
  price: number;
  stock: number;
  minStock: number;
  movements: Movement[];
}

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [movType, setMovType] = useState("entry");
  const [saving, setSaving] = useState(false);

  function loadProduct() {
    fetch(`/api/products/${params.id}`)
      .then((r) => r.json())
      .then(setProduct);
  }

  useEffect(() => {
    loadProduct();
  }, [params.id]);

  async function handleMovement(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const form = new FormData(e.currentTarget);
    const body = {
      productId: params.id,
      type: movType,
      quantity: form.get("quantity"),
      reason: form.get("reason"),
    };

    const res = await fetch("/api/movements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      loadProduct();
      e.currentTarget.reset();
    } else {
      const err = await res.json();
      alert(err.error || "Error");
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm("¿Eliminar este producto y todos sus movimientos?")) return;

    const res = await fetch(`/api/products/${params.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/products");
      router.refresh();
    }
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-400">Cargando...</div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-sm text-gray-500">
            SKU: {product.sku} · {product.category} · {product.unit}
          </p>
        </div>
        <button onClick={handleDelete} className="text-red-600 hover:text-red-800 text-sm font-medium">
          Eliminar
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border p-5 text-center">
          <p className="text-sm text-gray-500">Stock Actual</p>
          <p className={`text-3xl font-bold ${product.stock <= product.minStock ? "text-red-600" : "text-gray-900"}`}>
            {product.stock}
          </p>
        </div>
        <div className="bg-white rounded-xl border p-5 text-center">
          <p className="text-sm text-gray-500">Stock Mínimo</p>
          <p className="text-3xl font-bold text-gray-900">{product.minStock}</p>
        </div>
        <div className="bg-white rounded-xl border p-5 text-center">
          <p className="text-sm text-gray-500">Valor en Stock</p>
          <p className="text-3xl font-bold text-indigo-700">
            ${(product.stock * product.price).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Registrar movimiento */}
      <div className="bg-white rounded-xl border p-5 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Registrar Movimiento</h2>
        <form onSubmit={handleMovement} className="flex gap-3 items-end flex-wrap">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
            <select value={movType} onChange={(e) => setMovType(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none">
              <option value="entry">Entrada</option>
              <option value="exit">Salida</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Cantidad</label>
            <input name="quantity" type="number" min="1" required className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-24 outline-none" />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Motivo</label>
            <input name="reason" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none" placeholder="Compra, venta, ajuste..." />
          </div>
          <button type="submit" disabled={saving} className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition disabled:opacity-50 ${movType === "entry" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}>
            {saving ? "..." : movType === "entry" ? "+ Entrada" : "- Salida"}
          </button>
        </form>
      </div>

      {/* Historial */}
      <div className="bg-white rounded-xl border">
        <div className="px-5 py-4 border-b">
          <h2 className="font-semibold text-gray-900">Historial de Movimientos</h2>
        </div>
        {product.movements.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">Sin movimientos</p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500">Tipo</th>
                <th className="text-right px-5 py-2.5 text-xs font-semibold text-gray-500">Cantidad</th>
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500">Motivo</th>
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {product.movements.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-5 py-2.5">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${m.type === "entry" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {m.type === "entry" ? "Entrada" : "Salida"}
                    </span>
                  </td>
                  <td className={`px-5 py-2.5 text-right text-sm font-bold ${m.type === "entry" ? "text-green-600" : "text-red-600"}`}>
                    {m.type === "entry" ? "+" : "-"}{m.quantity}
                  </td>
                  <td className="px-5 py-2.5 text-sm text-gray-600">{m.reason || "—"}</td>
                  <td className="px-5 py-2.5 text-sm text-gray-400">
                    {new Date(m.createdAt).toLocaleString("es")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
