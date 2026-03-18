# Control de Inventario para Tienda y Almacén

Sistema para registrar entradas, salidas y reposición de productos, orientado a reducir quiebres de stock y mejorar compras.

## Tech Stack

- **Frontend:** Next.js 14 (App Router) + Tailwind CSS
- **Backend:** Next.js API Routes
- **Base de datos:** PostgreSQL en Neon (Prisma ORM)
- **Deploy:** Vercel

## Funcionalidades

- CRUD de productos con categorías
- Registro de movimientos de inventario (entradas/salidas)
- Alertas visuales por stock mínimo
- Bitácora de movimientos con filtros
- Dashboard con resumen de estado del inventario
- Reportes por categoría

## Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/Rybak1234/retail-inventory-platform.git
cd retail-inventory-platform
npm install
```

### 2. Configurar base de datos

1. Crea una cuenta gratuita en [neon.tech](https://neon.tech)
2. Crea un nuevo proyecto y copia la connection string
3. Copia `.env.example` a `.env.local` y pega la URI

```bash
cp .env.example .env.local
```

4. Sincroniza el esquema:

```bash
npx prisma db push
```

### 3. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

### 4. Deploy en Vercel

1. Sube el repo a GitHub
2. Importa el proyecto en [vercel.com](https://vercel.com)
3. Agrega `DATABASE_URL` en Vercel Environment Variables
4. Deploy automático

## Estructura del Proyecto

```
src/
├── app/
│   ├── api/
│   │   ├── products/      # CRUD de productos
│   │   └── movements/     # Registro de movimientos
│   ├── products/          # Vista de productos
│   ├── movements/         # Bitácora de movimientos
│   └── page.tsx           # Dashboard principal
├── lib/
│   └── prisma.ts          # Cliente Prisma
prisma/
└── schema.prisma          # Esquema de base de datos
```
