import React, { useState } from 'react';
import { prince } from '@/api/princeClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, HelpCircle, Send, Reply } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

function CommentItem({ comment, user, onReply }) {
  const initials = comment.author_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || '?';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3"
    >
      <Avatar className="w-10 h-10 flex-shrink-0">
        <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-sm">
          {initials}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-slate-800">{comment.author_name}</span>
          {comment.is_question && (
            <Badge variant="outline" className="text-xs border-amber-300 text-amber-600 bg-amber-50">
              <HelpCircle className="w-3 h-3 mr-1" />
              Question
            </Badge>
          )}
          <span className="text-xs text-slate-400">
            {format(new Date(comment.created_date), 'MMM d, yyyy')}
          </span>
        </div>
        
        <p className="text-slate-600 mt-1 text-sm leading-relaxed">{comment.content}</p>
        
        {user && (
          <button
            onClick={() => onReply(comment)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-violet-600 mt-2 transition-colors"
          >
            <Reply className="w-3.5 h-3.5" />
            Reply
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function CommentSection({ videoId, comments, user }) {
  const [content, setContent] = useState('');
  const [isQuestion, setIsQuestion] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const queryClient = useQueryClient();

  const addCommentMutation = useMutation({
    mutationFn: (data) => prince.entities.Comment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', videoId] });
      setContent('');
      setIsQuestion(false);
      setReplyTo(null);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    addCommentMutation.mutate({
      video_id: videoId,
      content: content.trim(),
      author_name: user.full_name || 'Anonymous',
      author_email: user.email,
      is_question: isQuestion,
      reply_to: replyTo?.id,
    });
  };

  const parentComments = comments?.filter(c => !c.reply_to) || [];
  const replies = comments?.filter(c => c.reply_to) || [];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5 text-violet-600" />
        <h3 className="font-semibold text-lg text-slate-800">
          Discussion ({comments?.length || 0})
        </h3>
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          {replyTo && (
            <div className="flex items-center gap-2 mb-2 text-sm text-slate-500">
              <Reply className="w-4 h-4" />
              Replying to {replyTo.author_name}
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="text-violet-600 hover:underline ml-2"
              >
                Cancel
              </button>
            </div>
          )}
          
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts or ask a question..."
            className="min-h-[100px] resize-none border-slate-200 focus:border-violet-300 focus:ring-violet-200"
          />
          
          <div className="flex items-center justify-between mt-3">
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={isQuestion}
                onChange={(e) => setIsQuestion(e.target.checked)}
                className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
              />
              <HelpCircle className="w-4 h-4" />
              Mark as question
            </label>
            
            <Button
              type="submit"
              disabled={!content.trim() || addCommentMutation.isPending}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
            >
              <Send className="w-4 h-4 mr-2" />
              Post
            </Button>
          </div>
        </form>
      ) : (
        <div className="bg-slate-50 rounded-xl p-4 mb-6 text-center">
          <p className="text-slate-600 text-sm">Please sign in to join the discussion</p>
        </div>
      )}

      <div className="space-y-6">
        <AnimatePresence>
          {parentComments.map((comment) => (
            <div key={comment.id}>
              <CommentItem comment={comment} user={user} onReply={setReplyTo} />
              
              {replies.filter(r => r.reply_to === comment.id).length > 0 && (
                <div className="ml-12 mt-4 pl-4 border-l-2 border-slate-100 space-y-4">
                  {replies
                    .filter(r => r.reply_to === comment.id)
                    .map(reply => (
                      <CommentItem key={reply.id} comment={reply} user={user} onReply={setReplyTo} />
                    ))}
                </div>
              )}
            </div>
          ))}
        </AnimatePresence>
        
        {parentComments.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
}