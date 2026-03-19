'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { WindDataPoint } from 'shared';

export default function Home() {
  const [data, setData] = useState<WindDataPoint[]>([]);
  const [start, setStart] = useState<string>('');
  const [end, setEnd] = useState<string>('');
  const [horizon, setHorizon] = useState<number>(24);
  const [inputError, setInputError] = useState<string | null>(null);

  useEffect(() => {
    const savedStart = localStorage.getItem('wind_start');
    const savedEnd = localStorage.getItem('wind_end');
    const savedHorizon = localStorage.getItem('wind_horizon');

    setStart(savedStart || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 16));
    setEnd(savedEnd || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16));
    if (savedHorizon) setHorizon(Number(savedHorizon));
  }, []);

  useEffect(() => {
    if (!start || !end) {
      setInputError("Please select both a Start Date and an End Date.");
      setData([]);
      return;
    }
    
    setInputError(null);
    localStorage.setItem('wind_start', start);
    localStorage.setItem('wind_end', end);
    localStorage.setItem('wind_horizon', horizon.toString());

    const fetchData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const res = await fetch(`${apiUrl}/wind-data?start=${start}&end=${end}&horizon=${horizon}`);
        if (!res.ok) {
          return;
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        // Silently handle error as UI will show 'no data' or preserve last state
      }
    };
    fetchData();
  }, [start, end, horizon]);

  const stats = data.reduce(
    (acc, curr) => {
      if (curr.actual !== null) {
        acc.count++;
        acc.sumActual += curr.actual;
        if (curr.forecast !== null) {
          acc.sumForecast += curr.forecast;
          acc.sumAbsError += curr.absError ?? 0;
          acc.errorCount++;
        }
      }
      return acc;
    },
    { sumActual: 0, sumForecast: 0, sumAbsError: 0, count: 0, errorCount: 0 }
  );

  const mae = stats.errorCount > 0 ? (stats.sumAbsError / stats.errorCount).toFixed(2) : 'N/A';
  const avgActual = stats.count > 0 ? (stats.sumActual / stats.count).toFixed(2) : 'N/A';

  return (
    <main className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Wind Power Generation Monitoring</h1>
          <p className="text-gray-500 mt-2">Analyze actual vs forecasted generation (MW) from BMRS.</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Mean Absolute Error (MAE)</h3>
            <p className="text-2xl font-bold mt-2 text-blue-600">{mae} <span className="text-sm font-normal text-gray-400">MW</span></p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Avg Actual Generation</h3>
            <p className="text-2xl font-bold mt-2 text-green-600">{avgActual} <span className="text-sm font-normal text-gray-400">MW</span></p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Forecast Horizon</h3>
            <p className="text-2xl font-bold mt-2 text-purple-600">{horizon} <span className="text-sm font-normal text-gray-400">Hours</span></p>
          </div>
        </section>

        <section className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="flex flex-col gap-2 shadow-sm p-3 rounded-lg border border-gray-50">
            <label className="text-sm font-semibold text-gray-700">Start Time:</label>
            <input 
              type="datetime-local" 
              value={start} 
              onChange={(e) => setStart(e.target.value)}
              className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>
          <div className="flex flex-col gap-2 shadow-sm p-3 rounded-lg border border-gray-50">
            <label className="text-sm font-semibold text-gray-700">End Time:</label>
            <input 
              type="datetime-local" 
              value={end} 
              onChange={(e) => setEnd(e.target.value)}
              className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>
          <div className="flex flex-col gap-2 shadow-sm p-3 rounded-lg border border-gray-50">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-gray-700">Forecast Horizon:</label>
              <span className="text-sm font-bold text-blue-600">{horizon}h</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="48" 
              value={horizon} 
              onChange={(e) => setHorizon(Number(e.target.value))}
              className="w-full mt-2 accent-blue-600 cursor-pointer"
            />
          </div>
        </section>

        <section className="p-4 md:p-6 bg-white rounded-xl shadow-sm border border-gray-100 h-[850px] md:h-[600px]">
          <h2 className="text-lg font-semibold mb-4 md:mb-6">Wind Power Generation: Actual vs Forecasted (MW)</h2>
          {inputError ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-amber-700 bg-amber-50 rounded-lg border border-amber-100 p-8 text-center">
              <svg className="w-12 h-12 mb-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-lg font-medium">{inputError}</p>
              <p className="text-sm text-amber-600 mt-2">Please select valid dates to view the forecast.</p>
            </div>
          ) : data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 100 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis 
                  dataKey="time" 
                  tickFormatter={(val) => {
                    const d = new Date(val);
                    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                    const dateStr = d.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: '2-digit' });
                    return `${timeStr} ${dateStr}`;
                  }}
                  stroke="#9CA3AF"
                  fontSize={10}
                  height={60}
                  minTickGap={30}
                  label={{ value: 'Target Time End (UTC)', position: 'insideBottom', offset: -20, fontSize: 14, fontWeight: 600, fill: '#4B5563' }}
                />
                <YAxis 
                  stroke="#9CA3AF" 
                  fontSize={11}
                  tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                  label={{ value: 'Power (MW)', angle: -90, position: 'insideLeft', offset: -5, fontSize: 14, fontWeight: 600, fill: '#4B5563' }}
                />
                <Tooltip 
                  labelFormatter={(val) => new Date(val).toLocaleString()}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any, name: string) => [
                    `${value} MW`, 
                    name === 'error' ? 'Forecast Error' : name === 'absError' ? 'Abs Error' : name
                  ]}
                />
                <Legend verticalAlign="bottom" height={50} wrapperStyle={{ paddingTop: '50px' }} />
                <Line type="monotone" dataKey="actual" stroke="#3B82F6" strokeWidth={3} dot={false} name="Actual Generation" connectNulls={true} />
                <Line type="monotone" dataKey="forecast" stroke="#10B981" strokeWidth={3} dot={false} name="Forecasted Output" connectNulls={true} />
                <Line type="monotone" dataKey="error" stroke="#EF4444" strokeWidth={2} dot={true} name="Error" connectNulls={true} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Loading generation metrics or no data available for selected range...
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
