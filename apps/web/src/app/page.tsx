'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { WindDataPoint } from 'shared';

export default function Home() {
  const [data, setData] = useState<WindDataPoint[]>([]);
  const [start, setStart] = useState<string>(
    new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [end, setEnd] = useState<string>(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [horizon, setHorizon] = useState<number>(24);

  useEffect(() => {
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

  return (
    <main className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Wind Forecast Monitoring</h1>
          <p className="text-gray-500 mt-2">View actual and forecasted wind metrics.</p>
        </header>

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
          <h2 className="text-lg font-semibold mb-6">Wind Speed Prediction vs Actual</h2>
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                  dataKey="time" 
                  tickFormatter={(val) => new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  labelFormatter={(val) => new Date(val).toLocaleString()}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Line type="monotone" dataKey="actual" stroke="#3B82F6" strokeWidth={3} dot={false} name="Actual (m/s)" />
                <Line type="monotone" dataKey="forecast" stroke="#10B981" strokeWidth={3} strokeDasharray="5 5" dot={false} name="Forecast (m/s)" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Loading wind metrics or no data available for selected range...
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
