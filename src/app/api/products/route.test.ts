jest.mock('@/lib/prisma');
import { prisma } from '@/lib/prisma';
import { GET, POST } from './route';
import { NextRequest } from 'next/server';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

function makeRequest(url: string, init?: RequestInit) {
  return new NextRequest(new URL(url, 'http://localhost:3000'), init);
}

describe('GET /api/products', () => {
  beforeEach(() => jest.clearAllMocks());

  it('devuelve todos los productos', async () => {
    const mockProducts = [
      { id: '1', name: 'Samsung Galaxy S24 Ultra', sku: 'SAM-S24U-256', categoryName: 'Smartphones', stock: 18, lowStockThreshold: 5, price: 8999 },
      { id: '2', name: 'iPhone 15 Pro Max', sku: 'APL-IP15PM-256', categoryName: 'Smartphones', stock: 12, lowStockThreshold: 4, price: 9499 },
    ];
    (mockPrisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

    const res = await GET(makeRequest('/api/products'));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveLength(2);
    expect(data[0].sku).toBe('SAM-S24U-256');
  });

  it('filtra por categoría', async () => {
    const mockProducts = [
      { id: '1', name: 'Samsung Galaxy S24 Ultra', sku: 'SAM-S24U-256', categoryName: 'Smartphones', stock: 18, lowStockThreshold: 5 },
    ];
    (mockPrisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

    const res = await GET(makeRequest('/api/products?category=Smartphones'));
    await res.json();

    expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { active: true, categoryName: 'Smartphones' } })
    );
  });

  it('filtra productos con stock bajo', async () => {
    const mockProducts = [
      { id: '1', name: 'Mouse', sku: 'ACC-ME-001', categoryName: 'Accesorios', stock: 3, lowStockThreshold: 10 },
      { id: '2', name: 'Laptop', sku: 'LEN-X1C-G11', categoryName: 'Laptops', stock: 8, lowStockThreshold: 3 },
    ];
    (mockPrisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

    const res = await GET(makeRequest('/api/products?lowStock=true'));
    const data = await res.json();

    expect(data).toHaveLength(1);
    expect(data[0].sku).toBe('ACC-ME-001');
  });
});

describe('POST /api/products', () => {
  beforeEach(() => jest.clearAllMocks());

  it('crea un producto nuevo', async () => {
    const newProduct = {
      id: 'new-1', name: 'Nuevo Producto', sku: 'NEW-001',
      categoryName: 'Test', price: 100, stock: 10, lowStockThreshold: 5,
    };
    (mockPrisma.product.create as jest.Mock).mockResolvedValue(newProduct);

    const res = await POST(makeRequest('/api/products', {
      method: 'POST',
      body: JSON.stringify({ name: 'Nuevo Producto', sku: 'NEW-001', category: 'Test', price: '100', stock: '10' }),
    }));
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.sku).toBe('NEW-001');
    expect(mockPrisma.product.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ name: 'Nuevo Producto', sku: 'NEW-001', price: 100 }),
      })
    );
  });

  it('usa valores por defecto para campos opcionales', async () => {
    const newProduct = { id: 'new-2', name: 'Min Product', sku: 'MIN-001', categoryName: 'Test', price: 0, stock: 0, lowStockThreshold: 5 };
    (mockPrisma.product.create as jest.Mock).mockResolvedValue(newProduct);

    await POST(makeRequest('/api/products', {
      method: 'POST',
      body: JSON.stringify({ name: 'Min Product', sku: 'MIN-001', category: 'Test' }),
    }));

    expect(mockPrisma.product.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ price: 0, stock: 0, lowStockThreshold: 5 }),
      })
    );
  });
});
