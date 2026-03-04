import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';
import { InventoryService } from './inventory.service';
import { CreateMovementDto } from './dto/create-movement.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('stock')
  @ApiOperation({ summary: 'Get stock levels for the company' })
  getStock(
    @CurrentUser() user: CurrentUserData,
    @Query('warehouseId') warehouseId?: string,
  ) {
    return this.inventoryService.getStock(user.companyId, warehouseId);
  }

  @Get('stock/:productId')
  @ApiOperation({ summary: 'Get stock levels for a specific product' })
  getProductStock(@Param('productId') productId: string) {
    return this.inventoryService.getProductStock(productId);
  }

  @Post('movements')
  @ApiOperation({ summary: 'Create an inventory movement' })
  createMovement(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: CreateMovementDto,
  ) {
    return this.inventoryService.createMovement(user.companyId, user.id, dto);
  }

  @Post('adjust')
  @ApiOperation({ summary: 'Adjust stock to a specific quantity' })
  adjustStock(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: AdjustStockDto,
  ) {
    return this.inventoryService.adjustStock(user.companyId, user.id, dto);
  }

  @Get('movements/:productId')
  @ApiOperation({ summary: 'Get movement history for a product' })
  getMovementHistory(
    @Param('productId') productId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.inventoryService.getMovementHistory(
      productId,
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined,
    );
  }
}
