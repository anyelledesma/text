import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum CustomerType {
  persona_fisica = 'persona_fisica',
  persona_juridica = 'persona_juridica',
  consumidor = 'consumidor',
}

export class CreateCustomerDto {
  @ApiPropertyOptional({ example: '00112345678', description: 'RNC o Cedula (opcional para consumidor)' })
  @IsOptional()
  @IsString()
  @MaxLength(11)
  rncCedula?: string;

  @ApiProperty({ example: 'Comercial El Progreso SRL' })
  @IsNotEmpty({ message: 'La razon social es requerida' })
  @IsString()
  @MaxLength(255)
  businessName: string;

  @ApiPropertyOptional({ example: 'El Progreso' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  tradeName?: string;

  @ApiProperty({ enum: CustomerType, example: CustomerType.persona_juridica })
  @IsNotEmpty({ message: 'El tipo de cliente es requerido' })
  @IsEnum(CustomerType, { message: 'Tipo de cliente invalido (persona_fisica, persona_juridica, consumidor)' })
  customerType: CustomerType;

  @ApiPropertyOptional({ example: 'Calle Duarte #50, Santiago' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional({ example: 'Santiago de los Caballeros' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  municipality?: string;

  @ApiPropertyOptional({ example: 'Santiago' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  province?: string;

  @ApiPropertyOptional({ example: '809-555-0002' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: 'compras@elprogreso.com.do' })
  @IsOptional()
  @IsEmail({}, { message: 'Email invalido' })
  email?: string;

  @ApiPropertyOptional({ example: 50000, description: 'Limite de credito en RD$' })
  @IsOptional()
  @IsNumber({}, { message: 'El limite de credito debe ser un numero' })
  @Min(0)
  creditLimit?: number;

  @ApiPropertyOptional({ example: 30, description: 'Dias de credito' })
  @IsOptional()
  @IsNumber({}, { message: 'Los dias de credito deben ser un numero' })
  @Min(0)
  creditDays?: number;
}
