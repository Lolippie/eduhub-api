import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
   @ApiResponse({
    status: 200,
    description: 'API is running',
  })
  @ApiOperation({ summary: 'Check API status' })
  getHello(): string {
    return this.appService.getHello();
  }
}
