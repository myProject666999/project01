import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    },
  });

  app.setGlobalPrefix('');
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  logger.log(`纺织厂织机产能采集系统后端已启动，端口: ${port}`);
  logger.log(`API文档: http://127.0.0.1:${port}/api/`);
}

bootstrap();
