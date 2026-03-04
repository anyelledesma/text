import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string) {
    return this.prisma.payment.findMany({
      where: { companyId },
      include: { invoice: true, customer: true },
      orderBy: { paymentDate: 'desc' },
    });
  }

  async findByInvoice(invoiceId: string) {
    return this.prisma.payment.findMany({
      where: { invoiceId },
      orderBy: { paymentDate: 'desc' },
    });
  }

  async create(companyId: string, userId: string, dto: CreatePaymentDto) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: dto.invoiceId },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${dto.invoiceId} not found`);
    }

    if (invoice.status === 'cancelled') {
      throw new BadRequestException('Cannot apply payment to a cancelled invoice');
    }

    return this.prisma.payment.create({
      data: {
        companyId,
        customerId: dto.customerId,
        invoiceId: dto.invoiceId,
        paymentDate: new Date(dto.paymentDate),
        amount: dto.amount,
        paymentMethod: dto.paymentMethod,
        reference: dto.reference,
        bankAccount: dto.bankAccount,
        notes: dto.notes,
        createdById: userId,
      },
    });
  }

  async void(id: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id } });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    if (payment.status === 'voided') {
      throw new BadRequestException('Payment is already voided');
    }

    return this.prisma.payment.update({
      where: { id },
      data: {
        status: 'voided',
        voidedAt: new Date(),
      },
    });
  }
}
