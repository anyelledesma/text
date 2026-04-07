import { Type } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterCompanyDto {
  @ApiProperty({ example: '131123457' })
  @IsString()
  @IsNotEmpty()
  rnc: string;

  @ApiProperty({ example: 'Distribuidora Los Pinos SRL' })
  @IsString()
  @IsNotEmpty()
  businessName: string;

  @ApiPropertyOptional({ example: 'Los Pinos' })
  @IsString()
  @IsOptional()
  tradeName?: string;

  @ApiProperty({ example: '809-555-1234' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'Av. Winston Churchill 1099' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiPropertyOptional({ example: 'Santo Domingo' })
  @IsString()
  @IsOptional()
  municipality?: string;

  @ApiPropertyOptional({ example: 'Distrito Nacional' })
  @IsString()
  @IsOptional()
  province?: string;
}

export class RegisterAdminDto {
  @ApiProperty({ example: 'María' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'González' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'admin@empresa.com.do' })
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;
}

export class RegisterDto {
  @ApiProperty({ type: RegisterCompanyDto })
  @ValidateNested()
  @Type(() => RegisterCompanyDto)
  company: RegisterCompanyDto;

  @ApiProperty({ type: RegisterAdminDto })
  @ValidateNested()
  @Type(() => RegisterAdminDto)
  admin: RegisterAdminDto;

  @ApiPropertyOptional({ enum: ['FREE', 'STARTER', 'PROFESSIONAL'], default: 'FREE' })
  @IsIn(['FREE', 'STARTER', 'PROFESSIONAL'])
  @IsOptional()
  planTier?: 'FREE' | 'STARTER' | 'PROFESSIONAL';
}
