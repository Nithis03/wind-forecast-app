export interface BmrsActualData {
  settlementDate: string;
  settlementPeriod: number;
  fuelType: string;
  generation: number;
  startTime: string;
}

export interface BmrsForecastData {
  settlementDate?: string;
  settlementPeriod?: number;
  generation: number;
  publishTime: string;
  startTime: string;
}

export type BmrsResponse<T> = T[];


