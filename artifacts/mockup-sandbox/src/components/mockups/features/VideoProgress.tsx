import { Play, Clock, Eye, Heart, Lock, CheckCircle, BookOpen } from "lucide-react";

const videos = [
  { id: 1, title: "Quadratic Equations — Completing the Square", grade: "Grade 11", topic: "Algebra", duration: "18:42", views: 1240, tier: "Standard", progress: 100, thumbnail: null },
  { id: 2, title: "Trigonometric Identities & Proofs", grade: "Grade 12", topic: "Trigonometry", duration: "24:15", views: 980, tier: "Premium", progress: 65, thumbnail: null },
  { id: 3, title: "Functions — Domain and Range", grade: "Grade 10", topic: "Functions", duration: "15:30", views: 2100, tier: "Standard", progress: 0, thumbnail: null },
  { id: 4, title: "Calculus — Introduction to Differentiation", grade: "Grade 12", topic: "Calculus", duration: "31:08", views: 760, tier: "Premium", progress: 30, thumbnail: null },
];

const gradeColors: Record<string, string> = {
  "Grade 10": "from-emerald-500 to-teal-500",
  "Grade 11": "from-blue-500 to-indigo-500",
  "Grade 12": "from-violet-500 to-purple-600",
};

function ProgressRing({ pct }: { pct: number }) {
  const r = 16;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width="40" height="40" className="flex-shrink-0 -rotate-90">
      <circle cx="20" cy="20" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
      <circle
        cx="20" cy="20" r={r} fill="none"
        stroke={pct === 100 ? "#10b981" : pct > 0 ? "#7c3aed" : "transparent"}
        strokeWidth="3"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        style={{ filter: pct > 0 ? "drop-shadow(0 0 4px rgba(124,58,237,0.5))" : "none" }}
      />
      {pct === 100 && (
        <g transform="rotate(90, 20, 20)">
          <text x="20" y="24" textAnchor="middle" fontSize="10" fill="#10b981" fontWeight="bold">✓</text>
        </g>
      )}
      {pct > 0 && pct < 100 && (
        <g transform="rotate(90, 20, 20)">
          <text x="20" y="24" textAnchor="middle" fontSize="8" fill="#a78bfa" fontWeight="700">{pct}%</text>
        </g>
      )}
    </svg>
  );
}

export function VideoProgress() {
  return (
    <div className="min-h-screen p-6" style={{ background: "#080d1a" }}>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-1" style={{ fontFamily: "'Orbitron',sans-serif" }}>My Learning Progress</h2>
          <p className="text-sm text-slate-500">Track your watch progress across all lessons</p>
        </div>

        {/* Summary bar */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Completed", value: 1, color: "#10b981", icon: CheckCircle },
            { label: "In Progress", value: 2, color: "#7c3aed", icon: Play },
            { label: "Not Started", value: 1, color: "#475569", icon: BookOpen },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
              <span className="text-xl font-bold text-white">{s.value}</span>
              <span className="text-xs text-slate-500">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Video cards with progress */}
        <div className="space-y-3">
          {videos.map((v) => {
            const color = gradeColors[v.grade] || "from-slate-500 to-slate-600";
            const isComplete = v.progress === 100;
            const inProgress = v.progress > 0 && v.progress < 100;
            return (
              <div
                key={v.id}
                className="group flex items-center gap-4 p-4 rounded-2xl transition-all cursor-pointer"
                style={{
                  background: isComplete ? "rgba(16,185,129,0.05)" : "rgba(255,255,255,0.03)",
                  border: isComplete ? "1px solid rgba(16,185,129,0.2)" : inProgress ? "1px solid rgba(124,58,237,0.2)" : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {/* Thumbnail */}
                <div className="relative w-24 h-14 rounded-xl overflow-hidden flex-shrink-0">
                  <div className={`w-full h-full bg-gradient-to-br ${color} flex items-center justify-center`}>
                    {v.tier === "Premium" && (
                      <Lock className="w-4 h-4 text-white/60" />
                    )}
                    {v.tier !== "Premium" && <Play className="w-4 h-4 text-white/60" />}
                  </div>
                  {/* Progress bar overlay */}
                  {v.progress > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1.5" style={{ background: "rgba(0,0,0,0.5)" }}>
                      <div
                        className="h-full"
                        style={{
                          width: `${v.progress}%`,
                          background: isComplete ? "#10b981" : "linear-gradient(90deg,#7c3aed,#22d3ee)",
                        }}
                      />
                    </div>
                  )}
                  {/* Premium badge */}
                  {v.tier === "Premium" && (
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md text-xs font-bold text-white" style={{ background: "rgba(245,158,11,0.9)" }}>
                      PRO
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full text-white bg-gradient-to-r ${color}`}>{v.grade}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full text-slate-400" style={{ background: "rgba(255,255,255,0.06)" }}>{v.topic}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white line-clamp-1 mb-1.5">{v.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{v.duration}</span>
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{v.views.toLocaleString()}</span>
                    {isComplete && <span className="flex items-center gap-1 text-emerald-400 font-medium"><CheckCircle className="w-3 h-3" />Complete</span>}
                    {inProgress && <span className="text-violet-400 font-medium">{v.progress}% watched</span>}
                    {v.progress === 0 && <span className="text-slate-600">Not started</span>}
                  </div>
                </div>

                {/* Ring + heart */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <ProgressRing pct={v.progress} />
                  <button className="p-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <Heart className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-6 p-4 rounded-2xl text-center" style={{ background: "linear-gradient(135deg,rgba(124,58,237,0.15),rgba(37,99,235,0.15))", border: "1px solid rgba(124,58,237,0.2)" }}>
          <p className="text-sm text-slate-300 mb-2">Progress saves automatically as you watch</p>
          <p className="text-xs text-slate-600">Pick up exactly where you left off, on any device</p>
        </div>
      </div>
    </div>
  );
}
