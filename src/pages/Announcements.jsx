import React from 'react';
import { prince } from '@/api/princeClient';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Megaphone, Calendar, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

const GOLD = '#f5c842';
const GOLD_LIGHT = '#fde68a';
const GOLD_DARK = '#d97706';

export default function Announcements() {
  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['public-announcements'],
    queryFn: () => prince.entities.Announcement.filter({ is_active: true, is_deleted: false }, '-created_date', 50),
  });

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="w-5 h-5" style={{ color: '#ef4444' }} />;
      case 'important':
        return <Info className="w-5 h-5" style={{ color: GOLD }} />;
      default:
        return <CheckCircle className="w-5 h-5" style={{ color: '#22c55e' }} />;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'important':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-green-500/20 text-green-300 border-green-500/40';
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#0f0c07' }}>
      {/* Header */}
      <div className="relative overflow-hidden py-12 px-4"
        style={{ background: 'linear-gradient(135deg,rgba(245,200,66,0.12) 0%,rgba(15,12,7,0) 60%)' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg,${GOLD_LIGHT},${GOLD})`, boxShadow: '0 4px 16px rgba(245,200,66,0.35)' }}>
                <Megaphone className="w-6 h-6 text-black" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white"
                style={{ fontFamily: "'Sora',sans-serif" }}>
                Announcements
              </h1>
            </div>
            <p className="text-lg" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Stay updated with the latest news, updates, and important information.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: GOLD, borderTopColor: 'transparent' }} />
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(245,200,66,0.1)', border: '1px solid rgba(245,200,66,0.2)' }}>
              <Megaphone className="w-10 h-10" style={{ color: 'rgba(245,200,66,0.4)' }} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Announcements</h3>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Check back later for updates and news.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {announcements.map((announcement, index) => (
              <motion.div
                key={announcement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(245,200,66,0.12)',
                }}
              >
                <div className="p-6 md:p-8">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl"
                        style={{ background: 'rgba(245,200,66,0.1)' }}>
                        {getPriorityIcon(announcement.priority)}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white mb-1"
                          style={{ fontFamily: "'Sora',sans-serif" }}>
                          {announcement.title}
                        </h2>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getPriorityBadge(announcement.priority)}`}>
                            {announcement.priority?.toUpperCase() || 'NORMAL'}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs"
                            style={{ color: 'rgba(255,255,255,0.4)' }}>
                            <Calendar className="w-3.5 h-3.5" />
                            {format(new Date(announcement.created_date), 'MMM d, yyyy • h:mm a')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="pt-4 border-t"
                    style={{ borderColor: 'rgba(245,200,66,0.1)' }}>
                    <p className="text-white leading-relaxed whitespace-pre-wrap"
                      style={{ color: 'rgba(255,255,255,0.8)' }}>
                      {announcement.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
