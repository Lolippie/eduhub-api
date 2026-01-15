import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthModule } from 'src/auth/auth.module';
import { DatabaseModule } from 'src/database/database.module';
import { JwtAuthGuard } from 'src/auth/auth.guard';

describe('Auth e2e', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule, DatabaseModule],
    })
    // On override le JwtAuthGuard pour qu'il passe tout
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: () => true })
    .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });


  it('/auth/signin (POST)', async () => {
    return request(app.getHttpServer())
      .post('/auth/signin')
      .send({
        email: 'admin@admin.com',
        password: 'Admin1234',
      })
      .expect(200)
      .expect(res => {
        expect(res.body).toHaveProperty('access_token');
      });
  });
});
