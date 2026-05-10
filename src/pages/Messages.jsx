import React, { useState, useEffect, useRef } from 'react';
import { prince } from '@/api/princeClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Search, ArrowLeft, Lock, UserCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Messages() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    prince.auth.me().then(setUser).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedUser]);

  // Only load users who have a full_name (username set)
  const { data: allUsers = [] } = useQuery({
    queryKey: ['users-chat'],
    queryFn: () => prince.entities.User.list(),
    enabled: !!user,
    select: (data) => data.filter(u => u.email !== user?.email && u.full_name),
  });

  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ['messages', user?.email],
    queryFn: () => prince.entities.Message.filter({ sender_email: user?.email }),
    enabled: !!user?.email,
    refetchInterval: 5000, // poll every 5s for new messages
  });

  const { data: receivedMessages = [] } = useQuery({
    queryKey: ['messages-received', user?.email],
    queryFn: () => prince.entities.Message.filter({ recipient_email: user?.email }),
    enabled: !!user?.email,
    refetchInterval: 5000,
  });

  const allMessages = [...messages, ...receivedMessages];

  const sendMessageMutation = useMutation({
    mutationFn: async (content) => {
      if (!user.full_name) throw new Error('Please set your username in Profile before messaging.');
      const threadId = [user.email, selectedUser.email].sort().join('_');
      await prince.entities.Message.create({
        thread_id: threadId,
        sender_email: user.email,
        sender_name: user.full_name,
        recipient_email: selectedUser.email,
        recipient_name: selectedUser.full_name,
        content: content.trim(),
        is_read: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['messages-received'] });
      setNewMessage('');
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    },
    onError: (err) => toast.error(err.message || 'Failed to send message'),
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => prince.entities.Message.update(id, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['messages-received'] }),
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(newMessage);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  // Build conversation list
  const conversations = allUsers.map(otherUser => {
    const thread = allMessages.filter(m =>
      (m.sender_email === user?.email && m.recipient_email === otherUser.email) ||
      (m.sender_email === otherUser.email && m.recipient_email === user?.email)
    ).sort((a, b) => new Date(a.created_date) - new Date(b.created_date));

    const unread = thread.filter(m => m.recipient_email === user?.email && !m.is_read).length;
    return { user: otherUser, messages: thread, lastMessage: thread[thread.length - 1], unread };
  })
    .filter(c => !searchQuery || c.user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (!a.lastMessage && !b.lastMessage) return 0;
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.created_date) - new Date(a.lastMessage.created_date);
    });

  const activeConv = selectedUser ? conversations.find(c => c.user.email === selectedUser.email) : null;

  // Mark messages as read when opening conversation
  useEffect(() => {
    if (!activeConv) return;
    activeConv.messages
      .filter(m => m.recipient_email === user?.email && !m.is_read)
      .forEach(m => markReadMutation.mutate(m.id));
  }, [activeConv?.messages.length, selectedUser?.email]);

  const initials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const avatarColor = (email) => {
    const colors = ['from-violet-500 to-purple-600', 'from-blue-500 to-cyan-500', 'from-emerald-500 to-teal-500', 'from-rose-500 to-pink-500', 'from-amber-500 to-orange-500'];
    const idx = email?.charCodeAt(0) % colors.length || 0;
    return colors[idx];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#080d1a' }}>
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#080d1a' }}>
        <div className="text-center">
          <Lock className="w-12 h-12 text-violet-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Sign in to Message</h2>
          <p className="text-slate-400 mb-6 text-sm">You need to be signed in to send and receive messages.</p>
          <Link to={createPageUrl('Login')}>
            <button className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold text-sm">
              Sign In
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Require username before messaging
  if (!user.full_name) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#080d1a' }}>
        <div className="text-center max-w-sm">
          <UserCircle className="w-12 h-12 text-violet-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Set Your Username First</h2>
          <p className="text-slate-400 mb-6 text-sm">You need a display name before you can send messages. Go to your profile to set one.</p>
          <Link to={createPageUrl('Profile')}>
            <button className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold text-sm">
              Go to Profile
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 px-4" style={{ background: '#080d1a' }}>
      <div className="max-w-5xl mx-auto">
        <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', height: '75vh', minHeight: '500px' }}>
          <div className="grid md:grid-cols-[280px_1fr] h-full">

            {/* ── Sidebar ── */}
            <div className={`border-r border-white/8 flex flex-col ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
              {/* Header */}
              <div className="p-4 border-b border-white/8">
                <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-violet-400" />
                  Messages
                </h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-8 text-sm bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* Conversation list */}
              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="p-6 text-center">
                    <MessageCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">No users to message yet</p>
                  </div>
                ) : (
                  conversations.map(({ user: u, lastMessage, unread }) => (
                    <button
                      key={u.email}
                      onClick={() => setSelectedUser(u)}
                      className={`w-full p-3.5 flex items-center gap-3 transition-all border-b border-white/5 text-left ${selectedUser?.email === u.email ? 'bg-violet-500/15 border-l-2 border-l-violet-500' : 'hover:bg-white/5'}`}
                    >
                      <div className="relative flex-shrink-0">
                        <Avatar className="w-9 h-9">
                          <AvatarFallback className={`bg-gradient-to-br ${avatarColor(u.email)} text-white text-xs font-bold`}>
                            {initials(u.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        {unread > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-violet-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                            {unread > 9 ? '9+' : unread}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${unread > 0 ? 'text-white' : 'text-slate-300'}`}>{u.full_name}</p>
                        {lastMessage ? (
                          <p className="text-xs text-slate-500 truncate">
                            {lastMessage.sender_email === user.email ? 'You: ' : ''}{lastMessage.content}
                          </p>
                        ) : (
                          <p className="text-xs text-slate-600">Start a conversation</p>
                        )}
                      </div>
                      {lastMessage && (
                        <span className="text-xs text-slate-600 flex-shrink-0">
                          {format(new Date(lastMessage.created_date), 'HH:mm')}
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* ── Chat area ── */}
            <div className={`flex flex-col ${selectedUser ? 'flex' : 'hidden md:flex'}`}>
              {selectedUser && activeConv ? (
                <>
                  {/* Chat header */}
                  <div className="p-4 border-b border-white/8 flex items-center gap-3">
                    <button onClick={() => setSelectedUser(null)} className="md:hidden p-1.5 rounded-lg hover:bg-white/8 text-slate-400">
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <Avatar className="w-9 h-9 flex-shrink-0">
                      <AvatarFallback className={`bg-gradient-to-br ${avatarColor(selectedUser.email)} text-white text-xs font-bold`}>
                        {initials(selectedUser.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-white text-sm">{selectedUser.full_name}</p>
                      <p className="text-xs text-slate-500">{selectedUser.grade || 'Student'}</p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {activeConv.messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <MessageCircle className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                          <p className="text-slate-500 text-sm">No messages yet. Say hello! 👋</p>
                        </div>
                      </div>
                    ) : (
                      activeConv.messages.map((msg, i) => {
                        const isMe = msg.sender_email === user.email;
                        const showAvatar = !isMe && (i === 0 || activeConv.messages[i - 1]?.sender_email !== msg.sender_email);
                        return (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.15 }}
                            className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                          >
                            {!isMe && (
                              <div className="w-6 flex-shrink-0">
                                {showAvatar && (
                                  <Avatar className="w-6 h-6">
                                    <AvatarFallback className={`bg-gradient-to-br ${avatarColor(msg.sender_email)} text-white text-xs`}>
                                      {initials(msg.sender_name)}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                              </div>
                            )}
                            <div className={`max-w-[72%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                              {showAvatar && !isMe && (
                                <span className="text-xs text-slate-500 ml-1">{msg.sender_name}</span>
                              )}
                              <div className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                                isMe
                                  ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-br-sm'
                                  : 'bg-white/10 text-slate-200 rounded-bl-sm border border-white/8'
                              }`}>
                                {msg.content}
                              </div>
                              <span className="text-xs text-slate-600 px-1">
                                {format(new Date(msg.created_date), 'HH:mm')}
                              </span>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <form onSubmit={handleSend} className="p-3 border-t border-white/8">
                    <div className="flex items-end gap-2">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message... (Enter to send)"
                        rows={1}
                        className="flex-1 resize-none rounded-xl px-3.5 py-2.5 text-sm bg-white/8 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 max-h-28 overflow-y-auto"
                        style={{ minHeight: '42px' }}
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || sendMessageMutation.isPending}
                        className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none hover:opacity-90 transition-opacity"
                      >
                        {sendMessageMutation.isPending
                          ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          : <Send className="w-4 h-4" />
                        }
                      </button>
                    </div>
                    <p className="text-xs text-slate-600 mt-1.5 ml-1">Press Enter to send · Shift+Enter for new line</p>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-8 h-8 text-slate-500" />
                    </div>
                    <h3 className="text-white font-semibold mb-1">Your Messages</h3>
                    <p className="text-slate-500 text-sm">Select a conversation to start chatting</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
