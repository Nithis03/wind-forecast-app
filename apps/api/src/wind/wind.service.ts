import { Injectable, BadRequestException } from '@nestjs/common';
import { WindDataPoint } from 'shared';
import { BmrsService } from './bmrs.service';
import { isValidStartDate } from './utils/date.utils';
import { mergeWindData } from './utils/wind-data.utils';

@Injectable()
export class WindService {
  constructor(private readonly bmrsService: BmrsService) {}

  async getWindData(
    start: string,
    end: string,
    horizon: number,
  ): Promise<WindDataPoint[]> {
    if (!isValidStartDate(start)) {
      throw new BadRequestException(
        'Data can only be queried from January 2025 onwards.',
      );
    }
    // Calculate an expanded publish window for forecasts
    // We must query forecasts that were *published* before the target start time
    // Adding an extra 48h buffer ensures we catch the most recent valid forecast
    const horizonMs = horizon * 60 * 60 * 1000;
    const publishStartMs = new Date(start).getTime() - horizonMs - (48 * 60 * 60 * 1000);
    const publishStart = new Date(publishStartMs).toISOString().split('.')[0] + 'Z';

    // Ensure `end` is formatted similarly if it's parsed (though frontend provides YYYY-MM-DDTHH:mm)
    const endFormatted = end.includes('Z') ? end.split('.')[0] + 'Z' : new Date(new Date(end).getTime()).toISOString().split('.')[0] + 'Z';
    const startFormatted = start.includes('Z') ? start.split('.')[0] + 'Z' : new Date(new Date(start).getTime()).toISOString().split('.')[0] + 'Z';

    // Execute API requests to BMRS concurrently
    const [actuals, forecasts] = await Promise.all([
      this.bmrsService.fetchActualGeneration(startFormatted, endFormatted),
      this.bmrsService.fetchForecastGeneration(publishStart, endFormatted),
    ]);



    // Format, sort, limit horizon, and merge into WindDataPoint array
    return mergeWindData(actuals, forecasts, horizon, start, end);
  }
}
