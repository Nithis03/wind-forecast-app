import { Injectable } from '@nestjs/common';
import { WindDataPoint } from 'shared';
import axios from 'axios';

@Injectable()
export class WindService {
  async getWindData(start: string, end: string, horizon: number): Promise<WindDataPoint[]> {
    // In a real application, we would use axios or fetch to call an external API
    // e.g. const response = await axios.get(`https://api.externalwind.com/data?start=${start}&end=${end}`);
    
    const mockData: WindDataPoint[] = [];
    let currentTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const hourInMs = 60 * 60 * 1000;

    // Generate mock data up to `horizon` hours ahead
    while (currentTime <= endTime) {
      mockData.push({
        time: new Date(currentTime).toISOString(),
        actual: currentTime <= Date.now() ? Math.random() * 20 + 5 : undefined,
        forecast: Math.random() * 20 + 5,
      });
      currentTime += hourInMs;
    }

    // Apply the horizon limit (in hours) to the generated forecasts
    return mockData.slice(0, horizon || mockData.length);
  }
}
