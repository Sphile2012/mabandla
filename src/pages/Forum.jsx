import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Plus, Search, ThumbsUp, Pin, Clock, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { prince } from '@/api/princeClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const TOPICS = ['Algebra', 'Functions', 'Geometry', 'Trigonometry', 'Calculus', 'Number Patterns', 'Finance', 'Probability', 'Analytical Geometry'];

export default function Forum() {
  const [user, setUser] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ topic: 'Algebra', title: '', content: '' });
  const queryClient = useQueryClient();

  useState(() => {
    prince.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['forum-posts', selectedTopic],
    queryFn: () => {
      if (selectedTopic === 'All') {
        return prince.entities.ForumPost.list('-created_date', 100);
      }
      return prince.entities.ForumPost.filter({ topic: selectedTopic }, '-created_date', 100);
    },
  });

  const { data: replies = [] } = useQuery({
    queryKey: ['forum-replies'],
    queryFn: () => prince.entities.ForumReply.list('-created_date', 500),
  });

  const createPostMutation = useMutation({
    mutationFn: async (data) => {
      await prince.entities.ForumPost.create({
        topic: data.topic,
        user_email: user.email,
        user_name: user.full_name,
        title: data.title,
        content: data.content,
        upvotes: 0,
        is_pinned: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['forum-posts']);
      toast.success('Post created successfully!');
      setFormData({ topic: 'Algebra', title: '', content: '' });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to create post: ' + error.message);
    },
  });

  const handleSubmitPost = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to post');
      return;
    }
    if (!formData.title || !formData.content) {
      toast.error('Please fill in title and content');
      return;
    }
    createPostMutation.mutate(formData);
  };

  const handleUpvote = async (postId) => {
    if (!user) {
      toast.error('Please sign in to upvote');
      return;
    }
    try {
      const post = posts.find(p => p.id === postId);
      await prince.entities.ForumPost.update(postId, { upvotes: (post.upvotes || 0) + 1 });
      queryClient.invalidateQueries(['forum-posts']);
    } catch (error) {
      toast.error('Failed to upvote');
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getReplyCount = (postId) => {
    return replies.filter(r => r.post_id === postId).length;
  };

  return (
    <div className="min-h-screen" style={{ background: '#080d1a' }}>
      {/* Header */}
      <div className="sticky top-16 z-20 border-b border-white/8" style={{ background: 'rgba(8,13,26,0.95)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Orbitron',sans-serif" }}>
                <MessageSquare className="w-8 h-8 inline mr-3 text-violet-400" />
                Discussion Forum
              </h1>
              <p className="text-slate-400">Ask questions and share knowledge with other students</p>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
            />
          </div>
          <Select value={selectedTopic} onValueChange={setSelectedTopic}>
            <SelectTrigger className="w-[200px] bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Topics</SelectItem>
              {TOPICS.map(topic => (
                <SelectItem key={topic} value={topic}>{topic}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Posts */}
        {isLoading ? (
          <div className="text-center py-16 text-slate-400">Loading discussions...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">No discussions yet</p>
            {user && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Start a Discussion
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/5 rounded-2xl border border-white/10 p-6 hover:bg-white/8 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Upvote Section */}
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => handleUpvote(post.id)}
                      className="p-2 rounded-lg hover:bg-violet-500/20 text-slate-400 hover:text-violet-400 transition-colors"
                    >
                      <ThumbsUp className="w-5 h-5" />
                    </button>
                    <span className="text-white font-semibold">{post.upvotes || 0}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {post.is_pinned && <Pin className="w-4 h-4 text-violet-400" />}
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-violet-500/20 text-violet-300">
                        {post.topic}
                      </span>
                    </div>
                    <h3 className="text-white font-semibold text-lg mb-2">{post.title}</h3>
                    <p className="text-slate-300 mb-4 line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4" />
                        <span>{post.user_name || 'Anonymous'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        <span>{getReplyCount(post.id)} replies</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Post Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Discussion</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitPost} className="space-y-4">
            <div>
              <Label>Topic</Label>
              <Select value={formData.topic} onValueChange={(v) => setFormData({ ...formData, topic: v })}>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TOPICS.map(topic => (
                    <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="What's your question?"
                className="bg-white/5 border-white/10"
                required
              />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Provide more details about your question..."
                rows={6}
                className="bg-white/5 border-white/10"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={createPostMutation.isPending}>
              {createPostMutation.isPending ? 'Creating...' : 'Post Discussion'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
