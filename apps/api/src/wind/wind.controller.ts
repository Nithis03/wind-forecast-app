import { Controller, Get, Query } from '@nestjs/common';
import { WindService } from './wind.service';
import { GetWindDataDto } from './dto/get-wind-data.dto';

@Controller('wind-data')
export class WindController {
  constructor(private readonly windService: WindService) {}

  @Get()
  async getWindData(@Query() query: GetWindDataDto) {
    return this.windService.getWindData(query.start, query.end, query.horizon);
  }
}
