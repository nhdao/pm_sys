import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService)

  const config = new DocumentBuilder()
    .setTitle('PM system')
    .setDescription('This is pm system documentation')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      in: 'header'
    }, 'token')
    .addSecurityRequirements('token')
    .build()
  
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      apisSorter:'alpha',
      operationsSorter: 'alpha',
      tagsSorter: (a: any, b: any) => {
        if (a === 'Auth') return -1
        if (b === 'Auth') return 1
        return a.localeCompare(b)
      },
      persistAuthorization: true
    }
  })

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      //This option strips out any field that not included in DTO
      whitelist: true 
    })
  )

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))

  app.use(cookieParser())

  await app.listen(configService.get<string>('PORT'));
}
bootstrap();
