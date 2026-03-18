import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const lowStock = searchParams.get("lowStock");

  const where: Record<string, unknown> = {};
  if (category) where.category = category;

  const products = await prisma.product.findMany({
    where,
    orderBy: { updatedAt: "desc" },
  });

  const result = lowStock === "true"
    ? products.filter((p) => p.stock <= p.minStock)
    : products;

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const product = await prisma.product.create({
    data: {
      name: body.name,
      sku: body.sku,
      description: body.description || "",
      category: body.category,
      unit: body.unit || "unidad",
      price: parseFloat(body.price) || 0,
      stock: parseInt(body.stock) || 0,
      minStock: parseInt(body.minStock) || 5,
    },
  });

  return NextResponse.json(product, { status: 201 });
}
