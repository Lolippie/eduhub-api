import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcrypt';
import { SetUpDto } from './dto/set-up.dto';

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

  async setUp(users:SetUpDto[]) {
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const isUserExist = await this.prismaService.user.findUnique({
        where: { email: user.email },
      });
      if(isUserExist){
        throw new UnauthorizedException('User already exists');
      }
      await this.prismaService.user.create({
        data: {
          email: user.email,
          password: hashedPassword,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
      }});
    }
    const adminUser = await this.prismaService.user.findUnique({
      where: { email: users[0].email },
    });
    if (!adminUser) {
      throw new UnauthorizedException('Admin user creation failed');
    }
    const payload = { sub: adminUser.id, email: adminUser.email };

    return await this.jwtService.signAsync(payload);
  }
}