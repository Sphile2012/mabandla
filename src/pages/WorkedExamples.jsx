import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ChevronRight, Search, Filter, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const WORKED_EXAMPLES = {
  'Grade 10': {
    'Algebra': [
      {
        id: 1,
        title: 'Solving Quadratic Equations',
        problem: 'Solve for x: x² - 5x + 6 = 0',
        steps: [
          { step: 1, content: 'Identify the coefficients: a = 1, b = -5, c = 6' },
          { step: 2, content: 'Use the quadratic formula: x = (-b ± √(b² - 4ac)) / 2a' },
          { step: 3, content: 'Calculate the discriminant: Δ = b² - 4ac = (-5)² - 4(1)(6) = 25 - 24 = 1' },
          { step: 4, content: 'Since Δ > 0, there are two real roots' },
          { step: 5, content: 'x = (5 ± √1) / 2 = (5 ± 1) / 2' },
          { step: 6, content: 'x₁ = (5 + 1) / 2 = 3, x₂ = (5 - 1) / 2 = 2' },
          { step: 7, content: 'Answer: x = 3 or x = 2' },
        ],
        difficulty: 'Medium',
      },
      {
        id: 2,
        title: 'Factoring Difference of Squares',
        problem: 'Factor: x² - 16',
        steps: [
          { step: 1, content: 'Recognize the pattern: a² - b² = (a + b)(a - b)' },
          { step: 2, content: 'Identify a and b: a = x, b = 4 (since 4² = 16)' },
          { step: 3, content: 'Apply the formula: (x + 4)(x - 4)' },
          { step: 4, content: 'Answer: (x + 4)(x - 4)' },
        ],
        difficulty: 'Easy',
      },
    ],
    'Geometry': [
      {
        id: 3,
        title: 'Pythagorean Theorem Application',
        problem: 'Find the length of the hypotenuse in a right triangle with legs 3 and 4',
        steps: [
          { step: 1, content: 'Label the sides: a = 3, b = 4, c = ?' },
          { step: 2, content: 'Use Pythagorean theorem: a² + b² = c²' },
          { step: 3, content: 'Substitute: 3² + 4² = c²' },
          { step: 4, content: 'Calculate: 9 + 16 = c²' },
          { step: 5, content: 'c² = 25' },
          { step: 6, content: 'c = √25 = 5' },
          { step: 7, content: 'Answer: The hypotenuse is 5 units' },
        ],
        difficulty: 'Easy',
      },
      {
        id: 4,
        title: 'Area of a Circle',
        problem: 'Find the area of a circle with radius 7 cm (use π ≈ 22/7)',
        steps: [
          { step: 1, content: 'Identify the radius: r = 7 cm' },
          { step: 2, content: 'Use the area formula: A = πr²' },
          { step: 3, content: 'Substitute: A = (22/7) × 7²' },
          { step: 4, content: 'Calculate: A = (22/7) × 49' },
          { step: 5, content: 'A = 22 × 7 = 154' },
          { step: 6, content: 'Answer: The area is 154 cm²' },
        ],
        difficulty: 'Easy',
      },
    ],
  },
  'Grade 11': {
    'Functions': [
      {
        id: 5,
        title: 'Finding the Inverse Function',
        problem: 'Find the inverse of f(x) = 2x + 3',
        steps: [
          { step: 1, content: 'Start with y = f(x): y = 2x + 3' },
          { step: 2, content: 'Swap x and y: x = 2y + 3' },
          { step: 3, content: 'Solve for y: x - 3 = 2y' },
          { step: 4, content: 'y = (x - 3) / 2' },
          { step: 5, content: 'Answer: f⁻¹(x) = (x - 3) / 2' },
        ],
        difficulty: 'Medium',
      },
      {
        id: 6,
        title: 'Exponential Growth',
        problem: 'A population doubles every 3 hours. If it starts at 100, what is it after 9 hours?',
        steps: [
          { step: 1, content: 'Use exponential growth formula: A = P(1 + r)^t' },
          { step: 2, content: 'Since it doubles, growth rate r = 1 (100%)' },
          { step: 3, content: 'Number of periods: 9 ÷ 3 = 3' },
          { step: 4, content: 'A = 100(1 + 1)³ = 100 × 2³' },
          { step: 5, content: 'A = 100 × 8 = 800' },
          { step: 6, content: 'Answer: The population is 800 after 9 hours' },
        ],
        difficulty: 'Medium',
      },
    ],
    'Trigonometry': [
      {
        id: 7,
        title: 'Using the Sine Rule',
        problem: 'In triangle ABC, a = 10, A = 30°, B = 45°. Find side b',
        steps: [
          { step: 1, content: 'Use the sine rule: a/sin A = b/sin B' },
          { step: 2, content: 'Substitute known values: 10/sin 30° = b/sin 45°' },
          { step: 3, content: 'Calculate sin values: sin 30° = 0.5, sin 45° ≈ 0.707' },
          { step: 4, content: '10/0.5 = b/0.707' },
          { step: 5, content: '20 = b/0.707' },
          { step: 6, content: 'b = 20 × 0.707 ≈ 14.14' },
          { step: 7, content: 'Answer: Side b ≈ 14.14 units' },
        ],
        difficulty: 'Hard',
      },
    ],
  },
  'Grade 12': {
    'Calculus': [
      {
        id: 8,
        title: 'Differentiation - Chain Rule',
        problem: 'Find the derivative of f(x) = (2x + 1)³',
        steps: [
          { step: 1, content: 'Let u = 2x + 1, so f(x) = u³' },
          { step: 2, content: 'Use chain rule: df/dx = df/du × du/dx' },
          { step: 3, content: 'df/du = 3u² = 3(2x + 1)²' },
          { step: 4, content: 'du/dx = 2' },
          { step: 5, content: 'df/dx = 3(2x + 1)² × 2' },
          { step: 6, content: 'df/dx = 6(2x + 1)²' },
          { step: 7, content: 'Answer: f\'(x) = 6(2x + 1)²' },
        ],
        difficulty: 'Hard',
      },
      {
        id: 9,
        title: 'Integration - Power Rule',
        problem: 'Evaluate ∫(3x² + 2x) dx',
        steps: [
          { step: 1, content: 'Split the integral: ∫3x² dx + ∫2x dx' },
          { step: 2, content: 'Use power rule: ∫x^n dx = x^(n+1)/(n+1) + C' },
          { step: 3, content: '∫3x² dx = 3 × x³/3 = x³' },
          { step: 4, content: '∫2x dx = 2 × x²/2 = x²' },
          { step: 5, content: 'Combine: x³ + x² + C' },
          { step: 6, content: 'Answer: x³ + x² + C' },
        ],
        difficulty: 'Medium',
      },
    ],
  },
};

export default function WorkedExamples() {
  const [selectedGrade, setSelectedGrade] = useState('Grade 10');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedExample, setExpandedExample] = useState(null);

  const topics = Object.keys(WORKED_EXAMPLES[selectedGrade] || {});
  const examples = selectedTopic
    ? WORKED_EXAMPLES[selectedGrade]?.[selectedTopic] || []
    : Object.values(WORKED_EXAMPLES[selectedGrade] || {}).flat();

  const filteredExamples = examples.filter(example => {
    const matchesSearch = example.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         example.problem.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'All' || example.difficulty === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const difficultyColors = {
    Easy: 'bg-green-500/20 text-green-400 border-green-500/30',
    Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Hard: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <div className="min-h-screen" style={{ background: '#080d1a' }}>
      {/* Header */}
      <div className="sticky top-16 z-20 border-b border-white/8" style={{ background: 'rgba(8,13,26,0.95)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Orbitron',sans-serif" }}>
                <BookOpen className="w-8 h-8 inline mr-3 text-violet-400" />
                Worked Examples
              </h1>
              <p className="text-slate-400">Step-by-step solutions to math problems</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Grade Selection */}
        <div className="flex gap-3 mb-6">
          {Object.keys(WORKED_EXAMPLES).map(grade => (
            <button
              key={grade}
              onClick={() => { setSelectedGrade(grade); setSelectedTopic(null); setExpandedExample(null); }}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                selectedGrade === grade
                  ? 'bg-violet-600 text-white'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              {grade}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search examples..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
            />
          </div>
          <div className="flex gap-3">
            <Select value={selectedTopic || 'All'} onValueChange={(v) => setSelectedTopic(v === 'All' ? null : v)}>
              <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Topics</SelectItem>
                {topics.map(topic => (
                  <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Levels</SelectItem>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Examples Grid */}
        <div className="grid grid-cols-1 gap-4">
          {filteredExamples.map((example, index) => (
            <motion.div
              key={example.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden"
            >
              <button
                onClick={() => setExpandedExample(expandedExample === example.id ? null : example.id)}
                className="w-full p-6 text-left hover:bg-white/5 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-white font-semibold text-lg">{example.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${difficultyColors[example.difficulty]}`}>
                        {example.difficulty}
                      </span>
                    </div>
                    <p className="text-violet-300 font-mono text-sm mb-2">{example.problem}</p>
                    <p className="text-slate-400 text-sm">{example.steps.length} steps</p>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${expandedExample === example.id ? 'rotate-90' : ''}`} />
                </div>
              </button>

              {expandedExample === example.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="border-t border-white/10 p-6 bg-white/5"
                >
                  <div className="space-y-4">
                    {example.steps.map((step) => (
                      <div key={step.step} className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-600/20 flex items-center justify-center border border-violet-500/30">
                          <span className="text-violet-300 font-semibold text-sm">{step.step}</span>
                        </div>
                        <div className="flex-1 pt-1">
                          <p className="text-slate-300">{step.content}</p>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <p className="text-green-400 font-semibold">Solution Complete</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {filteredExamples.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No examples found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
