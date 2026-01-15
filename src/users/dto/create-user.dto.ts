import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsEnum } from 'class-validator';
import { Role } from 'generated/prisma';

export class CreateUserDto {
  @ApiProperty({
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'John',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    example: 'Doe',
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    example: 'Password123!',
  })
  @IsString()
  password: string;

  @ApiProperty({
    enum: Role,
    example: Role.STUDENT,
  })
  @IsEnum(Role)
  role: Role;
}
