import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales')
  @ApiOperation({ summary: 'Generate sales report for a date range' })
  salesReport(
    @CurrentUser() user: CurrentUserData,
    @Query('dateFrom') dateFrom: string,
    @Query('dateTo') dateTo: string,
  ) {
    return this.reportsService.salesReport(user.companyId, dateFrom, dateTo);
  }

  @Get('606/:period')
  @ApiOperation({ summary: 'Generate DGII 606 purchase report for a period (YYYYMM)' })
  generate606(
    @CurrentUser() user: CurrentUserData,
    @Param('period') period: string,
  ) {
    return this.reportsService.generate606(user.companyId, period);
  }

  @Get('607/:period')
  @ApiOperation({ summary: 'Generate DGII 607 sales report for a period (YYYYMM)' })
  generate607(
    @CurrentUser() user: CurrentUserData,
    @Param('period') period: string,
  ) {
    return this.reportsService.generate607(user.companyId, period);
  }

  @Get('608/:period')
  @ApiOperation({ summary: 'Generate DGII 608 cancelled documents report for a period (YYYYMM)' })
  generate608(
    @CurrentUser() user: CurrentUserData,
    @Param('period') period: string,
  ) {
    return this.reportsService.generate608(user.companyId, period);
  }
}
