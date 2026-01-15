import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DatabaseModule } from 'src/database/database.module';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard  } from './auth.guard';
import { PrismaService } from 'src/database/prisma.service';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [
    AuthService,
    PrismaService,
    JwtAuthGuard,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard ,
    },
  ],
  exports:[AuthService, JwtModule, JwtAuthGuard],
  controllers: [AuthController],
})
export class AuthModule { }