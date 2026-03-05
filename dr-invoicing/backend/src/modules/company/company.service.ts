import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: { branches: true },
    });
    if (!company) throw new NotFoundException('Empresa no encontrada');
    return company;
  }

  async findByRnc(rnc: string) {
    const company = await this.prisma.company.findUnique({
      where: { rnc },
      include: { branches: true },
    });
    if (!company) throw new NotFoundException('Empresa no encontrada con ese RNC');
    return company;
  }

  async create(dto: CreateCompanyDto) {
    const existing = await this.prisma.company.findUnique({ where: { rnc: dto.rnc } });
    if (existing) {
      throw new ConflictException('Ya existe una empresa registrada con ese RNC');
    }

    return this.prisma.company.create({
      data: {
        rnc: dto.rnc,
        businessName: dto.businessName,
        tradeName: dto.tradeName,
        address: dto.address ?? '',
        municipality: dto.municipality ?? '',
        province: dto.province ?? '',
        phone: dto.phone,
        email: dto.email,
        website: dto.website,
        ecfEnvironment: dto.ecfEnvironment,
        taxRegime: dto.taxRegime,
      },
    });
  }

  async update(id: string, dto: UpdateCompanyDto) {
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) throw new NotFoundException('Empresa no encontrada');

    return this.prisma.company.update({
      where: { id },
      data: dto,
    });
  }

  async addBranch(companyId: string, branchData: { name: string; code: string; address?: string; phone?: string; isMain?: boolean }) {
    return this.prisma.branch.create({
      data: {
        companyId,
        name: branchData.name,
        code: branchData.code,
        address: branchData.address,
        phone: branchData.phone,
        isMain: branchData.isMain ?? false,
      },
    });
  }

  async getBranches(companyId: string) {
    return this.prisma.branch.findMany({
      where: { companyId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async deactivate(id: string) {
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) throw new NotFoundException('Empresa no encontrada');

    return this.prisma.company.update({
      where: { id },
      data: { isEcfEnabled: false },
    });
  }
}
