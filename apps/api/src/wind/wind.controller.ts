import { Controller, Get, Query } from '@nestjs/common';
import { WindService } from './wind.service';

@Controller('wind-data')
export class WindController {
  constructor(private readonly windService: WindService) {}

  @Get()
  async getWindData(
    @Query('start') start: string,
    @Query('end') end: string,
    @Query('horizon') horizon: string,
  ) {
    if (!start || !end) {
      return { error: 'start and end parameters are required' };
    }
    const horizonHours = horizon ? parseInt(horizon, 10) : 48;
    return this.windService.getWindData(start, end, horizonHours);
  }
}
