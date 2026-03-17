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

  // Initialize the map with null forecasts and undefined actuals for the time window
  // Step through in 30-minute intervals (settlement periods)
  for (let t = startTime; t <= endTime; t += thirtyMinsInMs) {
    resultData.set(t, {
      time: new Date(t).toISOString(),
      actual: undefined,
      forecast: null,
    });
  }

  // Populate Actuals
  for (const actual of actuals) {
    const targetDate = getStartTimeFromSettlement(actual.settlementDate, actual.settlementPeriod);
    const targetTime = targetDate.getTime();
    if (resultData.has(targetTime)) {
      const existing = resultData.get(targetTime)!;
      existing.actual = actual.generationMW;
    }
  }

  // Group Forecasts by Target Time
  const forecastsByTargetTime = new Map<number, BmrsForecastData[]>();
  for (const forecast of forecasts) {
    const targetTime = getStartTimeFromSettlement(
      forecast.settlementDate,
      forecast.settlementPeriod,
    ).getTime();
    if (!forecastsByTargetTime.has(targetTime)) {
      forecastsByTargetTime.set(targetTime, []);
    }
    forecastsByTargetTime.get(targetTime)!.push(forecast);
  }

  // Pick the best forecast based on horizon rules
  // Rule: publishTime <= targetTime - (horizon hours)
  // Tie-breaker: latest publishTime
  for (const [targetTimeMs, targetForecasts] of forecastsByTargetTime.entries()) {
    if (!resultData.has(targetTimeMs)) continue;

    let bestForecast: BmrsForecastData | null = null;
    const horizonMs = horizon * 60 * 60 * 1000;
    const maxAllowedPublishTimeMs = targetTimeMs - horizonMs;

    for (const forecast of targetForecasts) {
      const publishTimeMs = new Date(forecast.publishTime).getTime();

      // Enforce: publishTime <= targetTime - horizon
      if (publishTimeMs <= maxAllowedPublishTimeMs) {
        if (!bestForecast) {
          bestForecast = forecast;
        } else {
          // latest publish time wins
          const currentBestPublishTimeMs = new Date(bestForecast.publishTime).getTime();
          if (publishTimeMs > currentBestPublishTimeMs) {
            bestForecast = forecast;
          }
        }
      }
    }

    if (bestForecast) {
      const existing = resultData.get(targetTimeMs)!;
      existing.forecast = bestForecast.forecastMW;
    }
  }

  // Return sorted array
  return Array.from(resultData.values()).sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
  );
}

