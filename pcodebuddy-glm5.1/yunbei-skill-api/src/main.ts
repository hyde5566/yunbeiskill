import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { ResponseInterceptor } from './common/interceptors/response.interceptor'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'
import * as express from 'express'
import * as path from 'path'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  // 全局拦截器和过滤器
  app.useGlobalInterceptors(new ResponseInterceptor())
  app.useGlobalFilters(new HttpExceptionFilter())

  // CORS配置
  app.enableCors({
    origin: ['http://localhost:5211', 'http://localhost:5173'],
    credentials: true,
  })

  // 静态文件服务（上传的Zip包）
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

  // API前缀
  app.setGlobalPrefix('api')

  // Swagger文档
  const config = new DocumentBuilder()
    .setTitle('云贝Skill管理系统API')
    .setDescription('云贝Skill管理系统后端API文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api-docs', app, document)

  const port = process.env.PORT || 3000
  await app.listen(port)
  console.log(`Application is running on: http://localhost:${port}`)
  console.log(`Swagger docs: http://localhost:${port}/api-docs`)
}
bootstrap()
