"use client";

import { useState, useEffect, FormEvent, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import { ArrowLeft, Pencil, Trash2, Save, X, ImageIcon, Upload } from "lucide-react";

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
  slug: string;
  description: string;
  categoryName: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  image?: string | null;
  movements: Movement[];
}

const categories = ["Abarrotes", "Lacteos y Huevos", "Carnes y Embutidos", "Frutas y Verduras", "Panaderia", "Bebidas", "Limpieza y Hogar", "Cuidado Personal", "Ropa y Accesorios", "Electronica"];

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [movType, setMovType] = useState("entry");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editData, setEditData] = useState({ name: "", sku: "", description: "", category: "", price: "", minStock: "", image: "" });

  function loadProduct() {
    fetch(`/api/products/${params.id}`)
      .then((r) => r.json())
      .then((p: Product) => {
        setProduct(p);
        setEditData({
          name: p.name || "",
          sku: p.sku || "",
          description: p.description || "",
          category: p.categoryName || "",
          price: String(p.price || 0),
          minStock: String(p.lowStockThreshold || 5),
          image: p.image || "",
        });
      });
  }

  useEffect(() => { loadProduct(); }, [params.id]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const { url } = await res.json();
        setEditData({ ...editData, image: url });
        toast.success("Imagen subida");
      } else {
        const err = await res.json();
        toast.error(err.error || "Error al subir imagen");
      }
    } catch {
      toast.error("Error al subir imagen");
    }
    setUploading(false);
  }

  async function handleEdit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/products/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData),
    });
    if (res.ok) {
      toast.success("Producto actualizado");
      setEditing(false);
      loadProduct();
    } else {
      toast.error("Error al actualizar");
    }
    setSaving(false);
  }

  async function handleMovement(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/movements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: params.id, type: movType, quantity: form.get("quantity"), reason: form.get("reason") }),
    });
    if (res.ok) {
      toast.success("Movimiento registrado");
      loadProduct();
      e.currentTarget.reset();
    } else {
      const err = await res.json();
      toast.error(err.error || "Error");
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm("Eliminar este producto y todos sus movimientos?")) return;
    const res = await fetch(`/api/products/${params.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Producto eliminado");
      router.push("/products");
      router.refresh();
    }
  }

  if (!product) {
    return <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-400">Cargando...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/products" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600 mb-4">
        <ArrowLeft className="h-4 w-4" /> Volver a productos
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          {product.image ? (
            <img src={product.image} alt={product.name} className="h-20 w-20 rounded-xl object-cover border shadow-sm" />
          ) : (
            <div className="h-20 w-20 rounded-xl bg-gray-100 flex items-center justify-center border">
              <ImageIcon className="h-10 w-10 text-gray-300" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-sm text-gray-500">SKU: {product.sku} · {product.categoryName}</p>
            {product.image && (
              <p className="text-xs text-gray-400 mt-1 max-w-xs truncate">Imagen: {product.image}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setEditing(!editing)} className="flex items-center gap-1 text-brand-600 hover:text-brand-800 text-sm font-medium border border-brand-200 px-3 py-1.5 rounded-lg hover:bg-brand-50 transition">
            <Pencil className="h-3.5 w-3.5" /> Editar
          </button>
          <button onClick={handleDelete} className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm font-medium border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition">
            <Trash2 className="h-3.5 w-3.5" /> Eliminar
          </button>
        </div>
      </div>

      {editing && (
        <form onSubmit={handleEdit} className="bg-white rounded-xl border p-5 mb-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Editar Producto</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Nombre</label>
              <input value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">SKU</label>
              <input value={editData.sku} onChange={(e) => setEditData({ ...editData, sku: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-brand-500 outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Categoria</label>
              <select value={editData.category} onChange={(e) => setEditData({ ...editData, category: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none">
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Precio (Bs.)</label>
              <input type="number" step="0.01" value={editData.price} onChange={(e) => setEditData({ ...editData, price: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Descripcion</label>
            <textarea value={editData.description} onChange={(e) => setEditData({ ...editData, description: e.target.value })} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-y" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Imagen del Producto</label>
            {editData.image && (
              <div className="mb-2 flex items-center gap-3 p-2 bg-gray-50 rounded-lg border">
                <img src={editData.image} alt="Imagen actual" className="h-16 w-16 rounded-lg object-cover border" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Imagen actual</p>
                  <p className="text-xs text-gray-400 truncate">{editData.image}</p>
                </div>
                <button type="button" onClick={() => setEditData({ ...editData, image: "" })} className="text-red-500 hover:text-red-700 text-xs">Quitar</button>
              </div>
            )}
            <div className="flex gap-2 items-center">
              <input type="url" value={editData.image} onChange={(e) => setEditData({ ...editData, image: e.target.value })} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none" placeholder="https://images.unsplash.com/..." />
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="flex items-center gap-1 border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition text-sm disabled:opacity-50">
                <Upload className="h-3.5 w-3.5" /> {uploading ? "Subiendo..." : "Subir"}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Stock Minimo</label>
            <input type="number" value={editData.minStock} onChange={(e) => setEditData({ ...editData, minStock: e.target.value })} className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={saving} className="flex items-center gap-1 bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition text-sm font-medium disabled:opacity-50">
              <Save className="h-3.5 w-3.5" /> {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
            <button type="button" onClick={() => setEditing(false)} className="flex items-center gap-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition text-sm">
              <X className="h-3.5 w-3.5" /> Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border p-5 text-center">
          <p className="text-sm text-gray-500">Stock Actual</p>
          <p className={`text-3xl font-bold ${product.stock <= product.lowStockThreshold ? "text-red-600" : "text-gray-900"}`}>{product.stock}</p>
        </div>
        <div className="bg-white rounded-xl border p-5 text-center">
          <p className="text-sm text-gray-500">Stock Minimo</p>
          <p className="text-3xl font-bold text-gray-900">{product.lowStockThreshold}</p>
        </div>
        <div className="bg-white rounded-xl border p-5 text-center">
          <p className="text-sm text-gray-500">Valor en Stock</p>
          <p className="text-3xl font-bold text-brand-700">Bs. {(product.stock * product.price).toFixed(2)}</p>
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
