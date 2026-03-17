import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WindModule } from './wind/wind.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), WindModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
