import { Star, CheckCircle, Quote, ArrowRight, Users, BookOpen, Zap } from "lucide-react";

const testimonials = [
  {
    name: "Sipho Dlamini",
    grade: "Grade 12",
    text: "Prince Math Academy helped me go from 45% to 82% in Mathematics. The video explanations are incredibly clear!",
    stars: 5,
    avatar: "SD",
    color: "from-violet-500 to-purple-600",
  },
  {
    name: "Naledi Mokoena",
    grade: "Grade 11",
    text: "I was struggling with Trigonometry but after watching the lessons twice I finally understand it. Best investment ever.",
    stars: 5,
    avatar: "NM",
    color: "from-blue-500 to-indigo-500",
  },
  {
    name: "Teboho Khumalo",
    grade: "Grade 10",
    text: "The way Prince explains Algebra makes it so simple. I actually look forward to Math now!",
    stars: 5,
    avatar: "TK",
    color: "from-emerald-500 to-teal-500",
  },
];

const steps = [
  { n: "01", title: "Sign Up Free", desc: "Create your account and start your 3-day trial instantly — no credit card needed.", icon: Users, color: "#7c3aed" },
  { n: "02", title: "Choose Your Grade", desc: "Select Grade 10, 11, or 12 and get personalised lesson recommendations.", icon: BookOpen, color: "#2563eb" },
  { n: "03", title: "Watch & Learn", desc: "Stream video lessons anytime, take notes, track your progress and earn XP.", icon: Zap, color: "#22d3ee" },
];

function StarRow({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: n }).map((_, i) => (
        <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
      ))}
    </div>
  );
}

export function HomeUpgrade() {
  return (
    <div style={{ background: "#080d1a", fontFamily: "'Inter',sans-serif" }}>

      {/* ── How It Works ── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-4" style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", color: "#c4b5fd" }}>
            ✦ Simple & Effective
          </div>
          <h2 className="text-3xl font-black text-white mb-3" style={{ fontFamily: "'Orbitron',sans-serif", textShadow: "0 0 20px rgba(124,58,237,0.3)" }}>
            How It Works
          </h2>
          <p className="text-slate-400 max-w-md mx-auto">Three simple steps to mastering Grade 10–12 Mathematics</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="relative group">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-full w-full h-px" style={{ background: "linear-gradient(90deg,rgba(124,58,237,0.4),transparent)", zIndex: 0 }} />
              )}
              <div className="relative p-6 rounded-3xl transition-all group-hover:-translate-y-1" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: `rgba(${step.color === "#7c3aed" ? "124,58,237" : step.color === "#2563eb" ? "37,99,235" : "34,211,238"},0.15)`, border: `1px solid rgba(${step.color === "#7c3aed" ? "124,58,237" : step.color === "#2563eb" ? "37,99,235" : "34,211,238"},0.3)` }}>
                      <step.icon className="w-6 h-6" style={{ color: step.color }} />
                    </div>
                  </div>
                  <div className="text-4xl font-black" style={{ color: "rgba(255,255,255,0.04)", fontFamily: "'Orbitron',sans-serif", lineHeight: 1 }}>{step.n}</div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats Banner ── */}
      <section className="mx-6 rounded-3xl overflow-hidden mb-0" style={{ background: "linear-gradient(135deg,rgba(124,58,237,0.25),rgba(37,99,235,0.2))", border: "1px solid rgba(124,58,237,0.25)" }}>
        <div className="max-w-5xl mx-auto px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: "500+", label: "Students Enrolled" },
            { value: "50+", label: "Video Lessons" },
            { value: "92%", label: "Pass Rate" },
            { value: "4.9★", label: "Average Rating" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-black text-white mb-1" style={{ fontFamily: "'Orbitron',sans-serif", textShadow: "0 0 20px rgba(124,58,237,0.5)" }}>{stat.value}</div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-white mb-3" style={{ fontFamily: "'Orbitron',sans-serif" }}>What Students Say</h2>
          <div className="flex items-center justify-center gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />)}
          </div>
          <p className="text-slate-500 text-sm">Trusted by students across South Africa</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <div key={i} className="p-5 rounded-3xl flex flex-col gap-4 hover:-translate-y-1 transition-transform" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Quote className="w-6 h-6 text-violet-500 opacity-60" />
              <p className="text-sm text-slate-300 leading-relaxed flex-1">"{t.text}"</p>
              <div className="flex items-center gap-3 mt-2">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>{t.avatar}</div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <div className="flex items-center gap-2">
                    <StarRow n={t.stars} />
                    <span className="text-xs text-slate-500">{t.grade}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── What's Included ── */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="rounded-3xl p-8" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <h3 className="text-xl font-bold text-white mb-6">Everything you get with Prince Math Academy</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              "HD video lessons on every Maths topic",
              "Grade 10, 11 & 12 full curriculum coverage",
              "Study streak tracking & gamified XP",
              "Progress tracking per lesson",
              "Student leaderboards & knowledge graph",
              "Comment section to ask questions",
              "Mobile-friendly — study on any device",
              "New lessons added regularly",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-sm text-slate-300">{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button className="flex-1 h-11 rounded-xl font-semibold text-white flex items-center justify-center gap-2" style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)", boxShadow: "0 4px 20px rgba(124,58,237,0.35)" }}>
              Start Free 3-Day Trial <ArrowRight className="w-4 h-4" />
            </button>
            <button className="h-11 px-6 rounded-xl font-semibold text-slate-300 border border-slate-700 hover:bg-white/5">
              View Pricing
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
