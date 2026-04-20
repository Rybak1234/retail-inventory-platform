import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { movements: { orderBy: { createdAt: "desc" }, take: 20 } },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();

  const product = await prisma.product.update({
    where: { id: params.id },
    data: {
      name: body.name,
      sku: body.sku,
      description: body.description,
      categoryName: body.category || body.categoryName,
      categoryId: body.categoryId || undefined,
      price: parseFloat(body.price) || 0,
      image: body.image !== undefined ? (body.image || null) : undefined,
      lowStockThreshold: parseInt(body.minStock || body.lowStockThreshold) || 5,
    },
  });

  return NextResponse.json(product);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.product.delete({ where: { id: params.id } });
  return NextResponse.json({ message: "Deleted" });
}
