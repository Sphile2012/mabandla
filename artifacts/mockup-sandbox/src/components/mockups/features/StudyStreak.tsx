import { Flame, Zap, Trophy, Calendar, Star, TrendingUp } from "lucide-react";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const streakData = [true, true, true, true, false, true, true];
const today = 6;

function StreakBadge({ count, label, color }: { count: number; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1 px-4 py-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <span className="text-2xl font-black" style={{ color }}>{count}</span>
      <span className="text-xs text-slate-500 font-medium">{label}</span>
    </div>
  );
}

export function StudyStreak() {
  const currentStreak = 6;
  const longestStreak = 14;
  const totalDays = 42;
  const xpThisWeek = 350;

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#080d1a" }}>
      <div className="w-full max-w-md space-y-4">

        {/* Main streak card */}
        <div className="relative overflow-hidden rounded-3xl p-6" style={{ background: "linear-gradient(135deg, #1a0a3e 0%, #0a1628 100%)", border: "1px solid rgba(124,58,237,0.3)" }}>
          {/* Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full blur-3xl" style={{ background: "rgba(124,58,237,0.25)" }} />

          <div className="relative flex items-center justify-between mb-6">
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">Current Streak</p>
              <div className="flex items-end gap-2">
                <span className="text-6xl font-black text-white" style={{ fontFamily: "'Orbitron', sans-serif" }}>{currentStreak}</span>
                <span className="text-2xl text-slate-400 font-bold mb-2">days</span>
              </div>
            </div>
            <div className="relative">
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)", boxShadow: "0 0 40px rgba(245,158,11,0.5)" }}>
                <Flame className="w-10 h-10 text-white" fill="white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-400 flex items-center justify-center">
                <span className="text-xs font-bold text-white">✓</span>
              </div>
            </div>
          </div>

          {/* Weekly calendar */}
          <div className="grid grid-cols-7 gap-1.5 mb-4">
            {days.map((day, i) => (
              <div key={day} className="flex flex-col items-center gap-1.5">
                <span className="text-xs text-slate-600 font-medium">{day}</span>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                  style={{
                    background: streakData[i]
                      ? i === today
                        ? "linear-gradient(135deg, #f59e0b, #ef4444)"
                        : "rgba(124,58,237,0.4)"
                      : "rgba(255,255,255,0.04)",
                    border: i === today
                      ? "2px solid rgba(245,158,11,0.8)"
                      : streakData[i]
                        ? "1px solid rgba(124,58,237,0.5)"
                        : "1px solid rgba(255,255,255,0.06)",
                    boxShadow: i === today ? "0 0 16px rgba(245,158,11,0.4)" : "none"
                  }}
                >
                  {streakData[i]
                    ? <Star className="w-3.5 h-3.5 text-white" fill={i === today ? "white" : "rgba(255,255,255,0.8)"} />
                    : <span className="w-1.5 h-1.5 rounded-full bg-slate-700 block" />
                  }
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-slate-500">Keep going! You&apos;re on fire 🔥</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <StreakBadge count={longestStreak} label="Best Streak" color="#f59e0b" />
          <StreakBadge count={totalDays} label="Total Days" color="#a78bfa" />
          <StreakBadge count={xpThisWeek} label="XP This Week" color="#22d3ee" />
        </div>

        {/* XP progress to next milestone */}
        <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(34,211,238,0.15)" }}>
                <Trophy className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <span className="text-sm font-semibold text-white">Next milestone: 7-Day Streak</span>
            </div>
            <span className="text-xs text-violet-400 font-bold">+150 XP</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div className="h-full rounded-full" style={{ width: "86%", background: "linear-gradient(90deg, #7c3aed, #22d3ee)", boxShadow: "0 0 8px rgba(34,211,238,0.4)" }} />
          </div>
          <p className="text-right text-xs text-slate-600 mt-1.5">6 / 7 days</p>
        </div>

        {/* Motivation */}
        <div className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: "rgba(34,211,238,0.05)", border: "1px solid rgba(34,211,238,0.15)" }}>
          <Zap className="w-5 h-5 text-cyan-400 flex-shrink-0" />
          <p className="text-sm text-slate-300">Study <span className="text-cyan-400 font-semibold">1 more day</span> to unlock your 7-Day Streak badge!</p>
        </div>

        {/* Leaderboard rank */}
        <div className="flex items-center justify-between p-3 rounded-2xl" style={{ background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.15)" }}>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-violet-400" />
            <span className="text-sm text-slate-300">You&apos;re in <span className="text-violet-300 font-bold">Top 10%</span> this week</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: "rgba(167,139,250,0.2)" }}>
            <Calendar className="w-3 h-3 text-violet-400" />
            <span className="text-xs text-violet-300 font-semibold">Rank #4</span>
          </div>
        </div>
      </div>
    </div>
  );
}
