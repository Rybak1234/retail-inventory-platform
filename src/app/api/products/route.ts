import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const lowStock = searchParams.get("lowStock");

  const where: Record<string, unknown> = { active: true };
  if (category) where.categoryName = category;

  const products = await prisma.product.findMany({
    where,
    include: { category: { select: { name: true, slug: true } } },
    orderBy: { updatedAt: "desc" },
  });

  const result = lowStock === "true"
    ? products.filter((p) => p.stock <= p.lowStockThreshold)
    : products;

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const slug = (body.name || "").toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-") + "-" + Date.now().toString(36);

  const product = await prisma.product.create({
    data: {
      name: body.name,
      slug,
      sku: body.sku || null,
      description: body.description || "",
      categoryName: body.category || "General",
      categoryId: body.categoryId || null,
      price: parseFloat(body.price) || 0,
      stock: parseInt(body.stock) || 0,
      lowStockThreshold: parseInt(body.minStock) || 5,
      image: body.image || null,
      active: true,
    },
  });

  return NextResponse.json(product, { status: 201 });
}
