import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { GraduationCap, BookOpen, Award, Heart, Play, ArrowRight, Lightbulb, Target, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DARK = '#080d1a';
const CARD = 'rgba(255,255,255,0.04)';
const BORDER = '1px solid rgba(255,255,255,0.08)';

export default function About() {
  return (
    <div className="min-h-screen" style={{ background: DARK }}>
      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-4"
        style={{ background: 'linear-gradient(135deg,#0f0a2e,#1a0a3e,#0a1628)' }}>
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse at 50% 0%,rgba(124,58,237,0.3) 0%,transparent 70%)' }} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="relative max-w-4xl mx-auto text-center">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)' }}>
            <GraduationCap className="w-12 h-12 text-violet-300" />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">PRINCE MATH ACADEMY</h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            A modern digital learning platform dedicated to advancing excellence in Pure Mathematics.
          </p>
        </motion.div>
      </section>

      {/* Mission */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-3xl p-8 md:p-10" style={{ background: CARD, border: BORDER }}>
          <h2 className="text-2xl font-bold text-white mb-5">Welcome to Prince Math Academy</h2>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>Built for students and aspiring mathematicians, this academy provides direct access to high quality mathematics instruction through video lessons. Our mission is simple: make advanced mathematical knowledge <span className="font-semibold text-violet-400">accessible, structured, and available anytime.</span></p>
            <p>By combining rigorous academic depth with technology-driven delivery, the platform empowers learners to study at their own pace without compromising on quality. Each lesson is designed to strengthen conceptual understanding, analytical reasoning, and mathematical maturity.</p>
          </div>
        </motion.div>
      </section>

      {/* Philosophy */}
      <section className="py-16" style={{ background: 'rgba(124,58,237,0.05)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-white mb-3">Our Philosophy</h2>
            <p className="text-violet-400 font-semibold text-lg italic">"Dream it, we will take you there."</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Lightbulb, title: 'Deep Thinking', desc: 'We believe intelligence is timeless. We are committed to bringing back the culture of deep thinking and logical precision.' },
              { icon: Target, title: 'Academic Excellence', desc: 'When ambition meets disciplined study, extraordinary results follow. Our content is built around rigorous academic standards.' },
              { icon: Globe, title: 'Accessibility', desc: 'Removing barriers to quality education. Structured video content lets learners build mastery without limitations of location or schedule.' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 + 0.3 }}
                className="rounded-2xl p-7 text-center" style={{ background: CARD, border: BORDER }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Empowerment */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-3xl p-10 text-center"
          style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.2),rgba(37,99,235,0.2))', border: '1px solid rgba(124,58,237,0.3)' }}>
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">More Than an Educational App</h3>
          <p className="text-slate-300 leading-relaxed max-w-2xl mx-auto">
            This is a <span className="text-violet-300 font-semibold">movement towards intellectual empowerment</span>. Whether you are strengthening foundations or exploring advanced mathematical theory, Prince Math Academy provides the tools, clarity, and guidance needed to excel.
          </p>
          <p className="text-white/60 mt-4 text-lg font-medium italic">Welcome to a smarter way to learn mathematics.</p>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-16" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: BookOpen, label: 'Grades Covered', value: '3' },
              { icon: Play, label: 'Video Lessons', value: '100+' },
              { icon: Award, label: 'Years Experience', value: '10+' },
              { icon: Heart, label: 'Students Helped', value: '500+' },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 + 0.4 }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Teach */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-white text-center mb-10">What We Teach</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { grade: 'Grade 10', color: 'from-emerald-500 to-teal-500', topics: ['Algebra', 'Functions', 'Geometry', 'Statistics', 'Trigonometry'] },
            { grade: 'Grade 11', color: 'from-blue-500 to-indigo-500', topics: ['Algebra', 'Functions', 'Geometry', 'Statistics', 'Trigonometry'] },
            { grade: 'Grade 12', color: 'from-violet-500 to-purple-600', topics: ['Algebra', 'Functions', 'Geometry', 'Statistics', 'Trigonometry', 'Calculus'] },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 + 0.3 }}
              className="rounded-2xl p-6" style={{ background: CARD, border: BORDER }}>
              <div className={`inline-block bg-gradient-to-r ${item.color} text-white text-sm font-bold px-4 py-1.5 rounded-full mb-4`}>{item.grade}</div>
              <ul className="space-y-2">
                {item.topics.map(topic => (
                  <li key={topic} className="flex items-center gap-2 text-slate-400">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${item.color} flex-shrink-0`} />{topic}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-8">
        <div className="rounded-3xl p-10 text-center"
          style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.25),rgba(37,99,235,0.25))', border: '1px solid rgba(124,58,237,0.3)' }}>
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">Ready to Start Learning?</h3>
          <p className="text-slate-400 mb-6">Choose a subscription plan and get access to all our video lessons.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl('Pricing')}>
              <Button size="lg" className="border-0 px-8" style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
                View Pricing <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to={createPageUrl('Categories')}>
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8">Browse Lessons</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
