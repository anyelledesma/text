import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../../prisma/prisma.service';
import type { RegisterDto } from './dto/register.dto';

export interface JwtPayload {
  sub: string;
  email: string;
  companyId: string;
  role: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async login(email: string, password: string): Promise<TokenResponse> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      companyId: user.companyId,
      role: user.role.name,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    await this.usersService.updateLastLogin(user.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.name,
      },
    };
  }

  async register(dto: RegisterDto): Promise<TokenResponse> {
    const existingUser = await this.usersService.findByEmail(dto.admin.email);
    if (existingUser) {
      throw new ConflictException('Ya existe una cuenta con este correo electrónico');
    }

    const existingCompany = await this.prisma.company.findUnique({
      where: { rnc: dto.company.rnc.replace(/[-\s]/g, '') },
    });
    if (existingCompany) {
      throw new ConflictException('Ya existe una empresa registrada con este RNC');
    }

    const tierName = dto.planTier ?? 'FREE';
    const plan = await this.prisma.plan.findUnique({ where: { tier: tierName as any } });

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Create company
      const company = await tx.company.create({
        data: {
          rnc: dto.company.rnc.replace(/[-\s]/g, ''),
          businessName: dto.company.businessName,
          tradeName: dto.company.tradeName,
          phone: dto.company.phone,
          address: dto.company.address,
          municipality: dto.company.municipality ?? '',
          province: dto.company.province ?? '',
        },
      });

      // 2. Create default branch
      await tx.branch.create({
        data: {
          companyId: company.id,
          name: 'Casa Matriz',
          code: 'CM',
          address: dto.company.address,
          isMain: true,
          isActive: true,
        },
      });

      // 3. Create ADMIN role for this company
      const adminRole = await tx.role.create({
        data: {
          companyId: company.id,
          name: 'Administrador',
          description: 'Acceso total al sistema',
          isSystem: true,
        },
      });

      // 4. Hash password and create admin user
      const passwordHash = await bcrypt.hash(dto.admin.password, 12);
      const user = await tx.user.create({
        data: {
          companyId: company.id,
          email: dto.admin.email,
          passwordHash,
          firstName: dto.admin.firstName,
          lastName: dto.admin.lastName,
          roleId: adminRole.id,
          isActive: true,
        },
        include: { role: true },
      });

      // 5. Create subscription (trial period: 14 days)
      if (plan) {
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 14);
        await tx.subscription.create({
          data: {
            companyId: company.id,
            planId: plan.id,
            billingCycle: 'MONTHLY',
            status: 'TRIALING',
            trialEndsAt: trialEnd,
            currentPeriodStart: new Date(),
            currentPeriodEnd: trialEnd,
          },
        });
      }

      return { company, user };
    });

    const payload: JwtPayload = {
      sub: result.user.id,
      email: result.user.email,
      companyId: result.company.id,
      role: result.user.role.name,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        role: result.user.role.name,
      },
    };
  }

  async refreshToken(token: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('Token invalido');
      }

      const newPayload: JwtPayload = {
        sub: user.id,
        email: user.email,
        companyId: user.companyId,
        role: user.role.name,
      };

      return { accessToken: this.jwtService.sign(newPayload) };
    } catch {
      throw new UnauthorizedException('Token invalido o expirado');
    }
  }
}
