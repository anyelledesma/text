import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Length, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum EcfEnvironment {
  TesteCF = 'TesteCF',
  CerteCF = 'CerteCF',
  eCF = 'eCF',
}

export class CreateCompanyDto {
  @ApiProperty({ example: '101123456', description: 'RNC de la empresa (11 caracteres)' })
  @IsNotEmpty({ message: 'El RNC es requerido' })
  @IsString()
  @Length(9, 11, { message: 'El RNC debe tener entre 9 y 11 caracteres' })
  rnc: string;

  @ApiProperty({ example: 'Distribuidora Nacional SRL' })
  @IsNotEmpty({ message: 'La razon social es requerida' })
  @IsString()
  @MaxLength(255)
  businessName: string;

  @ApiPropertyOptional({ example: 'DistriNac' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  tradeName?: string;

  @ApiPropertyOptional({ example: 'Av. 27 de Febrero #100, Santo Domingo' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional({ example: 'Santo Domingo de Guzman' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  municipality?: string;

  @ApiPropertyOptional({ example: 'Distrito Nacional' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  province?: string;

  @ApiPropertyOptional({ example: '809-555-0001' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: 'info@distrinac.com.do' })
  @IsOptional()
  @IsEmail({}, { message: 'Email invalido' })
  email?: string;

  @ApiPropertyOptional({ example: 'https://distrinac.com.do' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  website?: string;

  @ApiPropertyOptional({ enum: EcfEnvironment, example: EcfEnvironment.TesteCF })
  @IsOptional()
  @IsEnum(EcfEnvironment, { message: 'Ambiente eCF invalido (TesteCF, CerteCF, eCF)' })
  ecfEnvironment?: EcfEnvironment;

  @ApiPropertyOptional({ example: 'Regimen Ordinario' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  taxRegime?: string;
}
