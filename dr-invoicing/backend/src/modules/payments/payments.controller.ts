import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @ApiOperation({ summary: 'List all payments for the company' })
  findAll(@CurrentUser() user: CurrentUserData) {
    return this.paymentsService.findAll(user.companyId);
  }

  @Get('invoice/:invoiceId')
  @ApiOperation({ summary: 'Get payments for a specific invoice' })
  findByInvoice(@Param('invoiceId') invoiceId: string) {
    return this.paymentsService.findByInvoice(invoiceId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new payment' })
  create(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.paymentsService.create(user.companyId, user.id, dto);
  }

  @Post(':id/void')
  @ApiOperation({ summary: 'Void a payment' })
  void(@Param('id') id: string) {
    return this.paymentsService.void(id);
  }
}
