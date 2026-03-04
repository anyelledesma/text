import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string) {
    return this.prisma.customer.findMany({
      where: { companyId, isActive: true },
      orderBy: { businessName: 'asc' },
    });
  }

  async findById(id: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new NotFoundException('Cliente no encontrado');
    return customer;
  }

  async create(companyId: string, dto: CreateCustomerDto) {
    if (dto.rncCedula) {
      const existing = await this.prisma.customer.findFirst({
        where: { companyId, rncCedula: dto.rncCedula },
      });
      if (existing) {
        throw new ConflictException('Ya existe un cliente con ese RNC/Cedula en esta empresa');
      }
    }

    return this.prisma.customer.create({
      data: {
        companyId,
        rncCedula: dto.rncCedula,
        businessName: dto.businessName,
        tradeName: dto.tradeName,
        customerType: dto.customerType,
        address: dto.address,
        municipality: dto.municipality,
        province: dto.province,
        phone: dto.phone,
        email: dto.email,
        creditLimit: dto.creditLimit,
        creditDays: dto.creditDays,
      },
    });
  }

  async update(id: string, dto: UpdateCustomerDto) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new NotFoundException('Cliente no encontrado');

    return this.prisma.customer.update({
      where: { id },
      data: dto,
    });
  }

  async deactivate(id: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new NotFoundException('Cliente no encontrado');

    return this.prisma.customer.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
