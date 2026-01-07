import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  // 1. Crear la instancia de la aplicación
  const app = await NestFactory.create(AppModule);

  // 2. Seguridad: Helmet ayuda a proteger la app de vulnerabilidades web conocidas
  // configurando cabeceras HTTP adecuadamente.
  app.use(helmet());

  // 3. Configuración de CORS (Forma nativa de NestJS)
  app.enableCors({
    origin: true, 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 4. Pipes Globales: Para que los DTOs funcionen y validen los datos automáticamente
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades del body que no estén en el DTO
      forbidNonWhitelisted: true, // Lanza error si envían propiedades de más
      transform: true, // Transforma los tipos automáticamente (ej: string a number)
    }),
  );

  // 5. Prefijo global (Opcional pero recomendado para APIs)
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT_SERVER || 3000;
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}/api/v1`);
}

// Ejecución limpia
bootstrap().catch((err) => {
  console.error('Error starting server', err);
  process.exit(1);
});