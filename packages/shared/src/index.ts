export interface WindDataPoint {
  time: string; // ISO 8601
  actual?: number; // Actual wind power generation (MW)
  forecast: number | null; // Forecast wind power generation (MW)
  error: number | null; // forecast - actual
  absError: number | null; // Math.abs(error)
}
