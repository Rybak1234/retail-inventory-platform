import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

async function main() {
  console.log("🛒 Seeding SurtiBolivia Inventario...");

  // Inventory users — separate from ecommerce users
  const adminPass = await bcrypt.hash("admin123", 12);
  const managerPass = await bcrypt.hash("manager123", 12);
  const employeePass = await bcrypt.hash("employee123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "inv-admin@surtibolivia.bo" },
    update: { password: adminPass },
    create: { email: "inv-admin@surtibolivia.bo", password: adminPass, name: "Administrador Inventario", role: "admin", referralCode: "INVADM" },
  });
  const manager = await prisma.user.upsert({
    where: { email: "inv-gestor@surtibolivia.bo" },
    update: { password: managerPass },
    create: { email: "inv-gestor@surtibolivia.bo", password: managerPass, name: "María García", role: "manager", referralCode: "INVGES" },
  });
  const employee = await prisma.user.upsert({
    where: { email: "inv-empleado@surtibolivia.bo" },
    update: { password: employeePass },
    create: { email: "inv-empleado@surtibolivia.bo", password: employeePass, name: "Carlos López", role: "employee", referralCode: "INVEMP" },
  });

  console.log("✅ Usuarios de inventario creados/actualizados");
  console.log("   Admin:    inv-admin@surtibolivia.bo / admin123");
  console.log("   Gestor:   inv-gestor@surtibolivia.bo / manager123");
  console.log("   Empleado: inv-empleado@surtibolivia.bo / employee123");

  // Also ensure the empleado@surtibolivia.bo credential works for backward compat
  const empPass = await bcrypt.hash("emp123", 12);
  await prisma.user.upsert({
    where: { email: "empleado@surtibolivia.bo" },
    update: { password: empPass },
    create: { email: "empleado@surtibolivia.bo", password: empPass, name: "Empleado Demo", role: "employee", referralCode: "EMPDMO" },
  });

  // Create sample movements for existing products
  const products = await prisma.product.findMany({ take: 10 });
  const userIds = [admin.id, manager.id, employee.id];
  const entryReasons = ["Stock inicial", "Reposición de almacén", "Compra a proveedor"];
  const exitReasons = ["Venta en tienda", "Venta online", "Producto dañado"];

  for (const product of products) {
    await prisma.movement.create({
      data: {
        type: "entry",
        quantity: Math.floor(Math.random() * 20) + 10,
        reason: entryReasons[Math.floor(Math.random() * entryReasons.length)],
        productId: product.id,
        userId: userIds[Math.floor(Math.random() * userIds.length)],
      },
    });
    if (Math.random() > 0.3) {
      await prisma.movement.create({
        data: {
          type: "exit",
          quantity: Math.floor(Math.random() * 5) + 1,
          reason: exitReasons[Math.floor(Math.random() * exitReasons.length)],
          productId: product.id,
          userId: userIds[Math.floor(Math.random() * userIds.length)],
        },
      });
    }
  }

  console.log(`Movimientos creados para ${products.length} productos`);
  console.log("Seed de inventario completado!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
