import { Global, Module } from '@nestjs/common';
import { NotificationGateway } from './websocket.gateaway';

@Global()
@Module({
  providers: [NotificationGateway],
  exports: [NotificationGateway],
})
export class WebsocketModule {}
