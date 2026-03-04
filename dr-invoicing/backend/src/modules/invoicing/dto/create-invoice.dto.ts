import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateInvoiceItemDto } from './create-invoice-item.dto';

export enum EcfType {
  E31 = 'E31',
  E32 = 'E32',
  E33 = 'E33',
  E34 = 'E34',
}

export class CreateInvoiceDto {
  @ApiProperty({ description: 'Branch ID' })
  @IsString()
  branchId: string;

  @ApiPropertyOptional({ description: 'Customer ID (optional for E32 consumer invoices)' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiProperty({ enum: EcfType, description: 'Electronic fiscal document type (e-CF)' })
  @IsEnum(EcfType)
  ecfType: EcfType;

  @ApiProperty({ description: 'Currency code (DOP, USD)', default: 'DOP' })
  @IsString()
  currencyCode: string;

  @ApiProperty({ description: 'Exchange rate to DOP', default: 1.0 })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  exchangeRate: number;

  @ApiProperty({ type: [CreateInvoiceItemDto], description: 'Invoice line items' })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => CreateInvoiceItemDto)
  items: CreateInvoiceItemDto[];

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Payment form indicator' })
  @IsOptional()
  @IsString()
  paymentForm?: string;
}
