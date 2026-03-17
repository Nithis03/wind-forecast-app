import { Module } from '@nestjs/common';
import { WindController } from './wind.controller';
import { WindService } from './wind.service';

@Module({
  controllers: [WindController],
  providers: [WindService]
})
export class WindModule {}
