// import { NestFactory } from '@nestjs/core';
// import { ValidationPipe } from '@nestjs/common';
// import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
// import { ConfigService } from '@nestjs/config';
// import * as compression from 'compression';
// import helmet from 'helmet';
// import { AppModule } from './app.module';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule, {
//     logger: ['error', 'warn', 'log'],
//   });

//   const configService = app.get(ConfigService);

//   // Sécurité
//   app.use(helmet());
//   app.use(compression());

//   // CORS
//   app.enableCors({
//     origin: configService.get('FRONTEND_URL', 'http://localhost:3000'),
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//   });

//   // Validation globale
//   app.useGlobalPipes(
//     new ValidationPipe({
//       whitelist: true,
//       forbidNonWhitelisted: true,
//       transform: true,
//       transformOptions: { enableImplicitConversion: true },
//     }),
//   );

//   // Prefix API
//   app.setGlobalPrefix('api/v1');

//   // Swagger
//   const config = new DocumentBuilder()
//     .setTitle('DataServ API')
//     .setDescription('API de gestion du service technique DataServ')
//     .setVersion('1.0')
//     .addBearerAuth()
//     .addTag('auth', 'Authentification')
//     .addTag('users', 'Utilisateurs')
//     .addTag('tickets', 'Tickets d\'intervention')
//     .addTag('clients', 'Clients')
//     .addTag('interventions', 'Fiches d\'intervention')
//     .addTag('rapports', 'Rapports et exports')
//     .addTag('dashboard', 'Tableau de bord')
//     .build();

//   const document = SwaggerModule.createDocument(app, config);
//   SwaggerModule.setup('api/docs', app, document, {
//     swaggerOptions: { persistAuthorization: true },
//   });

//   const port = configService.get('PORT', 3001);
//   await app.listen(port);
//   console.log(`🚀 DataServ API running on http://localhost:${port}`);
//   console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
// }

// bootstrap();

// import { NestFactory } from '@nestjs/core';
// import { ValidationPipe } from '@nestjs/common';
// import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
// import { ConfigService } from '@nestjs/config';
// import * as compression from 'compression';
// import helmet from 'helmet';
// import { NestExpressApplication } from '@nestjs/platform-express';
// import { join } from 'path';
// import { AppModule } from './app.module';

// async function bootstrap() {
//   const app = await NestFactory.create<NestExpressApplication>(AppModule, {
//     logger: ['error', 'warn', 'log'],
//   });

//   const configService = app.get(ConfigService);

//   // Servir les fichiers statiques (PDFs, uploads)
//   app.useStaticAssets(join(process.cwd(), 'uploads'), {
//     prefix: '/uploads',
//   });

//   // Sécurité
//   app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
//   app.use(compression());

//   // CORS
//   app.enableCors({
//     origin: configService.get('FRONTEND_URL', 'http://localhost:3000'),
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//   });

//   // Validation globale
//   app.useGlobalPipes(
//     new ValidationPipe({
//       whitelist: true,
//       forbidNonWhitelisted: true,
//       transform: true,
//       transformOptions: { enableImplicitConversion: true },
//     }),
//   );

//   // Prefix API
//   app.setGlobalPrefix('api/v1');

//   // Swagger
//   const config = new DocumentBuilder()
//     .setTitle('DataServ API')
//     .setDescription("API de gestion du service technique DataServ")
//     .setVersion('1.0')
//     .addBearerAuth()
//     .addTag('auth', 'Authentification')
//     .addTag('users', 'Utilisateurs')
//     .addTag('tickets', "Tickets d'intervention")
//     .addTag('clients', 'Clients')
//     .addTag('interventions', "Fiches d'intervention")
//     .addTag('rapports', 'Rapports et exports')
//     .addTag('dashboard', 'Tableau de bord')
//     .build();

//   const document = SwaggerModule.createDocument(app, config);
//   SwaggerModule.setup('api/docs', app, document, {
//     swaggerOptions: { persistAuthorization: true },
//   });

//   const port = configService.get('PORT', 3001);
//   await app.listen(port);
//   console.log(`🚀 DataServ API running on http://localhost:${port}`);
//   console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
// }

// bootstrap();

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as compression from 'compression';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const configService = app.get(ConfigService);

  // ── Fichiers statiques (PDFs uploadés) ───────────────────────────────────
  const uploadsPath = join(process.cwd(), 'uploads');
  app.useStaticAssets(uploadsPath, { prefix: '/uploads' });

  // ── Sécurité ──────────────────────────────────────────────────────────────
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(compression());

  // ── CORS ──────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ── Validation globale ────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── Prefix API ────────────────────────────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ── Swagger ───────────────────────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('DataServ API')
    .setDescription("API de gestion du service technique DataServ")
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentification')
    .addTag('users', 'Utilisateurs')
    .addTag('tickets', "Tickets d'intervention")
    .addTag('clients', 'Clients')
    .addTag('interventions', "Fiches d'intervention")
    .addTag('rapports', 'Rapports et exports')
    .addTag('dashboard', 'Tableau de bord')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = configService.get('PORT', 3001);
  await app.listen(port);
  console.log(`🚀 DataServ API running on http://localhost:${port}`);
  console.log(`📄 Uploads: http://localhost:${port}/uploads`);
  console.log(`📚 Swagger: http://localhost:${port}/api/docs`);
}

bootstrap();