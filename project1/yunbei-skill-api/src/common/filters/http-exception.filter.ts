import { ExceptionFilter, Catch, HttpException, ArgumentsHost } from '@nestjs/common'
import { Response } from 'express'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const status = exception.getStatus()
    const exceptionResponse = exception.getResponse()

    let message = '请求失败'
    if (typeof exceptionResponse === 'object' && exceptionResponse['message']) {
      message = Array.isArray(exceptionResponse['message'])
        ? exceptionResponse['message'][0]
        : exceptionResponse['message']
    } else if (typeof exceptionResponse === 'string') {
      message = exceptionResponse
    }

    response.status(status).json({
      code: status,
      message,
      data: null,
      timestamp: Date.now()
    })
  }
}