import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) { }

  async signIn(email: string, password: string) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    // chiffrer le mot de passe et le comparer avec celui en base de données
    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      // Generate JWT token
      if (isPasswordValid) {
        const payload = { sub: user.id, email: user.email };
        return await this.jwtService.signAsync(payload);
      }
    }

    throw new UnauthorizedException();
  }

  async register(register:RegisterDto) {
    const matchingUser = await this.prismaService.user.findUnique({
      where: { email: register.email, registerPin: register.pin, status: 'PENDING' },
    });
    if (!matchingUser){
      throw new UnauthorizedException('Invalid registration pin or email' );
    }
    const hashedPassword = await bcrypt.hash(register.password, 10);
    const newUser = await this.prismaService.user.update({
      where: { email: register.email, registerPin: register.pin, status: 'PENDING' },
      data: {
        password: hashedPassword
    }});
    const payload = { sub: newUser.id, email: newUser.email };
    return await this.jwtService.signAsync(payload);
  }
}