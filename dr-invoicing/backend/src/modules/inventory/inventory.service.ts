import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMovementDto } from './dto/create-movement.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async getStock(companyId: string, warehouseId?: string) {
    const where: any = { companyId };
    if (warehouseId) {
      where.warehouseId = warehouseId;
    }

    return this.prisma.inventoryStock.findMany({
      where,
      include: {
        product: true,
        warehouse: true,
      },
    });
  }

  async getProductStock(productId: string) {
    return this.prisma.inventoryStock.findMany({
      where: { productId },
      include: {
        warehouse: true,
      },
    });
  }

  async createMovement(companyId: string, userId: string, dto: CreateMovementDto) {
    return this.prisma.$transaction(async (tx) => {
      const movement = await tx.inventoryMovement.create({
        data: {
          ...dto,
          companyId,
          createdBy: userId,
        },
      });

      const isInbound = dto.movementType.endsWith('_in') || dto.movementType === 'initial';
      const quantityDelta = isInbound ? dto.quantity : -dto.quantity;

      await tx.inventoryStock.upsert({
        where: {
          productId_warehouseId: {
            productId: dto.productId,
            warehouseId: dto.warehouseId,
          },
        },
        create: {
          productId: dto.productId,
          warehouseId: dto.warehouseId,
          quantity: dto.quantity,
        },
        update: {
          quantity: { increment: quantityDelta },
        },
      });

      return movement;
    });
  }

  async adjustStock(companyId: string, userId: string, dto: AdjustStockDto) {
    const currentStock = await this.prisma.inventoryStock.findUnique({
      where: {
        productId_warehouseId: {
          productId: dto.productId,
          warehouseId: dto.warehouseId,
        },
      },
    });

    const currentQty = currentStock ? Number(currentStock.quantity) : 0;
    const difference = dto.newQuantity - currentQty;

    if (difference === 0) {
      return currentStock;
    }

    const movementType = difference > 0 ? 'adjustment_in' : 'adjustment_out';

    return this.createMovement(companyId, userId, {
      productId: dto.productId,
      warehouseId: dto.warehouseId,
      movementType: movementType as any,
      quantity: Math.abs(difference),
      notes: dto.reason,
    });
  }

  async getMovementHistory(productId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.inventoryMovement.findMany({
        where: { productId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.inventoryMovement.count({ where: { productId } }),
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
}
