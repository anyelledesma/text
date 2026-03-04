import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async salesReport(companyId: string, dateFrom: string, dateTo: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: {
        companyId,
        status: { not: 'cancelled' },
        createdAt: {
          gte: new Date(dateFrom),
          lte: new Date(dateTo),
        },
      },
      include: { items: true, customer: true, payments: true },
      orderBy: { createdAt: 'asc' },
    });

    const totalSales = invoices.reduce((sum, inv) => sum + (inv.totalAmount ?? 0), 0);
    const totalTax = invoices.reduce((sum, inv) => sum + (inv.totalTax ?? 0), 0);
    const totalDiscount = invoices.reduce((sum, inv) => sum + (inv.totalDiscount ?? 0), 0);

    return {
      dateFrom,
      dateTo,
      invoiceCount: invoices.length,
      totalSales,
      totalTax,
      totalDiscount,
      invoices,
    };
  }

  /**
   * DGII Format 606 - Purchase report (Compras de Bienes y Servicios)
   * @param period Format: YYYYMM (e.g. '202603')
   */
  async generate606(companyId: string, period: string) {
    const { startDate, endDate } = this.parsePeriod(period);

    const purchases = await this.prisma.purchase.findMany({
      where: {
        companyId,
        purchaseDate: { gte: startDate, lte: endDate },
      },
      include: { supplier: true },
      orderBy: { purchaseDate: 'asc' },
    });

    return {
      reportType: '606',
      period,
      generatedAt: new Date(),
      recordCount: purchases.length,
      records: purchases.map((p) => ({
        rncCedula: (p as any).supplier?.rnc,
        tipoId: (p as any).supplier?.idType,
        tipoBienServicio: (p as any).bienOServicio,
        ncf: (p as any).ncf,
        fechaComprobante: p.purchaseDate,
        montoFacturado: (p as any).totalAmount,
        itbisFacturado: (p as any).totalTax,
      })),
    };
  }

  /**
   * DGII Format 607 - Sales report (Ventas de Bienes y Servicios)
   * @param period Format: YYYYMM (e.g. '202603')
   */
  async generate607(companyId: string, period: string) {
    const { startDate, endDate } = this.parsePeriod(period);

    const invoices = await this.prisma.invoice.findMany({
      where: {
        companyId,
        status: { not: 'cancelled' },
        createdAt: { gte: startDate, lte: endDate },
      },
      include: { customer: true },
      orderBy: { createdAt: 'asc' },
    });

    return {
      reportType: '607',
      period,
      generatedAt: new Date(),
      recordCount: invoices.length,
      records: invoices.map((inv) => ({
        rncCedula: (inv as any).customer?.rnc,
        tipoId: (inv as any).customer?.idType,
        ncf: (inv as any).ncf,
        ecfType: inv.ecfType,
        fechaComprobante: inv.createdAt,
        montoFacturado: inv.totalAmount,
        itbisFacturado: inv.totalTax,
      })),
    };
  }

  /**
   * DGII Format 608 - Cancelled documents report (Comprobantes Anulados)
   * @param period Format: YYYYMM (e.g. '202603')
   */
  async generate608(companyId: string, period: string) {
    const { startDate, endDate } = this.parsePeriod(period);

    const cancelledInvoices = await this.prisma.invoice.findMany({
      where: {
        companyId,
        status: 'cancelled',
        cancelledAt: { gte: startDate, lte: endDate },
      },
      orderBy: { cancelledAt: 'asc' },
    });

    return {
      reportType: '608',
      period,
      generatedAt: new Date(),
      recordCount: cancelledInvoices.length,
      records: cancelledInvoices.map((inv) => ({
        ncf: (inv as any).ncf,
        ecfType: inv.ecfType,
        fechaAnulacion: (inv as any).cancelledAt,
      })),
    };
  }

  private parsePeriod(period: string): { startDate: Date; endDate: Date } {
    const year = parseInt(period.substring(0, 4), 10);
    const month = parseInt(period.substring(4, 6), 10);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    return { startDate, endDate };
  }
}
