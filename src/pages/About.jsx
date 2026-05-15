import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { GraduationCap, BookOpen, Award, Heart, Play, ArrowRight, Lightbulb, Target, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function About() {
  return (
    <div className="min-h-screen" style={{ background: '#080d1a' }}>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800 py-24 px-4">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative max-w-4xl mx-auto text-center"
        >
          <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">
            PRINCE MATH ACADEMY
          </h1>
          <p className="text-xl text-white/85 max-w-3xl mx-auto leading-relaxed">
            A modern digital learning platform dedicated to advancing excellence in Pure Mathematics.
          </p>
        </motion.div>
      </section>

      {/* Welcome / Mission */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-3xl shadow-sm border border-slate-100 p-10"
        >
          <h2 className="text-2xl font-bold text-slate-800 mb-5">Welcome to Prince Math Academy</h2>
          <div className="space-y-4 text-slate-600 leading-relaxed text-base">
            <p>
              Built for students and aspiring mathematicians, this academy provides direct access to high quality mathematics instruction through downloadable video lessons and live sessions. Our mission is simple: make advanced mathematical knowledge <span className="font-semibold text-violet-700">accessible, structured, and available anytime.</span>
            </p>
            <p>
              The academy intends to redefine how mathematics is learned in the digital era. By combining rigorous academic depth with technology-driven delivery, the platform empowers learners to study at their own pace without compromising on quality. Each lesson is designed to strengthen conceptual understanding, analytical reasoning, and mathematical maturity — core pillars for success in Pure Mathematics.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Philosophy */}
      <section className="bg-gradient-to-br from-violet-50 to-purple-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Our Philosophy</h2>
            <p className="text-violet-700 font-semibold text-lg italic">"Dream it, we will take you there."</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Lightbulb,
                title: 'Deep Thinking',
                desc: 'We believe intelligence is not outdated — it is timeless. We are committed to bringing back the culture of deep thinking and logical precision.',
              },
              {
                icon: Target,
                title: 'Academic Excellence',
                desc: 'When ambition meets disciplined study, extraordinary results follow. Our content is built around rigorous academic standards.',
              },
              {
                icon: Globe,
                title: 'Accessibility',
                desc: 'Removing barriers to quality education. Structured video content lets learners build mastery without limitations of location or schedule.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.4 }}
                className="bg-white rounded-2xl p-7 shadow-sm border border-slate-100 text-center"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-slate-800 mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Empowerment statement */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-slate-900 to-violet-900 rounded-3xl p-10 text-center"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            More Than an Educational App
          </h3>
          <p className="text-slate-300 leading-relaxed max-w-2xl mx-auto">
            This is a <span className="text-violet-300 font-semibold">movement towards intellectual empowerment</span>. Whether you are strengthening foundations or exploring advanced mathematical theory, Prince Math Academy provides the tools, clarity, and guidance needed to excel.
          </p>
          <p className="text-white/70 mt-4 text-lg font-medium italic">
            Welcome to a smarter way to learn mathematics.
          </p>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="bg-violet-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: BookOpen, label: 'Grades Covered', value: '3' },
              { icon: Play, label: 'Video Lessons', value: '100+' },
              { icon: Award, label: 'Years Experience', value: '10+' },
              { icon: Heart, label: 'Students Helped', value: '500+' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.4 }}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-3xl font-bold text-slate-800">{stat.value}</div>
                <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Teach */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-slate-800 text-center mb-10">What We Teach</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { grade: 'Grade 10', color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50', topics: ['Algebra', 'Functions', 'Geometry', 'Statistics', 'Trigonometry'] },
            { grade: 'Grade 11', color: 'from-blue-500 to-indigo-500', bg: 'bg-blue-50', topics: ['Algebra', 'Functions', 'Geometry', 'Statistics', 'Trigonometry'] },
            { grade: 'Grade 12', color: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', topics: ['Algebra', 'Functions', 'Geometry', 'Statistics', 'Trigonometry'] },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 + 0.3 }}
              className={`${item.bg} rounded-2xl p-6 border border-slate-100`}
            >
              <div className={`inline-block bg-gradient-to-r ${item.color} text-white text-sm font-bold px-4 py-1.5 rounded-full mb-4`}>
                {item.grade}
              </div>
              <ul className="space-y-2">
                {item.topics.map(topic => (
                  <li key={topic} className="flex items-center gap-2 text-slate-700">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${item.color}`} />
                    {topic}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-8">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-10 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">Ready to Start Learning?</h3>
          <p className="text-slate-300 mb-6">Choose a subscription plan and get access to all our video lessons.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl('Pricing')}>
              <Button size="lg" className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 px-8">
                View Pricing <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to={createPageUrl('Categories')}>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8">
                Browse Lessons
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}