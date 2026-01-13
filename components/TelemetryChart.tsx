
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { HistoryPoint } from '../types';

interface Props {
  history: HistoryPoint[];
}

const TelemetryChart: React.FC<Props> = ({ history }) => {
  const data = history.map(h => ({
    time: h.time,
    health: h.metrics.health,
    entropy: h.metrics.entropy,
    coherence: h.metrics.coherence,
    recursion: h.metrics.recursion
  })).slice(-30);

  return (
    <div className="w-full h-64 font-mono text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorEntropy" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="time" hide />
          <YAxis domain={[0, 1]} stroke="#475569" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', color: '#f8fafc' }}
            itemStyle={{ color: '#94a3b8' }}
          />
          <Legend />
          <Area type="monotone" dataKey="health" stroke="#10b981" fillOpacity={1} fill="url(#colorHealth)" />
          <Area type="monotone" dataKey="entropy" stroke="#f43f5e" fillOpacity={1} fill="url(#colorEntropy)" />
          <Area type="monotone" dataKey="coherence" stroke="#38bdf8" fillOpacity={0} />
          <Area type="monotone" dataKey="recursion" stroke="#a855f7" fillOpacity={0} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TelemetryChart;
