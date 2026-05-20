import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCw, Check, X, BookOpen, Plus, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { prince } from '@/api/princeClient';

const DEFAULT_FLASHCARDS = {
  'Algebra': [
    { front: 'What is the quadratic formula?', back: 'x = (-b ± √(b² - 4ac)) / 2a' },
    { front: 'What is the discriminant?', back: 'Δ = b² - 4ac' },
    { front: 'What does a positive discriminant mean?', back: 'Two distinct real roots' },
    { front: 'What does a zero discriminant mean?', back: 'One real root (repeated)' },
    { front: 'What does a negative discriminant mean?', back: 'No real roots (complex)' },
  ],
  'Geometry': [
    { front: 'Pythagorean theorem', back: 'a² + b² = c²' },
    { front: 'Area of a circle', back: 'A = πr²' },
    { front: 'Circumference of a circle', back: 'C = 2πr' },
    { front: 'Area of a triangle', back: 'A = ½ × b × h' },
    { front: 'Area of a rectangle', back: 'A = l × w' },
  ],
  'Trigonometry': [
    { front: 'SOH', back: 'Sin = Opposite / Hypotenuse' },
    { front: 'CAH', back: 'Cos = Adjacent / Hypotenuse' },
    { front: 'TOA', back: 'Tan = Opposite / Adjacent' },
    { front: 'sin²θ + cos²θ = ?', back: '1' },
    { front: '1 + tan²θ = ?', back: 'sec²θ' },
  ],
  'Calculus': [
    { front: 'Derivative of x^n', back: 'nx^(n-1)' },
    { front: 'Derivative of constant', back: '0' },
    { front: 'Derivative of sin(x)', back: 'cos(x)' },
    { front: 'Derivative of cos(x)', back: '-sin(x)' },
    { front: 'Derivative of e^x', back: 'e^x' },
  ],
};

// Spaced repetition algorithm (simplified SM-2)
function calculateNextReview(interval, easeFactor, quality) {
  if (quality < 3) {
    return { interval: 1, easeFactor: easeFactor }; // Reset
  }
  
  if (interval === 1) {
    return { interval: 6, easeFactor: easeFactor };
  }
  
  const newInterval = Math.round(interval * easeFactor);
  const newEaseFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  
  return { interval: newInterval, easeFactor: newEaseFactor };
}

export default function Flashcards() {
  const [user, setUser] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState('Algebra');
  const [currentCard, setCurrentCard] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [flashcards, setFlashcards] = useState(DEFAULT_FLASHCARDS);
  const [userProgress, setUserProgress] = useState({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [formData, setFormData] = useState({ front: '', back: '', topic: 'Algebra' });

  useEffect(() => {
    prince.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const handleFlip = () => {
    setFlipped(!flipped);
  };

  const handleRate = (quality) => {
    // quality: 0-5 (0=again, 5=perfect)
    const card = flashcards[selectedTopic][currentCard];
    const cardKey = `${selectedTopic}-${currentCard}`;
    
    const currentProgress = userProgress[cardKey] || { interval: 0, easeFactor: 2.5, nextReview: Date.now() };
    const { interval, easeFactor } = calculateNextReview(currentProgress.interval, currentProgress.easeFactor, quality);
    
    const nextReview = Date.now() + interval * 24 * 60 * 60 * 1000; // Convert days to milliseconds
    
    setUserProgress(prev => ({
      ...prev,
      [cardKey]: { interval, easeFactor, nextReview, lastQuality: quality }
    }));

    // Award XP for studying
    if (quality >= 3) {
      // Could integrate with gamification system here
    }

    // Move to next card
    setFlipped(false);
    setTimeout(() => {
      setCurrentCard((prev) => (prev + 1) % flashcards[selectedTopic].length);
    }, 300);
  };

  const handleAddCard = () => {
    if (!formData.front || !formData.back) {
      toast.error('Please fill in both front and back');
      return;
    }

    const newCard = { front: formData.front, back: formData.back };
    setFlashcards(prev => ({
      ...prev,
      [formData.topic]: [...(prev[formData.topic] || []), newCard]
    }));

    toast.success('Flashcard added!');
    setFormData({ front: '', back: '', topic: 'Algebra' });
    setIsDialogOpen(false);
  };

  const handleDeleteCard = (topic, index) => {
    setFlashcards(prev => ({
      ...prev,
      [topic]: prev[topic].filter((_, i) => i !== index)
    }));
    toast.success('Flashcard deleted');
  };

  const handleEditCard = (topic, index) => {
    const card = flashcards[topic][index];
    setEditingCard({ topic, index });
    setFormData({ front: card.front, back: card.back, topic });
    setIsDialogOpen(true);
  };

  const handleUpdateCard = () => {
    if (!formData.front || !formData.back) {
      toast.error('Please fill in both front and back');
      return;
    }

    if (editingCard) {
      setFlashcards(prev => {
        const updated = { ...prev };
        updated[editingCard.topic][editingCard.index] = { front: formData.front, back: formData.back };
        return updated;
      });
      toast.success('Flashcard updated');
    } else {
      handleAddCard();
    }

    setEditingCard(null);
    setFormData({ front: '', back: '', topic: 'Algebra' });
    setIsDialogOpen(false);
  };

  const currentCardData = flashcards[selectedTopic]?.[currentCard];
  const progress = ((currentCard + 1) / flashcards[selectedTopic].length) * 100;

  return (
    <div className="min-h-screen" style={{ background: '#080d1a' }}>
      {/* Header */}
      <div className="sticky top-16 z-20 border-b border-white/8" style={{ background: 'rgba(8,13,26,0.95)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Orbitron',sans-serif" }}>
                <BookOpen className="w-8 h-8 inline mr-3 text-violet-400" />
                Flashcards
              </h1>
              <p className="text-slate-400">Study with spaced repetition</p>
            </div>
            <Button onClick={() => { setEditingCard(null); setIsDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Card
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Topic Selection */}
        <div className="flex gap-3 mb-8">
          {Object.keys(flashcards).map(topic => (
            <button
              key={topic}
              onClick={() => { setSelectedTopic(topic); setCurrentCard(0); setFlipped(false); }}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                selectedTopic === topic
                  ? 'bg-violet-600 text-white'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              {topic} ({flashcards[topic].length})
            </button>
          ))}
        </div>

        {/* Flashcard */}
        {currentCardData && (
          <div className="max-w-2xl mx-auto">
            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Card {currentCard + 1} of {flashcards[selectedTopic].length}</span>
                <span className="text-sm text-violet-400">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-violet-500 to-purple-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Card */}
            <motion.div
              className="relative h-96 cursor-pointer"
              onClick={handleFlip}
              style={{ perspective: 1000 }}
            >
              <motion.div
                className="relative w-full h-full"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Front */}
                <div
                  className="absolute inset-0 backface-hidden rounded-2xl p-8 flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.2),rgba(37,99,235,0.2))', border: '1px solid rgba(124,58,237,0.3)' }}
                >
                  <div className="text-center">
                    <p className="text-sm text-violet-300 mb-4">Question</p>
                    <p className="text-2xl font-bold text-white">{currentCardData.front}</p>
                    <p className="text-sm text-slate-400 mt-6">Click to reveal answer</p>
                  </div>
                </div>

                {/* Back */}
                <div
                  className="absolute inset-0 backface-hidden rounded-2xl p-8 flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.2),rgba(6,182,212,0.2))', border: '1px solid rgba(16,185,129,0.3)', transform: 'rotateY(180deg)' }}
                >
                  <div className="text-center">
                    <p className="text-sm text-emerald-300 mb-4">Answer</p>
                    <p className="text-2xl font-bold text-white">{currentCardData.back}</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Rating Buttons */}
            {flipped && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex items-center justify-center gap-3"
              >
                <Button
                  onClick={() => handleRate(0)}
                  variant="outline"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  <X className="w-4 h-4 mr-2" />
                  Again
                </Button>
                <Button
                  onClick={() => handleRate(3)}
                  variant="outline"
                  className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                >
                  <RotateCw className="w-4 h-4 mr-2" />
                  Hard
                </Button>
                <Button
                  onClick={() => handleRate(4)}
                  variant="outline"
                  className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                >
                  Good
                </Button>
                <Button
                  onClick={() => handleRate(5)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Easy
                </Button>
              </motion.div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <Button
                onClick={() => { setFlipped(false); setCurrentCard(prev => (prev - 1 + flashcards[selectedTopic].length) % flashcards[selectedTopic].length); }}
                variant="outline"
                disabled={currentCard === 0}
              >
                Previous
              </Button>
              <Button
                onClick={() => { setFlipped(false); setCurrentCard(prev => (prev + 1) % flashcards[selectedTopic].length); }}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Card Management */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-white mb-6">Manage Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {flashcards[selectedTopic]?.map((card, index) => (
              <div
                key={index}
                className="bg-white/5 rounded-xl border border-white/10 p-4 hover:bg-white/8 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-white font-medium line-clamp-2">{card.front}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditCard(selectedTopic, index)}
                      className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCard(selectedTopic, index)}
                      className="p-1 rounded hover:bg-red-500/10 text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-slate-400 line-clamp-2">{card.back}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-slate-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>{editingCard ? 'Edit Flashcard' : 'Add Flashcard'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Topic</Label>
              <Select value={formData.topic} onValueChange={(v) => setFormData({ ...formData, topic: v })}>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(flashcards).map(topic => (
                    <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Front (Question)</Label>
              <Textarea
                value={formData.front}
                onChange={(e) => setFormData({ ...formData, front: e.target.value })}
                placeholder="Enter the question..."
                className="bg-white/5 border-white/10"
              />
            </div>
            <div>
              <Label>Back (Answer)</Label>
              <Textarea
                value={formData.back}
                onChange={(e) => setFormData({ ...formData, back: e.target.value })}
                placeholder="Enter the answer..."
                className="bg-white/5 border-white/10"
              />
            </div>
            <Button onClick={handleUpdateCard} className="w-full">
              {editingCard ? 'Update Card' : 'Add Card'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
