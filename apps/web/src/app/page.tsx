'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { WindDataPoint } from 'shared';

export default function Home() {
  const [data, setData] = useState<WindDataPoint[]>([]);
  // Initialize state with localStorage values if available, otherwise defaults
  const [start, setStart] = useState<string>('');
  const [end, setEnd] = useState<string>('');
  const [horizon, setHorizon] = useState<number>(24);
  const [inputError, setInputError] = useState<string | null>(null);

  // Load from localStorage only on mount (client-side)
  useEffect(() => {
    const savedStart = localStorage.getItem('wind_start');
    const savedEnd = localStorage.getItem('wind_end');
    const savedHorizon = localStorage.getItem('wind_horizon');

    setStart(savedStart || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 16));
    setEnd(savedEnd || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16));
    if (savedHorizon) setHorizon(Number(savedHorizon));
  }, []);

  // Sync to localStorage and fetch data when inputs change
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
          console.error("Failed to fetch wind data");
          return;
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [start, end, horizon]);

  const stats = data.reduce(
    (acc, curr) => {
      if (curr.actual !== undefined) {
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

        {/* Metrics Panel */}
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

        <section className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Start Date</label>
            <input 
              type="datetime-local" 
              value={start} 
              onChange={(e) => setStart(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">End Date</label>
            <input 
              type="datetime-local" 
              value={end} 
              onChange={(e) => setEnd(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Forecast Horizon ({horizon} hrs)</label>
            <input 
              type="range" 
              min="0" 
              max="48" 
              value={horizon} 
              onChange={(e) => setHorizon(Number(e.target.value))}
              className="w-full mt-2"
            />
          </div>
        </section>

        <section className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 h-[500px]">
          <h2 className="text-lg font-semibold mb-6">Generation Prediction (MW) vs Actual</h2>
          {inputError ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-red-500 bg-red-50 rounded-lg border border-red-100 p-8 text-center">
              <svg className="w-12 h-12 mb-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-lg font-medium">{inputError}</p>
              <p className="text-sm text-red-400 mt-2">Please select valid dates to view the forecast.</p>
            </div>
          ) : data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                  dataKey="time" 
                  tickFormatter={(val) => new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis stroke="#9CA3AF" fontSize={12} unit=" MW" />
                <Tooltip 
                  labelFormatter={(val) => new Date(val).toLocaleString()}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any, name: string) => [
                    `${value} MW`, 
                    name === 'error' ? 'Forecast Error' : name === 'absError' ? 'Abs Error' : name
                  ]}
                />
                <Legend />
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
