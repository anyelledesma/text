import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';
import { CompanyService } from './company.service';
import { UpdateCompanyDto } from './dto/update-company.dto';

@ApiTags('Empresa')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('company')
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener datos de la empresa del usuario actual' })
  findMyCompany(@CurrentUser() user: CurrentUserData) {
    return this.companyService.findById(user.companyId);
  }

  @Get('rnc/:rnc')
  @ApiOperation({ summary: 'Buscar empresa por RNC' })
  findByRnc(@Param('rnc') rnc: string) {
    return this.companyService.findByRnc(rnc);
  }

  @Patch()
  @ApiOperation({ summary: 'Actualizar datos de la empresa' })
  update(@CurrentUser() user: CurrentUserData, @Body() dto: UpdateCompanyDto) {
    return this.companyService.update(user.companyId, dto);
  }

  @Get('branches')
  @ApiOperation({ summary: 'Listar sucursales de la empresa' })
  getBranches(@CurrentUser() user: CurrentUserData) {
    return this.companyService.getBranches(user.companyId);
  }

  @Post('branches')
  @ApiOperation({ summary: 'Agregar sucursal a la empresa' })
  addBranch(
    @CurrentUser() user: CurrentUserData,
    @Body() branchData: { name: string; address?: string; phone?: string; isMain?: boolean },
  ) {
    return this.companyService.addBranch(user.companyId, branchData);
  }

  @Delete()
  @ApiOperation({ summary: 'Desactivar empresa' })
  deactivate(@CurrentUser() user: CurrentUserData) {
    return this.companyService.deactivate(user.companyId);
  }
}
