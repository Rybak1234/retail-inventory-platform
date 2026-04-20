jest.mock('@/lib/prisma');
import { prisma } from '@/lib/prisma';
import { GET, POST } from './route';
import { NextRequest } from 'next/server';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

function makeRequest(url: string, init?: RequestInit) {
  return new NextRequest(new URL(url, 'http://localhost:3000'), init);
}

describe('GET /api/movements', () => {
  beforeEach(() => jest.clearAllMocks());

  it('devuelve los movimientos más recientes', async () => {
    const mockMovements = [
      { id: 'm1', type: 'entry', quantity: 20, reason: 'Stock inicial', product: { name: 'Galaxy S24', sku: 'SAM-S24U-256' } },
      { id: 'm2', type: 'exit', quantity: 3, reason: 'Venta online', product: { name: 'Galaxy S24', sku: 'SAM-S24U-256' } },
    ];
    (mockPrisma.movement.findMany as jest.Mock).mockResolvedValue(mockMovements);

    const res = await GET(makeRequest('/api/movements'));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveLength(2);
    expect(mockPrisma.movement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 100, orderBy: { createdAt: 'desc' } })
    );
  });

  it('filtra por tipo de movimiento', async () => {
    (mockPrisma.movement.findMany as jest.Mock).mockResolvedValue([]);

    await GET(makeRequest('/api/movements?type=entry'));

    expect(mockPrisma.movement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ type: 'entry' }) })
    );
  });

  it('filtra por producto', async () => {
    (mockPrisma.movement.findMany as jest.Mock).mockResolvedValue([]);

    await GET(makeRequest('/api/movements?productId=prod-123'));

    expect(mockPrisma.movement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ productId: 'prod-123' }) })
    );
  });
});

describe('POST /api/movements', () => {
  beforeEach(() => jest.clearAllMocks());

  it('crea un movimiento de entrada y actualiza stock', async () => {
    const product = { id: 'p1', name: 'Test', stock: 10 };
    const movement = { id: 'm1', type: 'entry', quantity: 5, reason: 'Reposición' };

    (mockPrisma.product.findUnique as jest.Mock).mockResolvedValue(product);
    (mockPrisma.$transaction as jest.Mock).mockResolvedValue([movement, {}]);

    const res = await POST(makeRequest('/api/movements', {
      method: 'POST',
      body: JSON.stringify({ type: 'entry', quantity: '5', reason: 'Reposición', productId: 'p1' }),
    }));
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.type).toBe('entry');
  });

  it('rechaza cantidad no positiva', async () => {
    const res = await POST(makeRequest('/api/movements', {
      method: 'POST',
      body: JSON.stringify({ type: 'entry', quantity: '0', productId: 'p1' }),
    }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain('positive');
  });

  it('rechaza cantidad negativa', async () => {
    const res = await POST(makeRequest('/api/movements', {
      method: 'POST',
      body: JSON.stringify({ type: 'entry', quantity: '-5', productId: 'p1' }),
    }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain('positive');
  });

  it('devuelve 404 si producto no existe', async () => {
    (mockPrisma.product.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await POST(makeRequest('/api/movements', {
      method: 'POST',
      body: JSON.stringify({ type: 'exit', quantity: '5', productId: 'no-existe' }),
    }));
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toContain('not found');
  });

  it('rechaza salida si stock insuficiente', async () => {
    (mockPrisma.product.findUnique as jest.Mock).mockResolvedValue({ id: 'p1', stock: 3 });

    const res = await POST(makeRequest('/api/movements', {
      method: 'POST',
      body: JSON.stringify({ type: 'exit', quantity: '10', productId: 'p1' }),
    }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain('Insufficient');
  });

  it('permite salida con stock suficiente', async () => {
    const product = { id: 'p1', stock: 20 };
    const movement = { id: 'm1', type: 'exit', quantity: 5, reason: 'Venta' };

    (mockPrisma.product.findUnique as jest.Mock).mockResolvedValue(product);
    (mockPrisma.$transaction as jest.Mock).mockResolvedValue([movement, {}]);

    const res = await POST(makeRequest('/api/movements', {
      method: 'POST',
      body: JSON.stringify({ type: 'exit', quantity: '5', reason: 'Venta', productId: 'p1' }),
    }));

    expect(res.status).toBe(201);
    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });
});
