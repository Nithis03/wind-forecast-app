export interface WindDataPoint {
  time: string; // ISO 8601
  actual?: number; // Actual wind speed
  forecast: number | null; // Forecast wind speed
}
