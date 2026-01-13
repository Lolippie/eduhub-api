import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { Public } from './decorators/public.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { SetUpDto } from './dto/set-up.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @ApiBearerAuth()
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Public()
  @Post('setup/users')
  setup() {
    const setUp: SetUpDto[]= [{
      email:"admin@admin.com",
      password:"Admin1234",
      firstName:"Admin",
      lastName:"Admin",
      role:"ADMIN"
    },
    {
      email:"teacher@teacher.com",
      password:"Teacher1234",
      firstName:"Teacher",
      lastName:"Teacher",
      role:"TEACHER"
    },
    {
      email:"teacher1@teacher.com",
      password:"Teacher1234",
      firstName:"Teacher1",
      lastName:"Teacher1",
      role:"TEACHER"
    },
    {
      email:"student1@student.com",
      password:"Student1234",
      firstName:"Student1",
      lastName:"Student1",
      role:"STUDENT"
    },
    {
      email:"student2@student.com",
      password:"Student1234",
      firstName:"Student2",
      lastName:"Student2",
      role:"STUDENT"
    },
    {
      email:"student2@student.com",
      password:"Student1234",
      firstName:"Student2",
      lastName:"Student2",
      role:"STUDENT"
    },
    {
      email:"movingUser@user.com",
      password:"User1234",
      firstName:"Moving",
      lastName:"User",
      role:"STUDENT"
    }
  ];
    return this.authService.setUp(
      setUp
    );
  }
}