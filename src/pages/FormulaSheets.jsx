import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Download, ChevronDown, ChevronRight, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const FORMULAS = {
  'Grade 10': {
    'Algebra': [
      { name: 'Quadratic Formula', formula: 'x = (-b ± √(b² - 4ac)) / 2a', description: 'Solves ax² + bx + c = 0' },
      { name: 'Difference of Squares', formula: 'a² - b² = (a + b)(a - b)', description: 'Factoring pattern' },
      { name: 'Perfect Square Trinomial', formula: '(a ± b)² = a² ± 2ab + b²', description: 'Expansion pattern' },
      { name: 'Exponent Rules', formula: 'a^m × a^n = a^(m+n)', description: 'Multiplication rule' },
      { name: 'Exponent Division', formula: 'a^m ÷ a^n = a^(m-n)', description: 'Division rule' },
      { name: 'Power of Power', formula: '(a^m)^n = a^(mn)', description: 'Nested exponents' },
    ],
    'Geometry': [
      { name: 'Pythagorean Theorem', formula: 'a² + b² = c²', description: 'Right-angled triangles' },
      { name: 'Area of Rectangle', formula: 'A = l × w', description: 'Length × width' },
      { name: 'Area of Triangle', formula: 'A = ½ × b × h', description: 'Base × height / 2' },
      { name: 'Area of Circle', formula: 'A = πr²', description: 'π × radius²' },
      { name: 'Circumference', formula: 'C = 2πr', description: '2 × π × radius' },
      { name: 'Perimeter of Rectangle', formula: 'P = 2(l + w)', description: '2 × (length + width)' },
    ],
    'Trigonometry': [
      { name: 'Sine', formula: 'sin θ = opposite / hypotenuse', description: 'SOH' },
      { name: 'Cosine', formula: 'cos θ = adjacent / hypotenuse', description: 'CAH' },
      { name: 'Tangent', formula: 'tan θ = opposite / adjacent', description: 'TOA' },
      { name: 'Pythagorean Identity', formula: 'sin²θ + cos²θ = 1', description: 'Fundamental identity' },
    ],
    'Finance': [
      { name: 'Simple Interest', formula: 'I = P × r × t', description: 'Principal × rate × time' },
      { name: 'Compound Interest', formula: 'A = P(1 + r/n)^(nt)', description: 'n = compounding periods' },
      { name: 'Profit', formula: 'Profit = Selling Price - Cost Price', description: 'Basic profit calculation' },
      { name: 'Loss', formula: 'Loss = Cost Price - Selling Price', description: 'When cost > selling' },
    ],
  },
  'Grade 11': {
    'Algebra': [
      { name: 'Quadratic Formula', formula: 'x = (-b ± √(b² - 4ac)) / 2a', description: 'Solves ax² + bx + c = 0' },
      { name: 'Discriminant', formula: 'Δ = b² - 4ac', description: 'Determines nature of roots' },
      { name: 'Sum of Roots', formula: 'α + β = -b/a', description: 'For quadratic ax² + bx + c' },
      { name: 'Product of Roots', formula: 'αβ = c/a', description: 'For quadratic ax² + bx + c' },
      { name: 'Exponential Growth', formula: 'A = P(1 + r)^t', description: 'Growth over time' },
      { name: 'Exponential Decay', formula: 'A = P(1 - r)^t', description: 'Decay over time' },
    ],
    'Functions': [
      { name: 'Linear Function', formula: 'f(x) = mx + c', description: 'Straight line' },
      { name: 'Quadratic Function', formula: 'f(x) = ax² + bx + c', description: 'Parabola' },
      { name: 'Exponential Function', formula: 'f(x) = a^x', description: 'Exponential curve' },
      { name: 'Inverse Function', formula: 'f⁻¹(x)', description: 'Reverse of f(x)' },
    ],
    'Trigonometry': [
      { name: 'Sine Rule', formula: 'a/sin A = b/sin B = c/sin C', description: 'Any triangle' },
      { name: 'Cosine Rule', formula: 'a² = b² + c² - 2bc cos A', description: 'Any triangle' },
      { name: 'Area Rule', formula: 'Area = ½ab sin C', description: 'Triangle area' },
      { name: 'Double Angle', formula: 'sin 2θ = 2 sin θ cos θ', description: 'Double angle identity' },
      { name: 'Cosine Double Angle', formula: 'cos 2θ = cos²θ - sin²θ', description: 'Double angle' },
    ],
    'Analytical Geometry': [
      { name: 'Distance Formula', formula: 'd = √[(x₂-x₁)² + (y₂-y₁)²]', description: 'Between two points' },
      { name: 'Midpoint Formula', formula: 'M = ((x₁+x₂)/2, (y₁+y₂)/2)', description: 'Midpoint of segment' },
      { name: 'Gradient', formula: 'm = (y₂-y₁)/(x₂-x₁)', description: 'Slope of line' },
      { name: 'Equation of Line', formula: 'y - y₁ = m(x - x₁)', description: 'Point-slope form' },
    ],
  },
  'Grade 12': {
    'Calculus': [
      { name: 'Derivative (Power Rule)', formula: 'd/dx(x^n) = nx^(n-1)', description: 'Basic differentiation' },
      { name: 'Derivative (Constant)', formula: 'd/dx(c) = 0', description: 'Constant rule' },
      { name: 'Derivative (Sum)', formula: 'd/dx(f + g) = f\' + g\'', description: 'Sum rule' },
      { name: 'Derivative (Product)', formula: 'd/dx(fg) = f\'g + fg\'', description: 'Product rule' },
      { name: 'Derivative (Quotient)', formula: 'd/dx(f/g) = (f\'g - fg\')/g²', description: 'Quotient rule' },
      { name: 'Chain Rule', formula: 'd/dx[f(g(x))] = f\'(g(x))·g\'(x)', description: 'Composite functions' },
      { name: 'Integration (Power)', formula: '∫x^n dx = x^(n+1)/(n+1) + C', description: 'Basic integration' },
    ],
    'Trigonometry': [
      { name: 'Compound Angle', formula: 'sin(α+β) = sin α cos β + cos α sin β', description: 'Sum formula' },
      { name: 'Cosine Compound', formula: 'cos(α+β) = cos α cos β - sin α sin β', description: 'Sum formula' },
      { name: 'Tangent Compound', formula: 'tan(α+β) = (tan α + tan β)/(1 - tan α tan β)', description: 'Sum formula' },
      { name: 'Sine Double Angle', formula: 'sin 2θ = 2 sin θ cos θ', description: 'Double angle' },
      { name: 'Cosine Double Angle', formula: 'cos 2θ = 2cos²θ - 1', description: 'Double angle' },
    ],
    'Geometry': [
      { name: 'Circle Equation', formula: '(x-a)² + (y-b)² = r²', description: 'Center (a,b), radius r' },
      { name: 'Tangent to Circle', formula: 'y = mx ± r√(1+m²)', description: 'Tangent line' },
      { name: 'Area of Circle Sector', formula: 'A = (θ/360) × πr²', description: 'θ in degrees' },
    ],
    'Probability': [
      { name: 'Probability', formula: 'P(A) = n(A)/n(S)', description: 'Favorable / Total outcomes' },
      { name: 'Complementary', formula: 'P(A\') = 1 - P(A)', description: 'Not A' },
      { name: 'Union', formula: 'P(A ∪ B) = P(A) + P(B) - P(A ∩ B)', description: 'Addition rule' },
      { name: 'Independent Events', formula: 'P(A ∩ B) = P(A) × P(B)', description: 'Multiplication rule' },
    ],
  },
};

export default function FormulaSheets() {
  const [selectedGrade, setSelectedGrade] = useState('Grade 10');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTopics, setExpandedTopics] = useState({});

  const toggleTopic = (topic) => {
    setExpandedTopics(prev => ({ ...prev, [topic]: !prev[topic] }));
  };

  const filteredFormulas = selectedTopic 
    ? FORMULAS[selectedGrade]?.[selectedTopic] || []
    : Object.entries(FORMULAS[selectedGrade] || {}).flatMap(([topic, formulas]) => 
        formulas.map(f => ({ ...f, topic }))
      );

  const searchedFormulas = filteredFormulas.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.formula.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const downloadFormulaSheet = () => {
    const content = Object.entries(FORMULAS[selectedGrade] || {})
      .map(([topic, formulas]) => {
        return `\n${topic}\n${'='.repeat(topic.length)}\n${formulas.map(f => `${f.name}: ${f.formula} - ${f.description}`).join('\n')}`;
      })
      .join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedGrade}-Formula-Sheet.txt`;
    a.click();
    URL.revokeObjectURL(url);
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
                Formula Sheets
              </h1>
              <p className="text-slate-400">Mathematical formulas by grade and topic</p>
            </div>
            <Button onClick={downloadFormulaSheet} className="gap-2">
              <Download className="w-4 h-4" />
              Download Sheet
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Grade Selection */}
        <div className="flex gap-3 mb-6">
          {Object.keys(FORMULAS).map(grade => (
            <button
              key={grade}
              onClick={() => {
                setSelectedGrade(grade);
                setSelectedTopic(null);
                setExpandedTopics({});
              }}
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

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search formulas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
          />
        </div>

        {/* Topics Grid */}
        {!selectedTopic && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(FORMULAS[selectedGrade] || {}).map(([topic, formulas]) => (
              <motion.div
                key={topic}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden"
              >
                <button
                  onClick={() => toggleTopic(topic)}
                  className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-violet-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-white font-semibold">{topic}</h3>
                      <p className="text-sm text-slate-400">{formulas.length} formulas</p>
                    </div>
                  </div>
                  {expandedTopics[topic] ? (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  )}
                </button>
                
                {expandedTopics[topic] && (
                  <div className="p-4 pt-0 border-t border-white/10">
                    {formulas.map((formula, index) => (
                      <div key={index} className="py-3 border-b border-white/5 last:border-0">
                        <p className="text-white font-medium mb-1">{formula.name}</p>
                        <p className="text-violet-300 font-mono text-sm mb-1">{formula.formula}</p>
                        <p className="text-xs text-slate-500">{formula.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Selected Topic View */}
        {selectedTopic && (
          <div>
            <button
              onClick={() => setSelectedTopic(null)}
              className="mb-6 text-violet-400 hover:text-violet-300 flex items-center gap-2"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back to all topics
            </button>
            
            <h2 className="text-2xl font-bold text-white mb-6">{selectedTopic} Formulas</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchedFormulas.map((formula, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/5 rounded-xl border border-white/10 p-5 hover:bg-white/8 transition-colors"
                >
                  <h3 className="text-white font-semibold mb-2">{formula.name}</h3>
                  <p className="text-violet-300 font-mono text-lg mb-2">{formula.formula}</p>
                  <p className="text-sm text-slate-400">{formula.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
