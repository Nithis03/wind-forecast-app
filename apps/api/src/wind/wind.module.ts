import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WindController } from './wind.controller';
import { WindService } from './wind.service';
import { BmrsService } from './bmrs.service';

@Module({
  imports: [HttpModule],
  controllers: [WindController],
  providers: [WindService, BmrsService],
})
export class WindModule {}
