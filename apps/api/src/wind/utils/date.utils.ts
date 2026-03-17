export function parseAndTruncateToHour(isoString: string): Date {
  const date = new Date(isoString);
  date.setMinutes(0, 0, 0);
  return date;
}

export function isAfterOrEqual(date1: Date, date2: Date): boolean {
  return date1.getTime() >= date2.getTime();
}

export function getHoursDifference(date1: Date, date2: Date): number {
  return (date1.getTime() - date2.getTime()) / (1000 * 60 * 60);
}

export function getStartTimeFromSettlement(dateString: string, period: number): Date {
  const date = new Date(dateString);
  // Period 1 is 00:00, Period 2 is 00:30, etc.
  const minutesOffset = (period - 1) * 30;
  date.setUTCMinutes(date.getUTCMinutes() + minutesOffset);
  return date;
}

export function isValidStartDate(dateString: string): boolean {
  const date = new Date(dateString);
  // Requirement: Only consider data from January 2025 onwards.
  const jan2025 = new Date('2025-01-01T00:00:00Z');
  return date.getTime() >= jan2025.getTime();
}

