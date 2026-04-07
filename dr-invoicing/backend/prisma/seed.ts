import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de base de datos...');

  // ============================================
  // Unidades de Medida (DGII UnidadMedidaType)
  // ============================================
  console.log('📏 Creando unidades de medida DGII...');
  const units = [
    { code: '1', name: 'Unidad', abbreviation: 'Ud' },
    { code: '2', name: 'Metro', abbreviation: 'm' },
    { code: '3', name: 'Kilogramo', abbreviation: 'kg' },
    { code: '4', name: 'Litro', abbreviation: 'L' },
    { code: '5', name: 'Libra', abbreviation: 'lb' },
    { code: '6', name: 'Onza', abbreviation: 'oz' },
    { code: '7', name: 'Galon', abbreviation: 'gal' },
    { code: '8', name: 'Pie', abbreviation: 'ft' },
    { code: '9', name: 'Pulgada', abbreviation: 'in' },
    { code: '10', name: 'Yarda', abbreviation: 'yd' },
    { code: '11', name: 'Metro Cuadrado', abbreviation: 'm2' },
    { code: '12', name: 'Metro Cubico', abbreviation: 'm3' },
    { code: '13', name: 'Docena', abbreviation: 'doc' },
    { code: '14', name: 'Caja', abbreviation: 'cja' },
    { code: '15', name: 'Paquete', abbreviation: 'paq' },
    { code: '16', name: 'Pieza', abbreviation: 'pza' },
    { code: '17', name: 'Par', abbreviation: 'par' },
    { code: '18', name: 'Servicio', abbreviation: 'srv' },
    { code: '19', name: 'Hora', abbreviation: 'hr' },
    { code: '20', name: 'Dia', abbreviation: 'dia' },
    { code: '21', name: 'Mililitro', abbreviation: 'mL' },
    { code: '22', name: 'Gramo', abbreviation: 'g' },
    { code: '23', name: 'Quintal', abbreviation: 'qq' },
    { code: '24', name: 'Tonelada', abbreviation: 'ton' },
    { code: '25', name: 'Barril', abbreviation: 'brl' },
    { code: '26', name: 'Rollo', abbreviation: 'rll' },
    { code: '27', name: 'Resma', abbreviation: 'rsm' },
    { code: '28', name: 'Bulto', abbreviation: 'blt' },
    { code: '29', name: 'Fardo', abbreviation: 'frd' },
    { code: '30', name: 'Millar', abbreviation: 'mll' },
    { code: '31', name: 'Otro', abbreviation: 'otro' },
  ];

  for (const unit of units) {
    await prisma.unitOfMeasure.upsert({
      where: { code: unit.code },
      update: {},
      create: unit,
    });
  }

  // ============================================
  // Permisos del Sistema
  // ============================================
  console.log('🔑 Creando permisos...');
  const permissionDefs = [
    // Dashboard
    { code: 'dashboard.view', module: 'dashboard', description: 'Ver dashboard' },
    // Facturacion
    { code: 'invoices.view', module: 'invoicing', description: 'Ver facturas' },
    { code: 'invoices.create', module: 'invoicing', description: 'Crear facturas' },
    { code: 'invoices.edit', module: 'invoicing', description: 'Editar facturas' },
    { code: 'invoices.cancel', module: 'invoicing', description: 'Anular facturas' },
    { code: 'invoices.send_dgii', module: 'invoicing', description: 'Enviar facturas a DGII' },
    { code: 'invoices.print', module: 'invoicing', description: 'Imprimir facturas' },
    // Productos
    { code: 'products.view', module: 'products', description: 'Ver productos' },
    { code: 'products.create', module: 'products', description: 'Crear productos' },
    { code: 'products.edit', module: 'products', description: 'Editar productos' },
    { code: 'products.delete', module: 'products', description: 'Eliminar productos' },
    { code: 'products.view_cost', module: 'products', description: 'Ver costos de productos' },
    // Inventario
    { code: 'inventory.view', module: 'inventory', description: 'Ver inventario' },
    { code: 'inventory.adjust', module: 'inventory', description: 'Ajustar inventario' },
    { code: 'inventory.transfer', module: 'inventory', description: 'Transferir entre almacenes' },
    { code: 'inventory.movements', module: 'inventory', description: 'Ver movimientos' },
    // Clientes
    { code: 'customers.view', module: 'customers', description: 'Ver clientes' },
    { code: 'customers.create', module: 'customers', description: 'Crear clientes' },
    { code: 'customers.edit', module: 'customers', description: 'Editar clientes' },
    { code: 'customers.delete', module: 'customers', description: 'Eliminar clientes' },
    // Proveedores
    { code: 'suppliers.view', module: 'suppliers', description: 'Ver proveedores' },
    { code: 'suppliers.create', module: 'suppliers', description: 'Crear proveedores' },
    { code: 'suppliers.edit', module: 'suppliers', description: 'Editar proveedores' },
    // Compras
    { code: 'purchases.view', module: 'purchases', description: 'Ver ordenes de compra' },
    { code: 'purchases.create', module: 'purchases', description: 'Crear ordenes de compra' },
    { code: 'purchases.receive', module: 'purchases', description: 'Recibir mercancia' },
    // Pagos
    { code: 'payments.view', module: 'payments', description: 'Ver pagos' },
    { code: 'payments.create', module: 'payments', description: 'Registrar pagos' },
    { code: 'payments.void', module: 'payments', description: 'Anular pagos' },
    // Reportes
    { code: 'reports.sales', module: 'reports', description: 'Ver reporte de ventas' },
    { code: 'reports.purchases', module: 'reports', description: 'Ver reporte de compras' },
    { code: 'reports.inventory', module: 'reports', description: 'Ver reporte de inventario' },
    { code: 'reports.fiscal', module: 'reports', description: 'Generar reportes fiscales (606, 607, 608)' },
    // Configuracion
    { code: 'settings.company', module: 'settings', description: 'Configurar empresa' },
    { code: 'settings.users', module: 'settings', description: 'Gestionar usuarios' },
    { code: 'settings.roles', module: 'settings', description: 'Gestionar roles' },
    { code: 'settings.ecf', module: 'settings', description: 'Configurar e-CF' },
    { code: 'settings.sequences', module: 'settings', description: 'Gestionar secuencias e-NCF' },
  ];

  const permissions: Record<string, string> = {};
  for (const perm of permissionDefs) {
    const created = await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: perm,
    });
    permissions[perm.code] = created.id;
  }

  // ============================================
  // Empresa de Ejemplo
  // ============================================
  console.log('🏢 Creando empresa de ejemplo...');
  const company = await prisma.company.upsert({
    where: { rnc: '131234567' },
    update: {},
    create: {
      rnc: '131234567',
      businessName: 'Mi Empresa SRL',
      tradeName: 'Mi Empresa',
      address: 'Av. Winston Churchill #100, Torre Empresarial, Piso 5',
      municipality: 'Distrito Nacional',
      province: 'Santo Domingo',
      phone: '809-555-0001',
      email: 'info@miempresa.com.do',
      ecfEnvironment: 'TesteCF',
      taxRegime: 'Normal',
    },
  });

  // ============================================
  // Sucursal Principal
  // ============================================
  console.log('🏬 Creando sucursal principal...');
  const branch = await prisma.branch.upsert({
    where: { companyId_code: { companyId: company.id, code: 'MAIN' } },
    update: {},
    create: {
      companyId: company.id,
      name: 'Casa Matriz',
      code: 'MAIN',
      address: 'Av. Winston Churchill #100',
      municipality: 'Distrito Nacional',
      province: 'Santo Domingo',
      phone: '809-555-0001',
      isMain: true,
    },
  });

  // ============================================
  // Almacen Principal
  // ============================================
  console.log('📦 Creando almacen principal...');
  await prisma.warehouse.upsert({
    where: { id: branch.id },
    update: {},
    create: {
      branchId: branch.id,
      name: 'Almacen Principal',
      code: 'ALM-001',
      description: 'Almacen principal de la casa matriz',
    },
  });

  // ============================================
  // Roles
  // ============================================
  console.log('👥 Creando roles...');

  // Admin - todos los permisos
  const adminRole = await prisma.role.create({
    data: {
      companyId: company.id,
      name: 'admin',
      description: 'Administrador del sistema - acceso completo',
    },
  });

  // Asignar todos los permisos al admin
  for (const permId of Object.values(permissions)) {
    await prisma.rolePermission.create({
      data: { roleId: adminRole.id, permissionId: permId },
    });
  }

  // Cajero
  const cajeroRole = await prisma.role.create({
    data: {
      companyId: company.id,
      name: 'cajero',
      description: 'Cajero - facturacion y cobros',
    },
  });

  const cajeroPerms = [
    'dashboard.view', 'invoices.view', 'invoices.create', 'invoices.print',
    'products.view', 'customers.view', 'customers.create',
    'payments.view', 'payments.create', 'inventory.view',
  ];
  for (const code of cajeroPerms) {
    if (permissions[code]) {
      await prisma.rolePermission.create({
        data: { roleId: cajeroRole.id, permissionId: permissions[code] },
      });
    }
  }

  // Almacenista
  const almacenistaRole = await prisma.role.create({
    data: {
      companyId: company.id,
      name: 'almacenista',
      description: 'Almacenista - gestion de inventario',
    },
  });

  const almacenistaPerms = [
    'dashboard.view', 'products.view', 'products.create', 'products.edit',
    'inventory.view', 'inventory.adjust', 'inventory.transfer', 'inventory.movements',
    'purchases.view', 'purchases.receive',
  ];
  for (const code of almacenistaPerms) {
    if (permissions[code]) {
      await prisma.rolePermission.create({
        data: { roleId: almacenistaRole.id, permissionId: permissions[code] },
      });
    }
  }

  // Contador
  const contadorRole = await prisma.role.create({
    data: {
      companyId: company.id,
      name: 'contador',
      description: 'Contador - reportes y configuracion fiscal',
    },
  });

  const contadorPerms = [
    'dashboard.view', 'invoices.view', 'invoices.send_dgii',
    'products.view', 'products.view_cost', 'inventory.view',
    'customers.view', 'suppliers.view',
    'purchases.view', 'payments.view',
    'reports.sales', 'reports.purchases', 'reports.inventory', 'reports.fiscal',
    'settings.ecf', 'settings.sequences',
  ];
  for (const code of contadorPerms) {
    if (permissions[code]) {
      await prisma.rolePermission.create({
        data: { roleId: contadorRole.id, permissionId: permissions[code] },
      });
    }
  }

  // ============================================
  // Usuario Admin por Defecto
  // ============================================
  console.log('👤 Creando usuario admin...');
  const passwordHash = await bcrypt.hash('admin123', 12);

  await prisma.user.upsert({
    where: { email: 'admin@miempresa.com.do' },
    update: {},
    create: {
      companyId: company.id,
      email: 'admin@miempresa.com.do',
      passwordHash,
      firstName: 'Administrador',
      lastName: 'Sistema',
      phone: '809-555-0001',
      roleId: adminRole.id,
      branchId: branch.id,
    },
  });

  // ============================================
  // Secuencias e-NCF de Ejemplo (TesteCF)
  // ============================================
  console.log('🔢 Creando secuencias e-NCF de prueba...');
  const sequences = [
    { ecfType: 'E31', prefix: 'E31', rangeFrom: 1, rangeTo: 1000, currentNumber: 1, desc: 'Factura Credito Fiscal' },
    { ecfType: 'E32', prefix: 'E32', rangeFrom: 1, rangeTo: 5000, currentNumber: 1, desc: 'Factura de Consumo' },
    { ecfType: 'E33', prefix: 'E33', rangeFrom: 1, rangeTo: 500, currentNumber: 1, desc: 'Nota de Debito' },
    { ecfType: 'E34', prefix: 'E34', rangeFrom: 1, rangeTo: 500, currentNumber: 1, desc: 'Nota de Credito' },
    { ecfType: 'E41', prefix: 'E41', rangeFrom: 1, rangeTo: 500, currentNumber: 1, desc: 'Comprobante de Compras' },
    { ecfType: 'E43', prefix: 'E43', rangeFrom: 1, rangeTo: 200, currentNumber: 1, desc: 'Gastos Menores' },
    { ecfType: 'E44', prefix: 'E44', rangeFrom: 1, rangeTo: 100, currentNumber: 1, desc: 'Pagos al Exterior' },
    { ecfType: 'E45', prefix: 'E45', rangeFrom: 1, rangeTo: 200, currentNumber: 1, desc: 'Regimen Especial' },
  ];

  for (const seq of sequences) {
    await prisma.ecfSequence.create({
      data: {
        companyId: company.id,
        branchId: branch.id,
        ecfType: seq.ecfType,
        prefix: seq.prefix,
        rangeFrom: seq.rangeFrom,
        rangeTo: seq.rangeTo,
        currentNumber: seq.currentNumber,
        expiryDate: new Date('2027-12-31'),
        alertThreshold: 100,
      },
    });
  }

  // ============================================
  // Categorias de Productos de Ejemplo
  // ============================================
  console.log('📁 Creando categorias de ejemplo...');
  const categories = [
    'Alimentos y Bebidas',
    'Electronicos',
    'Ropa y Calzado',
    'Hogar y Oficina',
    'Servicios',
    'Materiales de Construccion',
    'Productos de Limpieza',
    'Salud y Belleza',
  ];

  for (const name of categories) {
    await prisma.productCategory.create({
      data: { companyId: company.id, name },
    });
  }

  // ============================================
  // Clientes de Ejemplo
  // ============================================
  console.log('👥 Creando clientes de ejemplo...');
  const sampleCustomers = [
    {
      rncCedula: '101234568',
      businessName: 'Distribuidora Nacional SRL',
      customerType: 'persona_juridica',
      address: 'Av. 27 de Febrero #300, Santo Domingo',
      phone: '809-555-1001',
      email: 'compras@distnacional.com.do',
      creditLimit: 500000,
      creditDays: 30,
    },
    {
      rncCedula: '40212345678',
      businessName: 'Juan Carlos Martinez',
      customerType: 'persona_fisica',
      address: 'Calle El Sol #45, Santiago',
      phone: '809-555-2002',
      email: 'jcmartinez@gmail.com',
      creditLimit: 50000,
      creditDays: 15,
    },
    {
      businessName: 'Consumidor Final',
      customerType: 'consumidor',
    },
  ];

  for (const cust of sampleCustomers) {
    await prisma.customer.create({
      data: { companyId: company.id, ...cust },
    });
  }

  // ============================================
  // Lista de Precios por Defecto
  // ============================================
  console.log('💰 Creando lista de precios por defecto...');
  await prisma.priceList.create({
    data: {
      companyId: company.id,
      name: 'Precio General',
      isDefault: true,
    },
  });

  // ============================================
  // Planes SaaS
  // ============================================
  console.log('📦 Creando planes SaaS...');
  const planDefs = [
    {
      tier: 'FREE' as const,
      name: 'Free',
      description: 'Para empezar sin costo',
      priceMonthly: 0,
      priceAnnual: 0,
      maxUsers: 2,
      maxBranches: 1,
      maxWarehouses: 1,
      maxInvoicesMonth: 50,
      maxProductsSku: 100,
      maxStorageGb: 1,
      hasEcfIntegration: false,
      hasMultiBranch: false,
      hasApiAccess: false,
      hasAdvancedReports: false,
      hasCustomRoles: false,
      hasPurchaseOrders: false,
      hasPriceListMultiple: false,
      hasPrioritySupport: false,
      sortOrder: 0,
    },
    {
      tier: 'STARTER' as const,
      name: 'Starter',
      description: 'Ideal para pequeñas empresas',
      priceMonthly: 29,
      priceAnnual: 290,
      maxUsers: 5,
      maxBranches: 1,
      maxWarehouses: 2,
      maxInvoicesMonth: 500,
      maxProductsSku: 1000,
      maxStorageGb: 10,
      hasEcfIntegration: true,
      hasMultiBranch: false,
      hasApiAccess: false,
      hasAdvancedReports: false,
      hasCustomRoles: false,
      hasPurchaseOrders: true,
      hasPriceListMultiple: false,
      hasPrioritySupport: false,
      sortOrder: 1,
    },
    {
      tier: 'PROFESSIONAL' as const,
      name: 'Professional',
      description: 'Para empresas en crecimiento',
      priceMonthly: 79,
      priceAnnual: 790,
      maxUsers: 20,
      maxBranches: 5,
      maxWarehouses: 10,
      maxInvoicesMonth: 5000,
      maxProductsSku: 10000,
      maxStorageGb: 50,
      hasEcfIntegration: true,
      hasMultiBranch: true,
      hasApiAccess: true,
      hasAdvancedReports: true,
      hasCustomRoles: true,
      hasPurchaseOrders: true,
      hasPriceListMultiple: true,
      hasPrioritySupport: false,
      sortOrder: 2,
    },
    {
      tier: 'ENTERPRISE' as const,
      name: 'Enterprise',
      description: 'Para grandes corporaciones',
      priceMonthly: 0,
      priceAnnual: 0,
      maxUsers: null,
      maxBranches: null,
      maxWarehouses: null,
      maxInvoicesMonth: null,
      maxProductsSku: null,
      maxStorageGb: null,
      hasEcfIntegration: true,
      hasMultiBranch: true,
      hasApiAccess: true,
      hasAdvancedReports: true,
      hasCustomRoles: true,
      hasPurchaseOrders: true,
      hasPriceListMultiple: true,
      hasPrioritySupport: true,
      sortOrder: 3,
    },
  ];

  for (const plan of planDefs) {
    await prisma.plan.upsert({
      where: { tier: plan.tier },
      update: {},
      create: plan,
    });
  }

  // Asignar suscripción PROFESSIONAL a la empresa demo
  const professionalPlan = await prisma.plan.findUnique({ where: { tier: 'PROFESSIONAL' } });
  if (professionalPlan) {
    const existingSub = await prisma.subscription.findUnique({ where: { companyId: company.id } });
    if (!existingSub) {
      const periodEnd = new Date();
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      await prisma.subscription.create({
        data: {
          companyId: company.id,
          planId: professionalPlan.id,
          billingCycle: 'ANNUAL',
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: periodEnd,
        },
      });
    }
  }

  console.log('✅ Seed completado exitosamente!');
  console.log('');
  console.log('📋 Credenciales de acceso:');
  console.log('   Email: admin@miempresa.com.do');
  console.log('   Password: admin123');
  console.log('');
  console.log('🏢 Empresa: Mi Empresa SRL (RNC: 131234567)');
  console.log('📍 Sucursal: Casa Matriz');
  console.log('🔢 Secuencias e-NCF: E31-E45 configuradas (ambiente TesteCF)');
  console.log('👥 Roles: admin, cajero, almacenista, contador');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error en seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
