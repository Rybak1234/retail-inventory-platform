import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding inventory database...");

  await prisma.movement.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const adminPass = await bcrypt.hash("admin123", 12);
  const managerPass = await bcrypt.hash("manager123", 12);
  const employeePass = await bcrypt.hash("employee123", 12);

  const admin = await prisma.user.create({
    data: { email: "admin@novatech.bo", password: adminPass, name: "Administrador", role: "admin" },
  });
  const manager = await prisma.user.create({
    data: { email: "gestor@novatech.bo", password: managerPass, name: "María García", role: "manager" },
  });
  const employee = await prisma.user.create({
    data: { email: "empleado@novatech.bo", password: employeePass, name: "Carlos López", role: "employee" },
  });

  console.log(`✅ Created 3 users (admin, manager, employee)`);

  const products = [
    { name: "Audífonos Bluetooth Pro ANC", sku: "AUD-BT-001", category: "Audio", unit: "unidad", price: 289, stock: 25, minStock: 8, description: "Audífonos con cancelación de ruido, 30h batería" },
    { name: "Earbuds TWS Sport", sku: "AUD-TW-001", category: "Audio", unit: "unidad", price: 149, stock: 40, minStock: 12, description: "Auriculares true wireless IPX5" },
    { name: "Parlante Bluetooth Portátil", sku: "AUD-PB-001", category: "Audio", unit: "unidad", price: 199, stock: 30, minStock: 10, description: "Altavoz 20W IPX7, 12h batería" },
    { name: "Cargador Rápido 65W GaN", sku: "ENE-CG-001", category: "Energía", unit: "unidad", price: 179, stock: 35, minStock: 10, description: "GaN 65W, 2x USB-C + 1x USB-A" },
    { name: "Power Bank 20000mAh", sku: "ENE-PB-001", category: "Energía", unit: "unidad", price: 159, stock: 28, minStock: 8, description: "PD 22.5W, pantalla LED, 3 puertos" },
    { name: "Base Carga Inalámbrica 15W", sku: "ENE-QI-001", category: "Energía", unit: "unidad", price: 89, stock: 45, minStock: 15, description: "Cargador Qi 15W ultra delgado" },
    { name: "Hub USB-C 7 en 1", sku: "ACC-HB-001", category: "Accesorios PC", unit: "unidad", price: 189, stock: 22, minStock: 8, description: "HDMI 4K, 3x USB 3.0, SD, PD 100W" },
    { name: "Teclado Mecánico RGB", sku: "ACC-TM-001", category: "Accesorios PC", unit: "unidad", price: 349, stock: 15, minStock: 5, description: "65%, switches intercambiables, aluminio" },
    { name: "Mouse Ergonómico Vertical", sku: "ACC-ME-001", category: "Accesorios PC", unit: "unidad", price: 129, stock: 3, minStock: 10, description: "2.4GHz + BT, 2400 DPI" },
    { name: "Soporte Laptop Aluminio", sku: "ACC-SL-001", category: "Accesorios PC", unit: "unidad", price: 139, stock: 20, minStock: 6, description: "Ajustable 10-17 pulgadas" },
    { name: "Cable USB-C Trenzado 2m", sku: "CAB-UC-001", category: "Cables", unit: "unidad", price: 45, stock: 80, minStock: 25, description: "100W PD, nailon trenzado" },
    { name: "Cable HDMI 2.1 4K 2m", sku: "CAB-HD-001", category: "Cables", unit: "unidad", price: 69, stock: 50, minStock: 15, description: "4K@120Hz, 8K@60Hz" },
    { name: "Ring Light LED 10\"", sku: "STR-RL-001", category: "Streaming", unit: "unidad", price: 119, stock: 18, minStock: 5, description: "Trípode + soporte celular, 3 modos" },
    { name: "Webcam Full HD 1080p", sku: "STR-WC-001", category: "Streaming", unit: "unidad", price: 199, stock: 2, minStock: 5, description: "Autofoco, mic dual" },
    { name: "Funda Laptop Neopreno 15.6\"", sku: "PRO-FL-001", category: "Protección", unit: "unidad", price: 79, stock: 33, minStock: 10, description: "Resistente al agua, bolsillo exterior" },
    { name: "Mochila Tech Antirrobo", sku: "PRO-MA-001", category: "Protección", unit: "unidad", price: 249, stock: 15, minStock: 5, description: "Puerto USB, cierre oculto, 15.6\"" },
  ];

  const userIds = [admin.id, manager.id, employee.id];

  for (const p of products) {
    const product = await prisma.product.create({ data: p });

    // Create some movements for each product
    await prisma.movement.create({
      data: { type: "entry", quantity: p.stock + 10, reason: "Stock inicial", productId: product.id, userId: userIds[Math.floor(Math.random() * userIds.length)] },
    });
    if (Math.random() > 0.3) {
      await prisma.movement.create({
        data: { type: "exit", quantity: Math.floor(Math.random() * 8) + 1, reason: "Venta", productId: product.id, userId: userIds[Math.floor(Math.random() * userIds.length)] },
      });
    }
    if (Math.random() > 0.5) {
      await prisma.movement.create({
        data: { type: "exit", quantity: Math.floor(Math.random() * 5) + 1, reason: "Transferencia a sucursal", productId: product.id, userId: userIds[Math.floor(Math.random() * userIds.length)] },
      });
    }
  }

  console.log(`✅ Created ${products.length} products with movements`);
  console.log("🎉 Seed completed!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
