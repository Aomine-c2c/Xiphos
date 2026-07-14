import React from "react";
import { Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { GlassCard } from "../ui/GlassCard";

interface ParameterChartsProps {
  history: any[];
}

export const ParameterCharts = React.memo(function ParameterCharts({ history }: ParameterChartsProps) {
  return (
    <div className="px-4 pb-2">
      <GlassCard className="p-3 shrink-0 h-40 flex flex-col overflow-hidden">
        <h3 className="text-[#94a3b8] tracking-widest text-[10px] uppercase mb-2 font-bold flex items-center gap-2 shrink-0">
          <Activity className="w-3 h-3 text-[#a78bfa]" /> Live Parameter Shifts
        </h3>
        
        <div className="flex-1 min-h-0 w-full flex gap-4">
          <div className="flex-1 h-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f0f1a', border: '1px solid #1e1e2e', fontSize: '10px' }}
                  itemStyle={{ fontSize: '10px' }}
                />
                <Line type="stepAfter" dataKey="sl_multiplier" stroke="#f87171" strokeWidth={2} dot={false} isAnimationActive={false} name="SL Multiplier" />
                <Line type="stepAfter" dataKey="lot_multiplier" stroke="#4ade80" strokeWidth={2} dot={false} isAnimationActive={false} name="Lot Multiplier" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex-1 h-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f0f1a', border: '1px solid #1e1e2e', fontSize: '10px' }}
                  itemStyle={{ fontSize: '10px' }}
                />
                <Line yAxisId="left" type="stepAfter" dataKey="fast_ema" stroke="#a78bfa" strokeWidth={2} dot={false} isAnimationActive={false} name="Fast EMA" />
                <Line yAxisId="right" type="monotone" dataKey="confidence_score" stroke="#06b6d4" strokeWidth={2} dot={false} isAnimationActive={false} name="Confidence" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </GlassCard>
    </div>
  );
});
