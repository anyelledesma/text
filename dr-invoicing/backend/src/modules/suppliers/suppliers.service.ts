import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string) {
    return this.prisma.supplier.findMany({
      where: { companyId, isActive: true },
      orderBy: { businessName: 'asc' },
    });
  }

  async findById(id: string) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id } });
    if (!supplier) throw new NotFoundException('Suplidor no encontrado');
    return supplier;
  }

  async create(companyId: string, dto: CreateSupplierDto) {
    const existing = await this.prisma.supplier.findFirst({
      where: { companyId, rnc: dto.rnc },
    });
    if (existing) {
      throw new ConflictException('Ya existe un suplidor con ese RNC en esta empresa');
    }

    return this.prisma.supplier.create({
      data: {
        companyId,
        rnc: dto.rnc,
        businessName: dto.businessName,
        tradeName: dto.tradeName,
        contactName: dto.contactName,
        address: dto.address,
        phone: dto.phone,
        email: dto.email,
        paymentTerms: dto.paymentTerms,
      },
    });
  }

  async update(id: string, dto: UpdateSupplierDto) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id } });
    if (!supplier) throw new NotFoundException('Suplidor no encontrado');

    return this.prisma.supplier.update({
      where: { id },
      data: dto,
    });
  }

  async deactivate(id: string) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id } });
    if (!supplier) throw new NotFoundException('Suplidor no encontrado');

    return this.prisma.supplier.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
