import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';

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
