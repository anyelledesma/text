# Plan de Desarrollo: Sistema de Inventario y Facturacion Electronica (e-CF) - Republica Dominicana

## 1. Resumen Ejecutivo

Sistema de gestion de inventario y facturacion electronica integrado con la DGII de Republica Dominicana, cumpliendo con la Ley 32-23 y las Normas Generales 01-2020, 05-2019 y 10-2021. Soporte completo para todos los tipos de Comprobantes Fiscales Electronicos (e-CF) version 1.0.

---

## 2. Stack Tecnologico Recomendado

### Frontend: Vue 3 + Nuxt 3

**Por que Vue/Nuxt y no otro framework:**

| Criterio | Vue 3 / Nuxt 3 | React / Next.js | Angular |
|---|---|---|---|
| Curva de aprendizaje | Baja - ideal para equipos RD | Media | Alta |
| Rendimiento | Excelente (Vapor mode) | Excelente | Bueno |
| Ecosistema UI | PrimeVue, Vuetify, Naive UI | Extenso pero fragmentado | Angular Material |
| SSR/SSG | Nativo con Nuxt 3 | Nativo con Next.js | Angular Universal |
| TypeScript | Soporte nativo | Soporte nativo | Obligatorio |
| Comunidad LATAM | Muy fuerte | Fuerte | Moderada |

**Decision: Vue 3 + Nuxt 3** - Combina facilidad de uso con robustez. La comunidad hispanohablante es muy activa, lo cual facilita soporte y contratacion de talento en RD.

**Librerias frontend clave:**
- **PrimeVue** - Componentes UI enterprise-grade (tablas, formularios, dashboards)
- **Pinia** - State management oficial de Vue
- **VueUse** - Utilidades de composicion
- **Chart.js + vue-chartjs** - Graficos para dashboards
- **jsPDF + html2canvas** - Generacion de PDF del lado del cliente
- **Vee-validate + Zod** - Validacion de formularios con tipado

### Backend: Node.js + NestJS

**Por que NestJS:**
- Arquitectura modular y escalable (patron similar a Angular/Spring)
- TypeScript nativo - comparte tipos con el frontend
- Decoradores para validacion, autenticacion, logging
- Soporte nativo para WebSockets (notificaciones en tiempo real)
- Ecosystem maduro: Bull (colas), Passport (auth), TypeORM/Prisma
- Ya existe una libreria open-source para e-CF en Node.js: [dgii-ecf](https://github.com/victors1681/dgii-ecf)

**Librerias backend clave:**
- **Prisma ORM** - Type-safe database access
- **Bull/BullMQ** - Colas para procesamiento asincrono de e-CF
- **xml2js / fast-xml-parser** - Generacion/parseo de XML para e-CF
- **node-forge / xml-crypto** - Firma digital de e-CF
- **Passport + JWT** - Autenticacion
- **class-validator + class-transformer** - Validacion de DTOs
- **Winston** - Logging estructurado
- **node-cron** - Tareas programadas (sincronizacion DGII)

### Base de Datos: PostgreSQL 16

**Por que PostgreSQL:**
- JSONB nativo para almacenar el XML/metadata de e-CF
- Soporte de particionamiento para tablas de alto volumen (facturas, movimientos)
- Full-text search para busqueda de productos/clientes
- Extensiones: pg_trgm (busqueda fuzzy), uuid-ossp, pgcrypto
- Transacciones ACID completas (critico para inventario y facturacion)
- Gratis y open-source

**Complemento: Redis**
- Cache de sesiones y tokens
- Colas de trabajo (BullMQ)
- Cache de consultas frecuentes (listas de precios, catalogo)
- Rate limiting para API

### Infraestructura

- **Docker + Docker Compose** - Desarrollo local y despliegue
- **Nginx** - Reverse proxy + SSL termination
- **MinIO o S3** - Almacenamiento de archivos XML y PDF (10 anios de retencion)
- **GitHub Actions** - CI/CD

---

## 3. Arquitectura del Sistema

```
                    +------------------+
                    |   Navegador Web  |
                    |  (Vue 3 / Nuxt) |
                    +--------+---------+
                             |
                         HTTPS/WSS
                             |
                    +--------+---------+
                    |      Nginx       |
                    |  (Reverse Proxy) |
                    +--------+---------+
                             |
              +--------------+--------------+
              |                             |
     +--------+--------+          +--------+--------+
     |   NestJS API    |          |   NestJS API    |
     |   (Instancia 1) |          |   (Instancia 2) |
     +-+-----+------+--+          +-----------------+
       |     |      |
       |     |      +----------+
       |     |                 |
  +----+--+ +----+----+  +----+----+
  |Postgres| |  Redis  |  |  MinIO  |
  |  (DB)  | | (Cache) |  | (Files) |
  +--------+ +---------+  +---------+
                                |
                          +-----+-----+
                          | DGII API  |
                          | (e-CF WS) |
                          +-----------+
```

### Patron de Arquitectura: Modular Monolith

No microservicios. Un monolito modular con NestJS es ideal porque:
- Menos complejidad operacional para un equipo pequenio/mediano en RD
- Facil de desplegar y mantener
- Se puede escalar horizontalmente con multiples instancias
- Los modulos se pueden extraer a microservicios en el futuro si es necesario

### Modulos Principales

```
src/
  modules/
    auth/              # Autenticacion y autorizacion
    users/             # Gestion de usuarios y roles
    company/           # Datos de la empresa, sucursales, RNC
    customers/         # Clientes (RNC, razon social, contacto)
    suppliers/         # Proveedores
    products/          # Catalogo de productos/servicios
    inventory/         # Control de inventario y almacenes
    invoicing/         # Facturacion (creacion de facturas)
    ecf/               # Integracion DGII e-CF
    payments/          # Cobros y metodos de pago
    reports/           # Reportes financieros y fiscales
    notifications/     # Notificaciones en tiempo real
    audit/             # Auditoria y log de cambios
```

---

## 4. Esquema de Base de Datos

### 4.1 Modulo: Empresa y Configuracion

```sql
-- Empresa principal y sus configuraciones
CREATE TABLE companies (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rnc             VARCHAR(11) NOT NULL UNIQUE,       -- RNC de la empresa
    business_name   VARCHAR(200) NOT NULL,             -- Razon social
    trade_name      VARCHAR(200),                      -- Nombre comercial
    address         TEXT NOT NULL,
    municipality    VARCHAR(100) NOT NULL,
    province        VARCHAR(100) NOT NULL,
    phone           VARCHAR(20),
    email           VARCHAR(200),
    website         VARCHAR(200),
    logo_url        VARCHAR(500),
    -- Configuracion e-CF
    ecf_environment VARCHAR(20) DEFAULT 'TesteCF',     -- TesteCF | CerteCF | eCF
    digital_cert_path VARCHAR(500),                    -- Ruta al certificado .p12
    digital_cert_password_enc TEXT,                     -- Password encriptado
    ecf_token       TEXT,                              -- Token DGII vigente
    ecf_token_expiry TIMESTAMPTZ,
    -- Configuracion fiscal
    tax_regime      VARCHAR(50),                       -- Regimen tributario
    is_ecf_enabled  BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Sucursales
CREATE TABLE branches (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID NOT NULL REFERENCES companies(id),
    name            VARCHAR(200) NOT NULL,
    code            VARCHAR(20) NOT NULL,
    address         TEXT,
    municipality    VARCHAR(100),
    province        VARCHAR(100),
    phone           VARCHAR(20),
    is_main         BOOLEAN DEFAULT FALSE,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, code)
);

-- Almacenes (warehouses)
CREATE TABLE warehouses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id       UUID NOT NULL REFERENCES branches(id),
    name            VARCHAR(200) NOT NULL,
    code            VARCHAR(20) NOT NULL,
    description     TEXT,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.2 Modulo: Usuarios y Permisos

```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID NOT NULL REFERENCES companies(id),
    email           VARCHAR(200) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    phone           VARCHAR(20),
    role_id         UUID NOT NULL REFERENCES roles(id),
    branch_id       UUID REFERENCES branches(id),       -- Sucursal asignada
    is_active       BOOLEAN DEFAULT TRUE,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE roles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID NOT NULL REFERENCES companies(id),
    name            VARCHAR(100) NOT NULL,               -- admin, cajero, almacenista, contador
    description     TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE permissions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(100) NOT NULL UNIQUE,        -- invoices.create, inventory.adjust, etc.
    module          VARCHAR(50) NOT NULL,
    description     TEXT
);

CREATE TABLE role_permissions (
    role_id         UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id   UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);
```

### 4.3 Modulo: Clientes y Proveedores

```sql
CREATE TABLE customers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID NOT NULL REFERENCES companies(id),
    rnc_cedula      VARCHAR(11),                         -- RNC o Cedula (puede ser null para consumo)
    business_name   VARCHAR(200) NOT NULL,
    trade_name      VARCHAR(200),
    customer_type   VARCHAR(20) NOT NULL,                -- persona_fisica | persona_juridica | consumidor
    address         TEXT,
    municipality    VARCHAR(100),
    province        VARCHAR(100),
    phone           VARCHAR(20),
    email           VARCHAR(200),
    credit_limit    DECIMAL(15,2) DEFAULT 0,
    credit_days     INTEGER DEFAULT 0,
    balance         DECIMAL(15,2) DEFAULT 0,             -- Balance pendiente
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE suppliers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID NOT NULL REFERENCES companies(id),
    rnc             VARCHAR(11) NOT NULL,
    business_name   VARCHAR(200) NOT NULL,
    trade_name      VARCHAR(200),
    contact_name    VARCHAR(200),
    address         TEXT,
    phone           VARCHAR(20),
    email           VARCHAR(200),
    payment_terms   INTEGER DEFAULT 30,                  -- Dias de credito
    balance         DECIMAL(15,2) DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.4 Modulo: Productos e Inventario

```sql
-- Categorias de productos
CREATE TABLE product_categories (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID NOT NULL REFERENCES companies(id),
    parent_id       UUID REFERENCES product_categories(id),
    name            VARCHAR(200) NOT NULL,
    code            VARCHAR(20),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Unidades de medida (alineadas con DGII UnidadMedidaType)
CREATE TABLE units_of_measure (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(10) NOT NULL UNIQUE,          -- Codigo DGII
    name            VARCHAR(100) NOT NULL,
    abbreviation    VARCHAR(10) NOT NULL
);

-- Productos y servicios
CREATE TABLE products (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID NOT NULL REFERENCES companies(id),
    category_id     UUID REFERENCES product_categories(id),
    unit_id         UUID NOT NULL REFERENCES units_of_measure(id),
    sku             VARCHAR(50),
    barcode         VARCHAR(50),
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    product_type    VARCHAR(20) NOT NULL,                 -- product | service
    -- Precios
    cost_price      DECIMAL(15,4) DEFAULT 0,
    sale_price      DECIMAL(15,4) NOT NULL,
    min_sale_price  DECIMAL(15,4),                        -- Precio minimo permitido
    -- Impuestos (ITBIS)
    tax_type        VARCHAR(20) NOT NULL DEFAULT '18',    -- 18 | 16 | 0 | exento
    is_taxable      BOOLEAN DEFAULT TRUE,
    -- Control de inventario
    track_inventory BOOLEAN DEFAULT TRUE,
    min_stock       DECIMAL(15,4) DEFAULT 0,
    max_stock       DECIMAL(15,4),
    -- DGII
    bien_o_servicio VARCHAR(5) DEFAULT '1',               -- IndicadorBienoServicioType DGII
    is_active       BOOLEAN DEFAULT TRUE,
    image_url       VARCHAR(500),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, sku)
);

-- Stock por almacen
CREATE TABLE inventory_stock (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id      UUID NOT NULL REFERENCES products(id),
    warehouse_id    UUID NOT NULL REFERENCES warehouses(id),
    quantity        DECIMAL(15,4) NOT NULL DEFAULT 0,
    reserved_qty    DECIMAL(15,4) NOT NULL DEFAULT 0,     -- Reservado por ordenes pendientes
    avg_cost        DECIMAL(15,4) DEFAULT 0,              -- Costo promedio ponderado
    last_count_date TIMESTAMPTZ,
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, warehouse_id)
);

-- Movimientos de inventario
CREATE TABLE inventory_movements (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID NOT NULL REFERENCES companies(id),
    product_id      UUID NOT NULL REFERENCES products(id),
    warehouse_id    UUID NOT NULL REFERENCES warehouses(id),
    movement_type   VARCHAR(30) NOT NULL,
    -- Tipos: purchase_in, sale_out, adjustment_in, adjustment_out,
    --        transfer_in, transfer_out, return_in, return_out, initial
    quantity        DECIMAL(15,4) NOT NULL,
    unit_cost       DECIMAL(15,4),
    reference_type  VARCHAR(50),                          -- invoice, purchase_order, adjustment, transfer
    reference_id    UUID,
    notes           TEXT,
    created_by      UUID NOT NULL REFERENCES users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Listas de precios
CREATE TABLE price_lists (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID NOT NULL REFERENCES companies(id),
    name            VARCHAR(100) NOT NULL,
    is_default      BOOLEAN DEFAULT FALSE,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE price_list_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    price_list_id   UUID NOT NULL REFERENCES price_lists(id) ON DELETE CASCADE,
    product_id      UUID NOT NULL REFERENCES products(id),
    price           DECIMAL(15,4) NOT NULL,
    UNIQUE(price_list_id, product_id)
);
```

### 4.5 Modulo: Facturacion e-CF

```sql
-- Secuencias de e-NCF autorizadas por la DGII
CREATE TABLE ecf_sequences (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID NOT NULL REFERENCES companies(id),
    branch_id       UUID REFERENCES branches(id),
    ecf_type        VARCHAR(5) NOT NULL,
    -- Tipos: E31 (Credito Fiscal), E32 (Consumo), E33 (Nota Debito),
    --        E34 (Nota Credito), E41 (Compras), E43 (Gastos Menores),
    --        E44 (Pagos Exterior), E45 (Regimen Especial)
    prefix          VARCHAR(3) NOT NULL,                  -- Ej: E31
    range_from      BIGINT NOT NULL,                      -- Inicio del rango autorizado
    range_to        BIGINT NOT NULL,                      -- Fin del rango autorizado
    current_number  BIGINT NOT NULL,                      -- Siguiente numero a usar
    expiry_date     DATE,
    is_active       BOOLEAN DEFAULT TRUE,
    alert_threshold INTEGER DEFAULT 100,                  -- Alertar cuando queden X numeros
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Facturas / Comprobantes
CREATE TABLE invoices (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID NOT NULL REFERENCES companies(id),
    branch_id       UUID NOT NULL REFERENCES branches(id),
    customer_id     UUID REFERENCES customers(id),
    -- Numeracion
    invoice_number  VARCHAR(30) NOT NULL,                 -- Numero interno
    encf            VARCHAR(13),                          -- e-NCF (Ej: E310000000001)
    encf_seq_id     UUID REFERENCES ecf_sequences(id),
    -- Tipo de comprobante
    ecf_type        VARCHAR(5) NOT NULL,                  -- E31, E32, E33, E34
    -- Fechas
    issue_date      DATE NOT NULL,
    due_date        DATE,
    -- Moneda
    currency_code   VARCHAR(3) DEFAULT 'DOP',             -- DOP, USD
    exchange_rate   DECIMAL(15,6) DEFAULT 1,
    -- Totales
    subtotal        DECIMAL(15,2) NOT NULL DEFAULT 0,
    discount_total  DECIMAL(15,2) NOT NULL DEFAULT 0,
    taxable_base_18 DECIMAL(15,2) DEFAULT 0,              -- Base imponible ITBIS 18%
    taxable_base_16 DECIMAL(15,2) DEFAULT 0,              -- Base imponible ITBIS 16%
    taxable_base_0  DECIMAL(15,2) DEFAULT 0,              -- Base imponible ITBIS 0%
    exempt_total    DECIMAL(15,2) DEFAULT 0,              -- Total exento
    itbis_18        DECIMAL(15,2) DEFAULT 0,              -- ITBIS 18%
    itbis_16        DECIMAL(15,2) DEFAULT 0,              -- ITBIS 16%
    total_itbis     DECIMAL(15,2) DEFAULT 0,              -- Total ITBIS
    tip_amount      DECIMAL(15,2) DEFAULT 0,              -- Propina (10% legal)
    total           DECIMAL(15,2) NOT NULL DEFAULT 0,
    amount_paid     DECIMAL(15,2) DEFAULT 0,
    balance_due     DECIMAL(15,2) DEFAULT 0,
    -- Estado
    status          VARCHAR(20) NOT NULL DEFAULT 'draft',
    -- draft | issued | sent_to_dgii | accepted | rejected | cancelled | paid | partial_paid
    -- Datos DGII
    dgii_track_id   VARCHAR(100),                         -- TrackID devuelto por DGII
    dgii_status     VARCHAR(20),                          -- Aceptado | Rechazado | En proceso
    dgii_message    TEXT,                                  -- Mensaje de respuesta DGII
    dgii_sent_at    TIMESTAMPTZ,
    dgii_response_at TIMESTAMPTZ,
    -- Referencia (para notas de credito/debito)
    ref_invoice_id  UUID REFERENCES invoices(id),
    ref_encf        VARCHAR(13),
    ref_date        DATE,
    modification_code VARCHAR(5),                         -- CodigoModificacionType DGII
    -- XML
    xml_content     TEXT,                                  -- XML firmado enviado a DGII
    xml_response    TEXT,                                  -- XML de respuesta DGII
    -- Metadata
    notes           TEXT,
    internal_notes  TEXT,
    payment_form    VARCHAR(10) DEFAULT '1',              -- FormaPagoType DGII (1=Efectivo, 2=Cheque, etc)
    created_by      UUID NOT NULL REFERENCES users(id),
    updated_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, encf)
);

-- Detalle de facturas
CREATE TABLE invoice_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id      UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    product_id      UUID REFERENCES products(id),
    line_number     INTEGER NOT NULL,
    -- Descripcion
    description     VARCHAR(500) NOT NULL,
    quantity        DECIMAL(15,4) NOT NULL,
    unit_id         UUID REFERENCES units_of_measure(id),
    unit_price      DECIMAL(15,4) NOT NULL,
    -- Descuento
    discount_pct    DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    -- Impuestos
    is_taxable      BOOLEAN DEFAULT TRUE,
    tax_rate        DECIMAL(5,2) DEFAULT 18,              -- 18, 16, 0
    tax_amount      DECIMAL(15,2) DEFAULT 0,
    -- Totales
    subtotal        DECIMAL(15,2) NOT NULL,               -- qty * unit_price - discount
    total           DECIMAL(15,2) NOT NULL,               -- subtotal + tax
    -- DGII
    bien_o_servicio VARCHAR(5) DEFAULT '1',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Pagos recibidos
CREATE TABLE payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID NOT NULL REFERENCES companies(id),
    customer_id     UUID REFERENCES customers(id),
    invoice_id      UUID REFERENCES invoices(id),
    payment_date    DATE NOT NULL,
    amount          DECIMAL(15,2) NOT NULL,
    payment_method  VARCHAR(30) NOT NULL,                 -- cash, check, transfer, card, credit
    reference       VARCHAR(100),                         -- Numero de cheque, ref transferencia
    bank_account    VARCHAR(50),
    notes           TEXT,
    status          VARCHAR(20) DEFAULT 'applied',        -- applied | voided
    created_by      UUID NOT NULL REFERENCES users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Registro de envios a DGII (log detallado)
CREATE TABLE ecf_transmission_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id      UUID NOT NULL REFERENCES invoices(id),
    encf            VARCHAR(13) NOT NULL,
    action          VARCHAR(30) NOT NULL,                 -- send | query_status | cancel
    request_xml     TEXT,
    response_xml    TEXT,
    http_status     INTEGER,
    track_id        VARCHAR(100),
    dgii_status     VARCHAR(30),
    error_message   TEXT,
    attempt_number  INTEGER DEFAULT 1,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.6 Modulo: Compras

```sql
CREATE TABLE purchase_orders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID NOT NULL REFERENCES companies(id),
    supplier_id     UUID NOT NULL REFERENCES suppliers(id),
    warehouse_id    UUID NOT NULL REFERENCES warehouses(id),
    order_number    VARCHAR(30) NOT NULL,
    order_date      DATE NOT NULL,
    expected_date   DATE,
    currency_code   VARCHAR(3) DEFAULT 'DOP',
    exchange_rate   DECIMAL(15,6) DEFAULT 1,
    subtotal        DECIMAL(15,2) DEFAULT 0,
    tax_total       DECIMAL(15,2) DEFAULT 0,
    total           DECIMAL(15,2) DEFAULT 0,
    status          VARCHAR(20) DEFAULT 'draft',          -- draft | approved | received | partial | cancelled
    ncf_supplier    VARCHAR(19),                          -- NCF del proveedor
    notes           TEXT,
    created_by      UUID NOT NULL REFERENCES users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE purchase_order_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id      UUID NOT NULL REFERENCES products(id),
    quantity        DECIMAL(15,4) NOT NULL,
    received_qty    DECIMAL(15,4) DEFAULT 0,
    unit_cost       DECIMAL(15,4) NOT NULL,
    tax_rate        DECIMAL(5,2) DEFAULT 18,
    tax_amount      DECIMAL(15,2) DEFAULT 0,
    subtotal        DECIMAL(15,2) NOT NULL,
    total           DECIMAL(15,2) NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.7 Modulo: Auditoria

```sql
CREATE TABLE audit_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID NOT NULL,
    user_id         UUID NOT NULL,
    entity_type     VARCHAR(50) NOT NULL,                 -- invoice, product, customer, etc.
    entity_id       UUID NOT NULL,
    action          VARCHAR(20) NOT NULL,                 -- create, update, delete
    old_values      JSONB,
    new_values      JSONB,
    ip_address      INET,
    user_agent      TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Particionamiento por fecha para rendimiento
-- ALTER TABLE audit_log PARTITION BY RANGE (created_at);
```

### Diagrama de Relaciones (ER simplificado)

```
companies 1──N branches 1──N warehouses
    |                |
    N                N
    |                |
  users          invoices 1──N invoice_items
    |                |              |
    |                N              |
    |            payments       products 1──N inventory_stock
    |                           |
    |                       product_categories
    |
  customers ────── invoices
  suppliers ────── purchase_orders 1──N purchase_order_items
```

---

## 5. Flujo de Facturacion Electronica (e-CF)

### 5.1 Proceso paso a paso

```
[Usuario crea factura]
        |
        v
[Sistema valida datos]
  - RNC cliente valido
  - Productos con precios correctos
  - Calculos de ITBIS correctos
  - Secuencia e-NCF disponible
        |
        v
[Asigna e-NCF de la secuencia]
        |
        v
[Genera XML segun XSD v1.0 de DGII]
  - Encabezado (datos emisor, receptor)
  - Detalle de items
  - Totales e impuestos
  - Informacion adicional
        |
        v
[Firma digital del XML]
  - Certificado .p12 de INDOTEL
  - Algoritmo de firma segun DGII
        |
        v
[Envia XML a Web Service DGII]
  1. POST /fe/autenticacion/api/validacioncertificado  (obtener seed)
  2. POST /fe/autenticacion/api/validacioncertificado  (obtener token con seed firmado)
  3. POST /fe/recepcion/api/ecf                        (enviar e-CF)
        |
        v
[Recibe TrackID de DGII]
        |
        v
[Consulta estado periodicamente]
  GET /fe/recepcion/api/consultaresultado/{trackId}
        |
        v
[Estado final: Aceptado | Rechazado]
  - Si aceptado: factura queda registrada
  - Si rechazado: notificar usuario con mensaje de error DGII
```

### 5.2 Tipos de e-CF a implementar

| Codigo | Tipo | Uso |
|--------|------|-----|
| E31 | Factura de Credito Fiscal | Ventas a contribuyentes (con RNC) |
| E32 | Factura de Consumo | Ventas a consumidores finales |
| E33 | Nota de Debito | Ajustes a favor del emisor |
| E34 | Nota de Credito | Devoluciones, descuentos posteriores |
| E41 | Comprobante de Compras | Compras a proveedores informales |
| E43 | Gastos Menores | Gastos menores del negocio |
| E44 | Pagos al Exterior | Pagos a entidades extranjeras |
| E45 | Regimen Especial | Zonas francas, regimenes especiales |

### 5.3 Contingencia

Cuando la DGII no este disponible:
1. Almacenar el e-CF localmente con estado `pending_dgii`
2. Cola BullMQ con reintentos automaticos (exponential backoff)
3. Cuando DGII responda, actualizar estado y notificar
4. Log completo de todos los intentos en `ecf_transmission_log`

---

## 6. Modulos Funcionales del Sistema

### 6.1 Dashboard
- Resumen de ventas del dia/semana/mes
- Facturas pendientes de cobro
- Estado de envios a DGII (aceptados/rechazados/pendientes)
- Alertas: stock bajo, secuencias e-NCF por agotarse, facturas vencidas
- Graficos de ventas, productos mas vendidos, clientes principales

### 6.2 Gestion de Inventario
- Catalogo de productos con busqueda avanzada (barcode, SKU, nombre)
- Multiples almacenes por sucursal
- Entradas y salidas de inventario
- Transferencias entre almacenes
- Ajustes de inventario (merma, conteo fisico)
- Alertas de stock minimo/maximo
- Costo promedio ponderado automatico
- Historial completo de movimientos
- Listas de precios multiples

### 6.3 Facturacion
- Creacion rapida de facturas (POS-style)
- Busqueda de productos por codigo de barras o nombre
- Calculo automatico de ITBIS (18%, 16%, exento)
- Soporte multi-moneda (DOP, USD) con tasa de cambio
- Aplicacion de descuentos por linea o global
- Notas de credito y debito vinculadas
- Impresion de factura (formato 80mm termica y carta)
- Envio de factura por correo electronico
- Facturacion recurrente

### 6.4 Cuentas por Cobrar
- Balance por cliente
- Envejecimiento de cuentas (30, 60, 90, 120+ dias)
- Registro de pagos (efectivo, cheque, transferencia, tarjeta)
- Estados de cuenta del cliente
- Recordatorios automaticos de pago

### 6.5 Compras
- Ordenes de compra
- Recepcion de mercancia (parcial y total)
- Actualizacion automatica de inventario al recibir

### 6.6 Reportes
- Ventas por periodo, cliente, producto, vendedor
- Compras por periodo, proveedor
- Inventario valorizado
- Kardex de movimientos
- Reporte 606 (Compras y gastos) - formato DGII
- Reporte 607 (Ventas) - formato DGII
- Reporte 608 (Anulaciones) - formato DGII
- Reporte IT-1 (ITBIS)
- Estado de resultados basico

### 6.7 Administracion
- Gestion de usuarios y roles con permisos granulares
- Configuracion de empresa y sucursales
- Gestion de secuencias e-NCF
- Configuracion de certificado digital
- Backup de datos

---

## 7. Plan de Fases de Desarrollo

### Fase 1: Fundacion (Semanas 1-4)
- [ ] Configurar proyecto: Nuxt 3 + NestJS + PostgreSQL + Docker
- [ ] Implementar autenticacion (JWT + refresh tokens)
- [ ] CRUD de empresa, sucursales, almacenes
- [ ] CRUD de usuarios y sistema de roles/permisos
- [ ] Layout base del dashboard (sidebar, header, breadcrumbs)
- [ ] Configurar Prisma con migraciones

### Fase 2: Inventario (Semanas 5-8)
- [ ] CRUD de categorias de productos
- [ ] CRUD de productos con busqueda avanzada
- [ ] Gestion de stock por almacen
- [ ] Movimientos de inventario (entradas, salidas, ajustes)
- [ ] Transferencias entre almacenes
- [ ] Alertas de stock minimo
- [ ] Listas de precios

### Fase 3: Facturacion Base (Semanas 9-12)
- [ ] CRUD de clientes
- [ ] CRUD de proveedores
- [ ] Creacion de facturas (E31, E32)
- [ ] Calculo automatico de impuestos (ITBIS)
- [ ] Notas de credito (E34) y debito (E33)
- [ ] Registro de pagos
- [ ] Impresion de facturas (PDF)

### Fase 4: Integracion DGII e-CF (Semanas 13-16)
- [ ] Generacion de XML segun XSD v1.0
- [ ] Firma digital de e-CF
- [ ] Integracion con Web Services DGII (autenticacion, envio, consulta)
- [ ] Gestion de secuencias e-NCF
- [ ] Sistema de contingencia y reintentos
- [ ] Log de transmisiones
- [ ] Proceso de certificacion con DGII (ambiente TesteCF)

### Fase 5: Compras y Reportes (Semanas 17-20)
- [ ] Ordenes de compra
- [ ] Recepcion de mercancia
- [ ] Reportes fiscales (606, 607, 608, IT-1)
- [ ] Dashboard con graficos de ventas
- [ ] Reportes de inventario (kardex, valorizado)
- [ ] Cuentas por cobrar (envejecimiento, estados de cuenta)

### Fase 6: Pulido y Produccion (Semanas 21-24)
- [ ] Pruebas end-to-end
- [ ] Optimizacion de rendimiento
- [ ] Proceso de certificacion DGII (ambiente CerteCF)
- [ ] Documentacion de usuario
- [ ] Despliegue en produccion
- [ ] Capacitacion de usuarios

---

## 8. Estructura de Carpetas del Proyecto

```
dr-invoicing/
  docker-compose.yml
  .env.example

  frontend/                         # Nuxt 3
    nuxt.config.ts
    app.vue
    pages/
      index.vue                     # Dashboard
      login.vue
      invoices/
        index.vue                   # Lista de facturas
        [id].vue                    # Detalle de factura
        new.vue                     # Crear factura
      inventory/
        products/
          index.vue
          [id].vue
          new.vue
        movements/
          index.vue
        stock/
          index.vue
      customers/
        index.vue
        [id].vue
      suppliers/
        index.vue
      purchases/
        index.vue
        [id].vue
      reports/
        sales.vue
        purchases.vue
        inventory.vue
        fiscal/
          606.vue
          607.vue
          608.vue
      settings/
        company.vue
        users.vue
        roles.vue
        ecf.vue                     # Configuracion e-CF
        sequences.vue               # Secuencias e-NCF
    components/
      layout/
        Sidebar.vue
        Header.vue
      invoicing/
        InvoiceForm.vue
        InvoiceItemRow.vue
        InvoicePrint.vue
        PaymentModal.vue
      inventory/
        ProductForm.vue
        StockTable.vue
        MovementForm.vue
      shared/
        DataTable.vue
        SearchInput.vue
        StatusBadge.vue
        ConfirmDialog.vue
    composables/
      useAuth.ts
      useInvoice.ts
      useInventory.ts
      useEcf.ts
    stores/                         # Pinia stores
      auth.ts
      invoice.ts
      inventory.ts
      notification.ts

  backend/                          # NestJS
    src/
      main.ts
      app.module.ts
      common/
        decorators/
        filters/
        guards/
        interceptors/
        pipes/
      modules/
        auth/
          auth.module.ts
          auth.controller.ts
          auth.service.ts
          strategies/
            jwt.strategy.ts
        users/
          users.module.ts
          users.controller.ts
          users.service.ts
          dto/
          entities/
        company/
        customers/
        suppliers/
        products/
        inventory/
        invoicing/
          invoicing.module.ts
          invoicing.controller.ts
          invoicing.service.ts
          dto/
            create-invoice.dto.ts
        ecf/
          ecf.module.ts
          ecf.service.ts
          ecf-xml.builder.ts        # Generador de XML e-CF
          ecf-signer.service.ts     # Firma digital
          ecf-dgii.client.ts       # Cliente HTTP para DGII WS
          ecf-queue.processor.ts   # Procesador de cola
          dto/
          templates/                # Plantillas XML base
        payments/
        reports/
          reports.module.ts
          reports.service.ts
          generators/
            report-606.generator.ts
            report-607.generator.ts
            report-608.generator.ts
        audit/
        notifications/
      prisma/
        schema.prisma
        migrations/
        seed.ts
```

---

## 9. Consideraciones de Seguridad

1. **Certificado digital (.p12):** Almacenar encriptado en el servidor, nunca en el repositorio
2. **Variables de entorno:** Usar `.env` con secretos (DB password, JWT secret, cert password)
3. **HTTPS obligatorio** en produccion
4. **Rate limiting** en API endpoints
5. **Sanitizacion de inputs** contra SQL injection y XSS
6. **Auditoria completa** de todas las operaciones criticas
7. **Backups automaticos** de base de datos (diarios)
8. **Retencion de documentos:** 10 anios como exige la ley
9. **RBAC (Role-Based Access Control)** para control de acceso granular
10. **Tokens JWT** con expiracion corta + refresh tokens

---

## 10. Consideraciones Tecnicas Adicionales

### Performance
- Indices en PostgreSQL para campos de busqueda frecuente (RNC, e-NCF, fecha, status)
- Paginacion server-side para listados grandes
- Cache Redis para catalogo de productos y listas de precios
- Lazy loading de componentes Vue en el frontend

### Disponibilidad
- Health checks en Docker
- Logs centralizados con Winston
- Monitoreo basico con uptime checks

### Cumplimiento DGII
- Validar estructura XML contra XSD antes de enviar
- Mantener XSD actualizados (DGII los actualiza periodicamente)
- Soportar los 3 ambientes: TesteCF (pruebas), CerteCF (certificacion), eCF (produccion)
- Implementar consulta de directorio de facturadores
- Implementar recepcion de aprobacion comercial (comprador acepta/rechaza e-CF)

---

## Fuentes y Referencias

- [DGII - Documentacion sobre e-CF](https://dgii.gov.do/cicloContribuyente/facturacion/comprobantesFiscalesElectronicosE-CF/Paginas/documentacionSobreE-CF.aspx)
- [Formato e-CF XML v1.0 (PDF)](https://dgii.gov.do/cicloContribuyente/facturacion/comprobantesFiscalesElectronicosE-CF/Documentacin%20sobre%20eCF/Formatos%20XML/Formato%20Comprobante%20Fiscal%20Electr%C3%B3nico%20(e-CF)%20v1.0.pdf)
- [Informe Tecnico e-CF v1.0](https://dgii.gov.do/cicloContribuyente/facturacion/comprobantesFiscalesElectronicosE-CF/Documentacin%20sobre%20eCF/Informe%20y%20Descripci%C3%B3n%20T%C3%A9cnica/Informe%20T%C3%A9cnico%20e-CF%20v1.0.pdf)
- [Libreria Node.js dgii-ecf](https://github.com/victors1681/dgii-ecf)
- [Softland - Facturacion Electronica RD 2025-2026](https://softland.com/do/facturacion-electronica-en-republica-dominicana/)
- [Gosocket - Actualizacion XSD e-CF v1.0](https://www.gosocket.net/centro-de-recursos/la-dgii-actualiza-10-esquemas-de-xsd-e-cf-v-1-0-febrero-2025/)
- [Ley 32-23 y e-CF](https://blog.alanube.co/rd/e-cf-en-republica-dominicana/)
- [EDICOM - Electronic Invoicing DR](https://edicomgroup.com/electronic-invoicing/dominican-republic)
