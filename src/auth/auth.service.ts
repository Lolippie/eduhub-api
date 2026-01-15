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

      if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');
      
      const token = await this.jwtService.signAsync({ sub: user.id, email: user.email })

      if (!token) throw new UnauthorizedException('Token generation failed');
      
      return token;
    }

  }

  async setUp(users:SetUpDto[]) {
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const isUserExist = await this.prismaService.user.findUnique({
        where: { email: user.email },
      });

      if(isUserExist) throw new UnauthorizedException('User already exists')

      const newUser = await this.prismaService.user.create({
        data: {
          email: user.email,
          password: hashedPassword,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
      }});

      if (!newUser) throw new UnauthorizedException('User creation failed')
    }
  
    return { message: 'Setup completed successfully' };
  }
}