import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInvoiceItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsString()
  productId: string;

  @ApiPropertyOptional({ description: 'Line item description override' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Quantity', example: 2 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  quantity: number;

  @ApiProperty({ description: 'Unit price', example: 150.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  unitPrice: number;

  @ApiProperty({ description: 'Discount percentage', example: 5.0, default: 0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  discountPct: number;

  @ApiProperty({ description: 'Tax rate (ITBIS)', example: 18, default: 18 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  taxRate: number;
}
