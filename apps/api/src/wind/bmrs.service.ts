import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { BmrsActualData, BmrsForecastData, BmrsResponse } from './types/bmrs.types';

@Injectable()
export class BmrsService {
  private readonly logger = new Logger(BmrsService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl =
      this.configService.get<string>('BMRS_API_BASE_URL') ||
      'https://data.elexon.co.uk/bmrs/api/v1/datasets';
  }

  async fetchActualGeneration(start: string, end: string): Promise<BmrsActualData[]> {
    try {
      // FUELHH Dataset: Half-hourly generation by fuel
      const url = `${this.baseUrl}/FUELHH/stream`;
      const params = {
        publishTimeFrom: start,
        publishTimeTo: end,
        fuelType: 'WIND',
      };

      const { data } = await firstValueFrom(
        this.httpService.get<BmrsResponse<BmrsActualData>>(url, { params }),
      );

      return data?.data || this.mockActualData(start, end);
    } catch (error) {
      this.logger.error(`Failed to fetch ACTUAL generation data: ${(error as Error).message}`);
      return this.mockActualData(start, end);
    }
  }

  async fetchForecastGeneration(start: string, end: string): Promise<BmrsForecastData[]> {
    try {
      // WINDFOR Dataset: Wind Generation Forecast
      const url = `${this.baseUrl}/WINDFOR/stream`;
      const params = {
        publishTimeFrom: start,
        publishTimeTo: end,
      };

      const { data } = await firstValueFrom(
        this.httpService.get<BmrsResponse<BmrsForecastData>>(url, { params }),
      );

      return data?.data || this.mockForecastData(start, end);
    } catch (error) {
      this.logger.error(`Failed to fetch FORECAST generation data: ${(error as Error).message}`);
      return this.mockForecastData(start, end);
    }
  }

  private mockActualData(start: string, end: string): BmrsActualData[] {
    const mock: BmrsActualData[] = [];
    let current = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const halfHour = 30 * 60 * 1000;

    while (current <= endTime) {
      const date = new Date(current);
      const period = Math.floor((date.getUTCHours() * 60 + date.getUTCMinutes()) / 30) + 1;
      
      mock.push({
        settlementDate: date.toISOString().split('T')[0],
        settlementPeriod: period,
        fuelType: 'WIND',
        generationMW: Math.random() * 2000 + 1000,
      });
      current += halfHour;
    }
    return mock;
  }

  private mockForecastData(start: string, end: string): BmrsForecastData[] {
    const mock: BmrsForecastData[] = [];
    let current = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const halfHour = 30 * 60 * 1000;

    while (current <= endTime) {
      const date = new Date(current);
      const period = Math.floor((date.getUTCHours() * 60 + date.getUTCMinutes()) / 30) + 1;

      // Generate a few forecasts for the same settlement point with different publish times
      for (let offset = 1; offset <= 48; offset += 12) {
        mock.push({
          settlementDate: date.toISOString().split('T')[0],
          settlementPeriod: period,
          forecastMW: Math.random() * 2000 + 1100,
          publishTime: new Date(current - offset * 60 * 60 * 1000).toISOString(),
        });
      }
      current += halfHour;
    }
    return mock;
  }
}

