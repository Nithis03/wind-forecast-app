export interface WindDataPoint {
  time: string;
  actual: number | null;
  forecast: number | null;
  error: number | null;
  absError: number | null;
}
