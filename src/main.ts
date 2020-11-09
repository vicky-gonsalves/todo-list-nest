import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import { ValidationPipe } from './shared/pipe/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('TODO List API')
      .setDescription('TODO List API')
      .setVersion('1.0')
      .addTag('todo')
      .build(),
  );
  SwaggerModule.setup('docs', app, document);
  await app.listen(9000);
}

bootstrap();
