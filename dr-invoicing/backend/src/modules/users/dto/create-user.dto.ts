import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'juan@empresa.com' })
  @IsEmail({}, { message: 'Email invalido' })
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Juan' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Perez' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ example: '809-555-0001' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'ID del rol' })
  @IsUUID()
  roleId: string;

  @ApiPropertyOptional({ description: 'ID de la sucursal asignada' })
  @IsOptional()
  @IsUUID()
  branchId?: string;
}
