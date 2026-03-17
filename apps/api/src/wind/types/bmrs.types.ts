export interface BmrsActualData {
  settlementDate: string;
  settlementPeriod: number;
  fuelType: string;
  generationMW: number;
}

export interface BmrsForecastData {
  settlementDate: string;
  settlementPeriod: number;
  forecastMW: number;
  publishTime: string;
}

export interface BmrsResponse<T> {
  metadata: {
    dataset: string;
    publishTime?: string;
  };
  data: T[];
}

