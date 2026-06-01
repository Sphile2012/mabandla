import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, CheckCircle, Bug, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { prince } from '@/api/princeClient';

export default function Feedback() {
  const [user, setUser] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'general',
    subject: '',
    message: '',
  });

  useState(() => {
    prince.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.message) {
      toast.error('Please fill in subject and message');
      return;
    }

    setLoading(true);
    try {
      await prince.entities.Feedback.create({
        user_email: user?.email || null,
        type: formData.type,
        subject: formData.subject,
        message: formData.message,
        status: 'open',
      });
      setSubmitted(true);
      toast.success('Thank you for your feedback!');
      setFormData({ type: 'general', subject: '', message: '' });
    } catch (error) {
      toast.error('Failed to submit feedback: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const feedbackTypes = [
    { value: 'bug', label: 'Bug Report', icon: Bug, color: 'text-red-400', bg: 'bg-red-500/20' },
    { value: 'feature', label: 'Feature Request', icon: Lightbulb, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    { value: 'general', label: 'General Feedback', icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#080d1a' }}>
      {/* Header */}
      <div className="sticky top-16 z-20 border-b border-white/8" style={{ background: 'rgba(8,13,26,0.95)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Orbitron',sans-serif" }}>
            <MessageSquare className="w-8 h-8 inline mr-3 text-violet-400" />
            Feedback
          </h1>
          <p className="text-slate-400">Help us improve Prince Math Academy</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Feedback Submitted!</h2>
            <p className="text-slate-400 mb-6">Thank you for helping us improve. We'll review your feedback soon.</p>
            <Button onClick={() => setSubmitted(false)}>Submit Another</Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 rounded-2xl border border-white/10 p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Feedback Type */}
              <div>
                <Label className="text-slate-300 mb-4 block">Feedback Type</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {feedbackTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: type.value })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.type === type.value
                          ? 'border-violet-500 bg-violet-500/10'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <type.icon className={`w-6 h-6 mx-auto mb-2 ${type.color}`} />
                      <span className="text-white font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <Label htmlFor="subject" className="text-slate-300">Subject *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Brief summary of your feedback"
                  className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                  required
                />
              </div>

              {/* Message */}
              <div>
                <Label htmlFor="message" className="text-slate-300">Message *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Please describe your feedback in detail..."
                  rows={6}
                  className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                  required
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-base font-semibold"
              >
                {loading ? (
                  'Submitting...'
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </form>
          </motion.div>
        )}

        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-xl border border-white/10 p-4">
            <Bug className="w-5 h-5 text-red-400 mb-2" />
            <h3 className="text-white font-semibold mb-1">Bug Report</h3>
            <p className="text-sm text-slate-400">Found an issue? Let us know so we can fix it.</p>
          </div>
          <div className="bg-white/5 rounded-xl border border-white/10 p-4">
            <Lightbulb className="w-5 h-5 text-yellow-400 mb-2" />
            <h3 className="text-white font-semibold mb-1">Feature Request</h3>
            <p className="text-sm text-slate-400">Have an idea? Share it with us!</p>
          </div>
          <div className="bg-white/5 rounded-xl border border-white/10 p-4">
            <MessageSquare className="w-5 h-5 text-blue-400 mb-2" />
            <h3 className="text-white font-semibold mb-1">General Feedback</h3>
            <p className="text-sm text-slate-400">Share your thoughts about the platform.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
