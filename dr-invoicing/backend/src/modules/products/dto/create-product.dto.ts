import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ProductType {
  PRODUCT = 'product',
  SERVICE = 'service',
}

export enum TaxType {
  ITBIS_18 = '18',
  ITBIS_16 = '16',
  ZERO = '0',
  EXENTO = 'exento',
}

export class CreateProductDto {
  @ApiProperty({ description: 'Category ID' })
  @IsString()
  categoryId: string;

  @ApiProperty({ description: 'Unit of measurement ID' })
  @IsString()
  unitId: string;

  @ApiProperty({ description: 'Stock Keeping Unit code' })
  @IsString()
  @MaxLength(50)
  sku: string;

  @ApiPropertyOptional({ description: 'Barcode' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  barcode?: string;

  @ApiProperty({ description: 'Product name' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Product description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ProductType, description: 'Product or service' })
  @IsEnum(ProductType)
  productType: ProductType;

  @ApiProperty({ description: 'Cost price', example: 100.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  costPrice: number;

  @ApiProperty({ description: 'Sale price', example: 150.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  salePrice: number;

  @ApiPropertyOptional({ description: 'Minimum allowed sale price' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  minSalePrice?: number;

  @ApiProperty({ enum: TaxType, description: 'ITBIS tax type for DGII' })
  @IsEnum(TaxType)
  taxType: TaxType;

  @ApiProperty({ description: 'Whether ITBIS tax applies', default: true })
  @IsBoolean()
  isTaxable: boolean;

  @ApiProperty({ description: 'Track inventory for this product', default: true })
  @IsBoolean()
  trackInventory: boolean;

  @ApiPropertyOptional({ description: 'Minimum stock level' })
  @IsOptional()
  @IsInt()
  @Min(0)
  minStock?: number;

  @ApiPropertyOptional({ description: 'Maximum stock level' })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxStock?: number;

  @ApiPropertyOptional({ description: 'DGII Bien o Servicio indicator' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  bienOServicio?: string;
}
