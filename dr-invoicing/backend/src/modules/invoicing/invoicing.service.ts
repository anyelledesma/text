import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Injectable()
export class InvoicingService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    companyId: string,
    filters: {
      customerId?: string;
      ecfType?: string;
      status?: string;
      dateFrom?: string;
      dateTo?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const { customerId, ecfType, status, dateFrom, dateTo, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = { companyId };

    if (customerId) where.customerId = customerId;
    if (ecfType) where.ecfType = ecfType;
    if (status) where.status = status;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        include: { items: true, customer: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { items: true, customer: true, payments: true },
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
    return invoice;
  }

  async create(companyId: string, userId: string, dto: CreateInvoiceDto) {
    const items = dto.items.map((item) => {
      const subtotal = item.quantity * item.unitPrice;
      const discountAmount = subtotal * (item.discountPct / 100);
      const taxableAmount = subtotal - discountAmount;
      const taxAmount = taxableAmount * (item.taxRate / 100);
      const total = taxableAmount + taxAmount;

      return {
        productId: item.productId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPct: item.discountPct,
        discountAmount,
        taxRate: item.taxRate,
        taxAmount,
        subtotal: taxableAmount,
        total,
      };
    });

    const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
    const totalTax = items.reduce((sum, i) => sum + i.taxAmount, 0);
    const totalDiscount = items.reduce((sum, i) => sum + i.discountAmount, 0);
    const totalAmount = items.reduce((sum, i) => sum + i.total, 0);

    return this.prisma.invoice.create({
      data: {
        companyId,
        branchId: dto.branchId,
        customerId: dto.customerId,
        ecfType: dto.ecfType,
        currencyCode: dto.currencyCode,
        exchangeRate: dto.exchangeRate,
        subtotal,
        totalTax,
        totalDiscount,
        totalAmount,
        notes: dto.notes,
        paymentForm: dto.paymentForm,
        status: 'draft',
        createdById: userId,
        items: {
          create: items,
        },
      },
      include: { items: true },
    });
  }

  async cancel(id: string, userId: string) {
    const invoice = await this.findById(id);

    if (invoice.status === 'cancelled') {
      throw new BadRequestException('Invoice is already cancelled');
    }

    return this.prisma.invoice.update({
      where: { id },
      data: {
        status: 'cancelled',
        cancelledById: userId,
        cancelledAt: new Date(),
      },
    });
  }

  async sendToDgii(id: string) {
    const invoice = await this.findById(id);

    if (invoice.status === 'cancelled') {
      throw new BadRequestException('Cannot send a cancelled invoice to DGII');
    }

    // TODO: Integrate with DGII e-CF web service
    return this.prisma.invoice.update({
      where: { id },
      data: {
        status: 'sent',
        dgiiSentAt: new Date(),
      },
    });
  }
}
