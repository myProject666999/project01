import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException, ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { AppModule } from './app.module';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    console.error('[' + request.method + '] ' + request.url, exception);

    const status = exception instanceof BadRequestException ? exception.getStatus() : 500;
    const message = exception instanceof Error ? exception.message : 'Internal server error';
    const stack = exception instanceof Error ? exception.stack : '';

    response.status(status).json({
      statusCode: status,
      message: message,
      stack: stack,
    });
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(3000);
}
bootstrap();
