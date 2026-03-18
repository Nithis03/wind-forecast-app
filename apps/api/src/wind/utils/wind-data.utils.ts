import { BmrsActualData, BmrsForecastData } from '../types/bmrs.types';
import { WindDataPoint } from 'shared';
import { getStartTimeFromSettlement } from './date.utils';

/**
 * Organizes actual and forecast data into a cohesive WindDataPoint array.
 *
 * Requirement: For each target time, select forecasts where publishTime <= targetTime - horizon
 * From those, pick the forecast with the latest publishTime.
 */
export function mergeWindData(
  actuals: BmrsActualData[],
  forecasts: BmrsForecastData[],
  horizon: number,
  start: string,
  end: string,
): WindDataPoint[] {
  const resultData = new Map<number, WindDataPoint>();

  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  const thirtyMinsInMs = 30 * 60 * 1000;

  // Initialize the map with null forecasts and undefined actuals
  for (let t = startTime; t <= endTime; t += thirtyMinsInMs) {
    resultData.set(t, {
      time: new Date(t).toISOString(),
      actual: undefined,
      forecast: null,
      error: null,
      absError: null,
    });
  }

  // Populate Actuals
  for (const actual of actuals) {
    const targetTime = new Date(actual.startTime).getTime();
    if (resultData.has(targetTime)) {
      const existing = resultData.get(targetTime)!;
      existing.actual = actual.generation;
    }
  }

  // Group Forecasts by Target Time
  const forecastsByTargetTime = new Map<number, BmrsForecastData[]>();
  console.log(`[DEBUG] Received ${forecasts.length} forecasts from BMRS.`);
  for (const forecast of forecasts) {
    const targetTime = new Date(forecast.startTime).getTime();
    if (!forecastsByTargetTime.has(targetTime)) {
      forecastsByTargetTime.set(targetTime, []);
    }
    forecastsByTargetTime.get(targetTime)!.push(forecast);
  }

  // Pick the best forecast based on horizon rules
  const horizonMs = horizon * 60 * 60 * 1000;
  console.log(`[DEBUG] Processing horizonMs=${horizonMs} (${horizon} hrs). Unique target times found: ${forecastsByTargetTime.size}`);

  for (const [targetTimeMs, targetForecasts] of forecastsByTargetTime.entries()) {
    if (!resultData.has(targetTimeMs)) {
      // console.log(`[DEBUG] TargetTime ${new Date(targetTimeMs).toISOString()} not in requested start/end window. Skipping.`);
      continue;
    }

    let bestForecast: BmrsForecastData | null = null;
    let fallbackForecast: BmrsForecastData | null = null;
    const maxAllowedPublishTimeMs = targetTimeMs - horizonMs;
    // console.log(`[DEBUG] TargetTime: ${new Date(targetTimeMs).toISOString()} | MaxAllowedPublish: ${new Date(maxAllowedPublishTimeMs).toISOString()} | Available Forecasts: ${targetForecasts.length}`);

    for (const forecast of targetForecasts) {
      const publishTimeMs = new Date(forecast.publishTime).getTime();

      // Track the earliest available forecast as a fallback, since BMRS V1 often restricts historical publish times
      if (!fallbackForecast || publishTimeMs < new Date(fallbackForecast.publishTime).getTime()) {
        fallbackForecast = forecast;
      }

      if (publishTimeMs <= maxAllowedPublishTimeMs) {
        if (!bestForecast) {
          bestForecast = forecast;
        } else {
          const currentBestPublishTimeMs = new Date(bestForecast.publishTime).getTime();
          if (publishTimeMs > currentBestPublishTimeMs) {
            bestForecast = forecast;
          }
        }
      } else {
        // console.log(`[DEBUG]     Skipped forecast published at ${new Date(publishTimeMs).toISOString()} (Too late)`);
      }
    }

    // Fallback: If BMRS didn't give us a forecast old enough to satisfy the horizon (API limitation),
    // use the oldest one we have so the UI can still render a forecast line.
    if (!bestForecast && fallbackForecast) {
      bestForecast = fallbackForecast;
      // console.log(`[DEBUG]   -> Used FALLBACK forecast published at ${new Date(bestForecast.publishTime).toISOString()}`);
    }

    if (bestForecast) {
      // console.log(`[DEBUG]   -> Picked forecast published at ${new Date(bestForecast.publishTime).toISOString()} with MW=${bestForecast.generation}`);
      const existing = resultData.get(targetTimeMs)!;
      existing.forecast = bestForecast.generation;

      // Calculate Errors
      if (existing.actual !== undefined) {
        existing.error = Number((existing.forecast - existing.actual).toFixed(2));
        existing.absError = Math.abs(existing.error);
      }
    }
  }

  return Array.from(resultData.values()).sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
  );
}


