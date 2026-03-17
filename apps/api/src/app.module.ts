import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WindModule } from './wind/wind.module';

@Module({
  imports: [WindModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
