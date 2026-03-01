import { Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch()
export class WsExceptionFilter extends BaseWsExceptionFilter {
  private readonly logger = new Logger(WsExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<Socket>();

    const error =
      exception instanceof WsException
        ? exception.getError()
        : exception instanceof Error
          ? exception.message
          : 'Internal server error';

    const message = typeof error === 'string' ? error : JSON.stringify(error);

    this.logger.error(`WebSocket error: ${message}`, exception instanceof Error ? exception.stack : undefined);

    client.emit('chat:error', {
      error: message,
      code: exception instanceof WsException ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR',
    });
  }
}
