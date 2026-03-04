# DR Invoicing - Sistema de Inventario y Facturacion Electronica

Sistema de gestion de inventario y facturacion electronica integrado con la DGII de Republica Dominicana (e-CF v1.0).

## Stack Tecnologico

- **Frontend:** Vue 3 + Nuxt 3 + PrimeVue 4 + Pinia
- **Backend:** Node.js + NestJS + Prisma ORM
- **Base de Datos:** PostgreSQL 16
- **Cache:** Redis 7
- **Contenedores:** Docker + Docker Compose

## Requisitos

- Node.js v20+
- pnpm v9+ (o npm/yarn)
- Docker y Docker Compose

## Inicio Rapido

### 1. Clonar y configurar variables de entorno

```bash
cp .env.example .env
# Editar .env con tus valores (los defaults funcionan para desarrollo)
```

### 2. Levantar servicios con Docker

```bash
docker compose up -d
```

Esto inicia PostgreSQL (puerto 5432) y Redis (puerto 6379).

### 3. Instalar dependencias

```bash
# Backend
cd backend
pnpm install

# Frontend
cd ../frontend
pnpm install
```

### 4. Configurar base de datos

```bash
cd backend

# Generar cliente Prisma
pnpm db:generate

# Ejecutar migraciones
pnpm db:migrate

# Cargar datos iniciales
pnpm db:seed
```

### 5. Iniciar servidores de desarrollo

En dos terminales separadas:

```bash
# Terminal 1 - Backend (http://localhost:3001)
cd backend
pnpm dev

# Terminal 2 - Frontend (http://localhost:3000)
cd frontend
pnpm dev
```

### 6. Acceder al sistema

- **Frontend:** http://localhost:3000
- **API:** http://localhost:3001/api
- **Swagger Docs:** http://localhost:3001/api/docs
- **Prisma Studio:** `cd backend && pnpm db:studio`

### Credenciales por defecto

```
Email: admin@miempresa.com.do
Password: admin123
```

## Estructura del Proyecto

```
dr-invoicing/
  docker-compose.yml        # PostgreSQL + Redis
  .env.example               # Variables de entorno
  backend/                   # NestJS API
    src/
      modules/
        auth/                # JWT authentication
        users/               # Gestion de usuarios
        company/             # Empresa y sucursales
        customers/           # Clientes
        suppliers/           # Proveedores
        products/            # Catalogo de productos
        inventory/           # Control de inventario
        invoicing/           # Facturacion
        ecf/                 # Integracion DGII e-CF
        payments/            # Cobros
        reports/             # Reportes (606, 607, 608)
    prisma/
      schema.prisma          # Esquema de base de datos
      seed.ts                # Datos iniciales
  frontend/                  # Nuxt 3
    pages/                   # Rutas/paginas
    components/              # Componentes Vue
    composables/             # Logica reutilizable
    stores/                  # Pinia stores
```

## Tipos de Comprobantes e-CF Soportados

| Codigo | Tipo |
|--------|------|
| E31 | Factura de Credito Fiscal |
| E32 | Factura de Consumo |
| E33 | Nota de Debito |
| E34 | Nota de Credito |
| E41 | Comprobante de Compras |
| E43 | Gastos Menores |
| E44 | Pagos al Exterior |
| E45 | Regimen Especial |

## Reportes Fiscales DGII

- **606:** Reporte de Compras y Gastos
- **607:** Reporte de Ventas
- **608:** Reporte de Comprobantes Anulados
- **IT-1:** Declaracion ITBIS

## Licencia

Privado - Todos los derechos reservados.
