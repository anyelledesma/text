import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Length, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSupplierDto {
  @ApiProperty({ example: '131234567', description: 'RNC del suplidor (requerido)' })
  @IsNotEmpty({ message: 'El RNC es requerido' })
  @IsString()
  @Length(9, 11, { message: 'El RNC debe tener entre 9 y 11 caracteres' })
  rnc: string;

  @ApiProperty({ example: 'Importadora del Caribe SRL' })
  @IsNotEmpty({ message: 'La razon social es requerida' })
  @IsString()
  @MaxLength(255)
  businessName: string;

  @ApiPropertyOptional({ example: 'ImpCaribe' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  tradeName?: string;

  @ApiPropertyOptional({ example: 'Carlos Martinez' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  contactName?: string;

  @ApiPropertyOptional({ example: 'Zona Industrial de Herrera, Santo Domingo Oeste' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional({ example: '809-555-0003' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: 'ventas@impcaribe.com.do' })
  @IsOptional()
  @IsEmail({}, { message: 'Email invalido' })
  email?: string;

  @ApiPropertyOptional({ example: 30, description: 'Terminos de pago en dias' })
  @IsOptional()
  @IsNumber({}, { message: 'Los terminos de pago deben ser un numero' })
  @Min(0)
  paymentTerms?: number;
}
