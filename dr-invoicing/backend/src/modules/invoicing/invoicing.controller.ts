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
import { InvoicingService } from './invoicing.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@ApiTags('Invoicing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('invoicing')
export class InvoicingController {
  constructor(private readonly invoicingService: InvoicingService) {}

  @Get()
  @ApiOperation({ summary: 'List invoices for the company' })
  findAll(
    @CurrentUser() user: CurrentUserData,
    @Query('customerId') customerId?: string,
    @Query('ecfType') ecfType?: string,
    @Query('status') status?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.invoicingService.findAll(user.companyId, {
      customerId,
      ecfType,
      status,
      dateFrom,
      dateTo,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  findById(@Param('id') id: string) {
    return this.invoicingService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new invoice' })
  create(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: CreateInvoiceDto,
  ) {
    return this.invoicingService.create(user.companyId, user.id, dto);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel an invoice' })
  cancel(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
  ) {
    return this.invoicingService.cancel(id, user.id);
  }

  @Post(':id/send-dgii')
  @ApiOperation({ summary: 'Send invoice to DGII for e-CF processing' })
  sendToDgii(@Param('id') id: string) {
    return this.invoicingService.sendToDgii(id);
  }
}
