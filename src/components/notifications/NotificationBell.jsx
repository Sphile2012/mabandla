import React, { useState } from 'react';
import { prince } from '@/api/princeClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Bell, X, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default function NotificationBell({ user }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: () => prince.entities.Notification.filter({ user_email: user?.email, is_read: false }, '-created_date', 10),
    enabled: !!user?.email,
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => prince.entities.Notification.update(id, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const unreadCount = notifications.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 hover:bg-slate-100 rounded-full transition-colors">
          <Bell className="w-5 h-5 text-slate-600" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-medium rounded-full flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </button>
      </PopoverTrigger>
      
      <PopoverContent align="end" className="w-80 p-0">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Notifications</h3>
        </div>
        
        <div className="max-h-80 overflow-y-auto">
          <AnimatePresence>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-violet-100 rounded-full">
                      <Video className="w-4 h-4 text-violet-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700">{notification.message}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {format(new Date(notification.created_date), 'MMM d, h:mm a')}
                      </p>
                      {notification.video_id && (
                        <Link
                          to={createPageUrl('VideoPlayer') + `?id=${notification.video_id}`}
                          onClick={() => {
                            markReadMutation.mutate(notification.id);
                            setOpen(false);
                          }}
                          className="text-xs text-violet-600 hover:underline mt-1 inline-block"
                        >
                          Watch now →
                        </Link>
                      )}
                    </div>
                    <button
                      onClick={() => markReadMutation.mutate(notification.id)}
                      className="p-1 hover:bg-slate-200 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400">
                <Bell className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No new notifications</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </PopoverContent>
    </Popover>
  );
}