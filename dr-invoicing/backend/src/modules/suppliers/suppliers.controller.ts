import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@ApiTags('Suplidores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('suppliers')
export class SuppliersController {
  constructor(private suppliersService: SuppliersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar suplidores de la empresa' })
  findAll(@CurrentUser() user: CurrentUserData) {
    return this.suppliersService.findAll(user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener suplidor por ID' })
  findOne(@Param('id') id: string) {
    return this.suppliersService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear suplidor' })
  create(@CurrentUser() user: CurrentUserData, @Body() dto: CreateSupplierDto) {
    return this.suppliersService.create(user.companyId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar suplidor' })
  update(@Param('id') id: string, @Body() dto: UpdateSupplierDto) {
    return this.suppliersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar suplidor' })
  deactivate(@Param('id') id: string) {
    return this.suppliersService.deactivate(id);
  }
}
