import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { ResponseInterceptor } from './common/interceptors/response.interceptor'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // 全局验证管道
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true
  }))

  // 全局拦截器和过滤器
  app.useGlobalInterceptors(new ResponseInterceptor())
  app.useGlobalFilters(new HttpExceptionFilter())

  // CORS配置
  app.enableCors({
    origin: ['http://localhost:5173'],
    credentials: true
  })

  // Swagger文档
  const config = new DocumentBuilder()
    .setTitle('云贝Skill管理系统API')
    .setDescription('API文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api-docs', app, document)

  await app.listen(3000)
  console.log('Application is running on: http://localhost:3000')
  console.log('Swagger docs: http://localhost:3000/api-docs')
}
bootstrap()