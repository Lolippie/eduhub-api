import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { App } from "supertest/types";
import * as request from "supertest";
import { AuthModule } from "src/auth/auth.module";

describe("Auth 2e2", ()=> {
    let app : INestApplication<App>;

    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AuthModule],
      }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it("/aut/login (POST)", () => {
        return request(app.getHttpServer())
        .post("/auth/login")
        .send({
            email:"monexemple@gmail.com",
            password:"exemple123"

        }).expect(200);
    })
    
})