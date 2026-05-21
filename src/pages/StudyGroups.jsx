import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Search, UserPlus, Calendar, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { prince } from '@/api/princeClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function StudyGroups() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', max_members: 10 });
  const queryClient = useQueryClient();

  useState(() => {
    prince.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['study-groups'],
    queryFn: () => prince.entities.StudyGroup.list('-created_date', 100),
  });

  const { data: members = [] } = useQuery({
    queryKey: ['study-group-members'],
    queryFn: () => prince.entities.StudyGroupMember.list('-created_date', 500),
  });

  const createGroupMutation = useMutation({
    mutationFn: async (data) => {
      const group = await prince.entities.StudyGroup.create({
        name: data.name,
        description: data.description,
        creator_email: user.email,
        max_members: data.max_members,
      });
      // Add creator as first member
      await prince.entities.StudyGroupMember.create({
        group_id: group.id,
        user_email: user.email,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['study-groups']);
      queryClient.invalidateQueries(['study-group-members']);
      toast.success('Study group created successfully!');
      setFormData({ name: '', description: '', max_members: 10 });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to create group: ' + error.message);
    },
  });

  const joinGroupMutation = useMutation({
    mutationFn: async (groupId) => {
      await prince.entities.StudyGroupMember.create({
        group_id: groupId,
        user_email: user.email,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['study-group-members']);
      toast.success('Joined study group successfully!');
    },
    onError: (error) => {
      toast.error('Failed to join group: ' + error.message);
    },
  });

  const handleSubmitGroup = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to create a group');
      return;
    }
    if (!formData.name) {
      toast.error('Please enter a group name');
      return;
    }
    createGroupMutation.mutate(formData);
  };

  const handleJoinGroup = (groupId) => {
    if (!user) {
      toast.error('Please sign in to join a group');
      return;
    }
    joinGroupMutation.mutate(groupId);
  };

  const getMemberCount = (groupId) => {
    return members.filter(m => m.group_id === groupId).length;
  };

  const isMember = (groupId) => {
    return members.some(m => m.group_id === groupId && m.user_email === user?.email);
  };

  const isCreator = (group) => {
    return group.creator_email === user?.email;
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen" style={{ background: '#080d1a' }}>
      {/* Header */}
      <div className="sticky top-16 z-20 border-b border-white/8" style={{ background: 'rgba(8,13,26,0.95)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Orbitron',sans-serif" }}>
                <Users className="w-8 h-8 inline mr-3 text-violet-400" />
                Study Groups
              </h1>
              <p className="text-slate-400">Collaborate with fellow students</p>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search study groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
          />
        </div>

        {/* Groups Grid */}
        {isLoading ? (
          <div className="text-center py-16 text-slate-400">Loading study groups...</div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">No study groups yet</p>
            {user && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create a Study Group
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group, index) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/5 rounded-2xl border border-white/10 p-6 hover:bg-white/8 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {isCreator(group) && <Crown className="w-4 h-4 text-yellow-400" />}
                      <h3 className="text-white font-semibold text-lg">{group.name}</h3>
                    </div>
                    <p className="text-slate-400 text-sm line-clamp-2">{group.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{getMemberCount(group.id)}/{group.max_members}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(group.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {isMember(group.id) ? (
                  <Button variant="outline" className="w-full" disabled>
                    <Users className="w-4 h-4 mr-2" />
                    Already Joined
                  </Button>
                ) : getMemberCount(group.id) >= group.max_members ? (
                  <Button variant="outline" className="w-full" disabled>
                    Group Full
                  </Button>
                ) : (
                  <Button onClick={() => handleJoinGroup(group.id)} className="w-full">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Join Group
                  </Button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Group Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Study Group</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitGroup} className="space-y-4">
            <div>
              <Label>Group Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Grade 10 Algebra Study Group"
                className="bg-white/5 border-white/10"
                required
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What will this group focus on?"
                rows={4}
                className="bg-white/5 border-white/10"
              />
            </div>
            <div>
              <Label>Maximum Members</Label>
              <Input
                type="number"
                value={formData.max_members}
                onChange={(e) => setFormData({ ...formData, max_members: parseInt(e.target.value) })}
                min="2"
                max="50"
                className="bg-white/5 border-white/10"
              />
            </div>
            <Button type="submit" className="w-full" disabled={createGroupMutation.isPending}>
              {createGroupMutation.isPending ? 'Creating...' : 'Create Group'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
