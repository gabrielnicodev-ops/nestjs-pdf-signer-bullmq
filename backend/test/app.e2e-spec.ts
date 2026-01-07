import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('SignerController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  it('/signer/uploader (POST) - Error si no hay data', () => {
    return request(app.getHttpServer())
      .post('/signer/uploader')
      .send({})
      .expect(400); // Bad Request por el ValidationPipe
  });

  it('/signer/uploader (POST) - Éxito con data válida', () => {
    return request(app.getHttpServer())
      .post('/signer/uploader')
      .send({ data: 'SGVsbG8gV29ybGQ=' }) // "Hello World" en base64
      .expect(201)
      .then(response => {
        expect(response.body).toHaveProperty('jobId');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});