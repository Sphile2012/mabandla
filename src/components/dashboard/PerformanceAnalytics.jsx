import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend, PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, BarChart2, PieChart as PieIcon } from 'lucide-react';

const COLORS = ['#7c3aed', '#6d28d9', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  );
};

export default function PerformanceAnalytics({ videos = [], favorites = [], user }) {
  // Topic breakdown: lessons per topic with views
  const topicData = useMemo(() => {
    const map = {};
    videos.forEach(v => {
      const t = v.topic || 'Other';
      if (!map[t]) map[t] = { topic: t, lessons: 0, views: 0 };
      map[t].lessons += 1;
      map[t].views += v.views || 0;
    });
    return Object.values(map).sort((a, b) => b.lessons - a.lessons).slice(0, 8);
  }, [videos]);

  // Tier breakdown for pie chart
  const tierData = useMemo(() => {
    const standard = videos.filter(v => v.tier === 'Standard').length;
    const premium = videos.filter(v => v.tier === 'Premium').length;
    return [
      { name: 'Standard', value: standard },
      { name: 'Premium', value: premium },
    ].filter(d => d.value > 0);
  }, [videos]);

  // Weekly engagement: simulate from video created_dates (videos added per week, last 8 weeks)
  const weeklyData = useMemo(() => {
    const now = new Date();
    const weeks = Array.from({ length: 8 }, (_, i) => {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (7 * (7 - i)));
      const label = `W${i + 1}`;
      const count = videos.filter(v => {
        const d = new Date(v.created_date);
        return d >= weekStart && d < new Date(weekStart.getTime() + 7 * 86400000);
      }).length;
      return { week: label, 'New Lessons': count };
    });
    return weeks;
  }, [videos]);

  const favPercent = videos.length > 0 ? Math.round((favorites.length / videos.length) * 100) : 0;
  const totalViews = videos.reduce((s, v) => s + (v.views || 0), 0);

  if (videos.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400 shadow-sm">
        <BarChart2 className="w-10 h-10 mx-auto mb-3 text-slate-300" />
        <p className="text-sm">No analytics data yet. Lessons will appear here once your grade has content.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-violet-600" />
        <h2 className="font-semibold text-slate-800 text-lg">Performance Analytics</h2>
      </div>

      {/* Summary chips */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Views', value: totalViews },
          { label: 'Favourited', value: `${favPercent}%` },
          { label: 'Topics', value: topicData.length },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-100 p-3 text-center shadow-sm">
            <p className="text-xl font-bold text-violet-600">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Lessons by Topic - Bar Chart */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 className="w-4 h-4 text-violet-500" />
          <h3 className="font-semibold text-slate-700 text-sm">Lessons by Topic</h3>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={topicData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis dataKey="topic" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="lessons" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Lessons" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* New lessons over time - Line Chart */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-violet-500" />
            <h3 className="font-semibold text-slate-700 text-sm">New Lessons Over Time</h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={weeklyData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone" dataKey="New Lessons"
                stroke="#7c3aed" strokeWidth={2}
                dot={{ r: 3, fill: '#7c3aed' }} activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Tier split - Pie Chart */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <PieIcon className="w-4 h-4 text-violet-500" />
            <h3 className="font-semibold text-slate-700 text-sm">Content by Tier</h3>
          </div>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="60%" height={160}>
              <PieChart>
                <Pie data={tierData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                  {tierData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2">
              {tierData.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <div>
                    <p className="text-xs font-medium text-slate-700">{d.name}</p>
                    <p className="text-xs text-slate-400">{d.value} lessons</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}