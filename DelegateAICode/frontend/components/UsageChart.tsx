// UsageChart.tsx
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type UsageEntry = {
  date: string;
  total: number;
};

export default function UsageChart() {
  const [data, setData] = useState<UsageEntry[]>([]);

  useEffect(() => {
    fetch('/api/v1/ai/usage') // or your actual endpoint
      .then(res => res.json())
      .then(json => setData(json.usage.usageByDay || []))
      .catch(console.error);
  }, []);

  return (
    <div className="p-4 bg-white rounded-2xl shadow-md">
      <h2 className="text-xl font-semibold mb-4">Daily AI Usage</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}