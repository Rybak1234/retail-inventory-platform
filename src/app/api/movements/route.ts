import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  const type = searchParams.get("type");

  const where: Record<string, string> = {};
  if (productId) where.productId = productId;
  if (type) where.type = type;

  const movements = await prisma.movement.findMany({
    where,
    include: { product: { select: { name: true, sku: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(movements);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const quantity = parseInt(body.quantity);
  if (!quantity || quantity <= 0) {
    return NextResponse.json({ error: "Quantity must be positive" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: body.productId } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  if (body.type === "exit" && product.stock < quantity) {
    return NextResponse.json({ error: "Insufficient stock" }, { status: 400 });
  }

  const stockChange = body.type === "entry" ? quantity : -quantity;

  const [movement] = await prisma.$transaction([
    prisma.movement.create({
      data: {
        type: body.type,
        quantity,
        reason: body.reason || "",
        productId: body.productId,
      },
    }),
    prisma.product.update({
      where: { id: body.productId },
      data: { stock: { increment: stockChange } },
    }),
  ]);

  return NextResponse.json(movement, { status: 201 });
}
