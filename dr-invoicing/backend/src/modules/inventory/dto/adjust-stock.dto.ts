import { IsString, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdjustStockDto {
  @ApiProperty({ description: 'Product ID' })
  @IsString()
  productId: string;

  @ApiProperty({ description: 'Warehouse ID' })
  @IsString()
  warehouseId: string;

  @ApiProperty({ description: 'New absolute stock quantity', example: 50 })
  @IsInt()
  @Min(0)
  newQuantity: number;

  @ApiProperty({ description: 'Reason for adjustment' })
  @IsString()
  reason: string;
}
