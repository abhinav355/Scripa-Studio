import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Eye, DollarSign, Award } from 'lucide-react';

interface RetentionChartProps {
  viralScore?: number;
}

export const RetentionChart: React.FC<RetentionChartProps> = ({ viralScore = 92 }) => {
  const data = [
    { time: '0s (Hook)', retention: 100 },
    { time: '3s (Hold)', retention: Math.min(98, viralScore) },
    { time: '10s (Story)', retention: Math.max(70, viralScore - 12) },
    { time: '30s (Value)', retention: Math.max(58, viralScore - 22) },
    { time: '60s (CTA)', retention: Math.max(45, viralScore - 32) },
  ];

  const estimatedViewsLow = Math.round(viralScore * 850);
  const estimatedViewsHigh = Math.round(viralScore * 4200);
  const estimatedAdEarnings = (estimatedViewsHigh / 1000 * 3.80).toFixed(2);

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-xl space-y-4 my-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center border border-amber-400/30">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">AI Audience Retention & Virality Analytics</h4>
            <p className="text-[10px] text-slate-400">Predicted viewer drop-off curve based on Hook & Pacing analysis</p>
          </div>
        </div>

        <span className="text-xs font-mono font-black bg-amber-400 text-slate-950 px-2.5 py-1 rounded-full">
          Score: {viralScore}%
        </span>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-mono">Predicted View Range</span>
          <span className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
            <Eye className="w-3 h-3" /> {estimatedViewsLow.toLocaleString()} - {estimatedViewsHigh.toLocaleString()}
          </span>
        </div>

        <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-mono">Est. Ad & Sponsor Rev</span>
          <span className="text-xs font-bold text-amber-300 flex items-center justify-center gap-1 mt-0.5">
            <DollarSign className="w-3 h-3" /> ${estimatedAdEarnings}
          </span>
        </div>

        <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-mono">3s Hold Rate</span>
          <span className="text-xs font-bold text-indigo-300 flex items-center justify-center gap-1 mt-0.5">
            <Award className="w-3 h-3" /> {Math.min(98, viralScore)}%
          </span>
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="h-32 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="retentionGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
            <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
              formatter={(value) => [`${value}% Audience Retention`, 'Retention']}
            />
            <Area type="monotone" dataKey="retention" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#retentionGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
