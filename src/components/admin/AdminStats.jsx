import React from 'react';
import { motion } from 'framer-motion';
import { Video, Users, Eye, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminStats({ videos, users }) {
  const totalViews = videos.reduce((sum, v) => sum + (v.views || 0), 0);
  const avgViewsPerVideo = videos.length > 0 ? Math.round(totalViews / videos.length) : 0;

  const stats = [
    {
      title: 'Total Videos',
      value: videos.length,
      icon: Video,
      color: 'from-violet-500 to-purple-600',
      bgColor: 'bg-violet-50',
    },
    {
      title: 'Total Students',
      value: users.filter(u => u.role !== 'admin').length,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Views',
      value: totalViews.toLocaleString(),
      icon: Eye,
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Avg Views/Video',
      value: avgViewsPerVideo,
      icon: TrendingUp,
      color: 'from-orange-500 to-amber-500',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="border-slate-100 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
                  <h3 className="text-3xl font-bold text-slate-800">{stat.value}</h3>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  <div className={`w-6 h-6 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}