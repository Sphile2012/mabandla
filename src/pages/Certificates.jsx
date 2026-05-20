import React, { useState, useEffect, useRef } from 'react';
import { prince } from '@/api/princeClient';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Award, Download, Share2, Calendar, Trophy, Star, CheckCircle, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Certificates() {
  const [user, setUser] = useState(null);
  const certificateRef = useRef(null);

  useEffect(() => {
    prince.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: xpEvents = [] } = useQuery({
    queryKey: ['xp-events', user?.email],
    queryFn: () => prince.entities.XPEvent.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const { data: videoProgress = [] } = useQuery({
    queryKey: ['video-progress', user?.email],
    queryFn: () => prince.entities.VideoProgress.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const { data: badges = [] } = useQuery({
    queryKey: ['user-badges', user?.email],
    queryFn: async () => {
      const allBadges = await prince.entities.Badge.list();
      const userBadges = await prince.entities.UserBadge.filter({ user_email: user?.email });
      return allBadges.filter(b => userBadges.some(ub => ub.badge_id === b.id));
    },
    enabled: !!user?.email,
  });

  const totalXP = xpEvents.reduce((sum, e) => sum + (e.xp_amount || 0), 0);
  const completedVideos = videoProgress.filter(vp => vp.completed).length;
  const level = Math.floor(totalXP / 100) + 1;

  const certificates = [
    {
      id: 1,
      title: 'Course Completion Certificate',
      description: 'Awarded for completing 10 videos',
      icon: Trophy,
      earned: completedVideos >= 10,
      progress: Math.min((completedVideos / 10) * 100, 100),
      date: completedVideos >= 10 ? new Date().toLocaleDateString() : null,
    },
    {
      id: 2,
      title: 'Achievement Certificate',
      description: 'Awarded for earning 5 badges',
      icon: Award,
      earned: badges.length >= 5,
      progress: Math.min((badges.length / 5) * 100, 100),
      date: badges.length >= 5 ? new Date().toLocaleDateString() : null,
    },
    {
      id: 3,
      title: 'Milestone Certificate',
      description: 'Awarded for reaching Level 5',
      icon: Star,
      earned: level >= 5,
      progress: Math.min((level / 5) * 100, 100),
      date: level >= 5 ? new Date().toLocaleDateString() : null,
    },
    {
      id: 4,
      title: 'Excellence Certificate',
      description: 'Awarded for completing 50 videos',
      icon: CheckCircle,
      earned: completedVideos >= 50,
      progress: Math.min((completedVideos / 50) * 100, 100),
      date: completedVideos >= 50 ? new Date().toLocaleDateString() : null,
    },
  ];

  const handleDownload = (certificate) => {
    if (!certificate.earned) return;
    alert(`Downloading certificate: ${certificate.title}`);
  };

  const handlePrint = (certificate) => {
    if (!certificate.earned) return;
    window.print();
  };

  const handleShare = (certificate) => {
    if (!certificate.earned) return;
    if (navigator.share) {
      navigator.share({
        title: certificate.title,
        text: `I earned my ${certificate.title} from Prince Math Academy!`,
        url: window.location.href,
      });
    } else {
      alert('Share feature not supported on this browser');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0f1e' }}>
        <div className="text-center">
          <Award className="w-16 h-16 text-violet-400 mx-auto mb-4" />
          <p className="text-white">Please sign in to view your certificates</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#0a0f1e' }}>
      {/* Header */}
      <div className="sticky top-16 z-20 border-b border-white/8" style={{ background: 'rgba(10,15,30,0.95)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "Playfair Display, Georgia, serif" }}>
            Certificates
          </h1>
          <p className="text-slate-400">Earn certificates for your achievements and milestones</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-400" />
                Certificates Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{certificates.filter(c => c.earned).length}</p>
              <p className="text-sm text-slate-400 mt-1">of {certificates.length} available</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
                <Star className="w-4 h-4 text-violet-400" />
                Total XP
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{totalXP}</p>
              <p className="text-sm text-slate-400 mt-1">Level {level}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
                <Award className="w-4 h-4 text-cyan-400" />
                Badges Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{badges.length}</p>
              <p className="text-sm text-slate-400 mt-1">Achievements unlocked</p>
            </CardContent>
          </Card>
        </div>

        {/* Certificates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((certificate, index) => (
            <motion.div
              key={certificate.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`bg-white/5 border ${certificate.earned ? 'border-violet-500/50' : 'border-white/10'} overflow-hidden`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${certificate.earned ? 'bg-gradient-to-br from-violet-500 to-purple-600' : 'bg-white/10'}`}>
                        <certificate.icon className={`w-6 h-6 ${certificate.earned ? 'text-white' : 'text-slate-400'}`} />
                      </div>
                      <div>
                        <CardTitle className="text-white">{certificate.title}</CardTitle>
                        <p className="text-sm text-slate-400 mt-1">{certificate.description}</p>
                      </div>
                    </div>
                    {certificate.earned ? (
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                        Earned
                      </Badge>
                    ) : (
                      <Badge className="bg-white/10 text-slate-400 border-white/10">
                        {Math.round(certificate.progress)}%
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {certificate.earned ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Calendar className="w-4 h-4" />
                        Earned on {certificate.date}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-white/20 text-white bg-white/5 hover:bg-white/10 flex-1"
                          onClick={() => handleDownload(certificate)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-white/20 text-white bg-white/5 hover:bg-white/10 flex-1"
                          onClick={() => handlePrint(certificate)}
                        >
                          <Printer className="w-4 h-4 mr-2" />
                          Print
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-white/20 text-white bg-white/5 hover:bg-white/10"
                          onClick={() => handleShare(certificate)}
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-violet-500 to-purple-600 h-2 rounded-full transition-all"
                          style={{ width: `${certificate.progress}%` }}
                        />
                      </div>
                      <p className="text-sm text-slate-400">
                        {Math.round(certificate.progress)}% complete
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
