import { writeFileSync } from 'fs';

const code = `import { useState, useEffect } from 'react';
import { prince } from '@/api/princeClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Upload, Video, Image as ImageIcon, X, Save, Trash2, Edit2,
  Plus, Clock, Eye, AlertCircle, CheckCircle, Users, Shield,
  Crown, UserX, GraduationCap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import AdminStats from '../components/admin/AdminStats';

const grades = ['Grade 10', 'Grade 11', 'Grade 12'];
const tiers = ['Standard', 'Premium'];
const topics = ['Algebra', 'Functions', 'Geometry', 'Statistics', 'Trigonometry', 'Calculus', 'Number Patterns', 'Finance', 'Probability', 'Analytical Geometry', 'Other'];

export default function AdminUpload() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('videos');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteUserConfirm, setDeleteUserConfirm] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', grade: '', tier: 'Standard',
    topic: '', customTopic: '', duration: '', video_url: '', thumbnail_url: '',
  });
  const [uploading, setUploading] = useState({ video: false, thumbnail: false });
  const queryClient = useQueryClient();

  useEffect(() => { prince.auth.me().then(setUser).catch(() => setUser(null)); }, []);

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['admin-videos'],
    queryFn: () => prince.entities.Video.list('-created_date', 200),
  });

  const { data: allUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => prince.entities.User.list(),
    enabled: user?.role === 'admin',
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }) => prince.entities.User.update(id, { role }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('Role updated'); },
    onError: (e) => toast.error(e.message),
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id) => prince.entities.User.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); setDeleteUserConfirm(null); toast.success('User deleted'); },
    onError: (e) => toast.error(e.message),
  });

  const createVideoMutation = useMutation({
    mutationFn: async (data) => {
      await prince.functions.invoke('validateVideoUpload', { title: data.title, grade: data.grade, tier: data.tier });
      const video = await prince.entities.Video.create(data);
      prince.functions.invoke('sendNewVideoNotifications', { video_id: video.id, video_title: data.title, grade: data.grade }).catch(() => {});
      return video;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-videos'] }); queryClient.invalidateQueries({ queryKey: ['videos'] }); toast.success('Video uploaded!'); resetForm(); },
    onError: (e) => toast.error(e.message || 'Upload failed'),
  });

  const updateVideoMutation = useMutation({
    mutationFn: ({ id, data }) => prince.entities.Video.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-videos'] }); queryClient.invalidateQueries({ queryKey: ['videos'] }); toast.success('Video updated!'); resetForm(); },
    onError: (e) => toast.error(e.message),
  });

  const deleteVideoMutation = useMutation({
    mutationFn: (id) => prince.entities.Video.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-videos'] }); queryClient.invalidateQueries({ queryKey: ['videos'] }); setDeleteConfirm(null); toast.success('Video deleted'); },
    onError: (e) => toast.error(e.message),
  });

  const resetForm = () => {
    setFormData({ title: '', description: '', grade: '', tier: 'Standard', topic: '', customTopic: '', duration: '', video_url: '', thumbnail_url: '' });
    setEditingVideo(null);
    setIsDialogOpen(false);
  };

  const handleFileUpload = async (file, type) => {
    try {
      setUploading(p => ({ ...p, [type]: true }));
      const maxSize = type === 'video' ? 500 * 1024 * 1024 : 5 * 1024 * 1024;
      if (file.size > maxSize) { toast.error('File too large. Max: ' + (type === 'video' ? '500MB' : '5MB')); return; }
      const { file_url } = await prince.integrations.Core.UploadFile({ file });
      setFormData(p => ({ ...p, [type + '_url']: file_url }));
      toast.success((type === 'video' ? 'Video' : 'Thumbnail') + ' uploaded!');
    } catch (e) { toast.error('Upload failed: ' + e.message); }
    finally { setUploading(p => ({ ...p, [type]: false })); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.grade) { toast.error('Title and grade are required'); return; }
    const finalTopic = formData.topic === 'Other' ? formData.customTopic : formData.topic;
    const submitData = { ...formData, topic: finalTopic };
    delete submitData.customTopic;
    if (editingVideo) updateVideoMutation.mutate({ id: editingVideo.id, data: submitData });
    else createVideoMutation.mutate(submitData);
  };

  const openEditDialog = (video) => {
    setEditingVideo(video);
    setFormData({ title: video.title || '', description: video.description || '', grade: video.grade || '', tier: video.tier || 'Standard', topic: video.topic || '', customTopic: '', duration: video.duration || '', video_url: video.video_url || '', thumbnail_url: video.thumbnail_url || '' });
    setIsDialogOpen(true);
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#080d1a' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-400">Admin access required.</p>
        </motion.div>
      </div>
    );
  }

  const now = new Date();
  const activeStudents = allUsers.filter(u => {
    if (u.role === 'admin') return false;
    const trial = u.trial_end_date && new Date(u.trial_end_date) > now;
    const sub = u.subscription_active && u.subscription_end_date && new Date(u.subscription_end_date) > now;
    return trial || sub;
  });

  return (
    <div className="min-h-screen" style={{ background: '#080d1a' }}>
      {/* Header */}
      <div className="border-b border-white/8" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Admin Panel</h1>
                <p className="text-xs text-slate-500">{videos.length} videos · {allUsers.length} users · {activeStudents.length} active</p>
              </div>
            </div>
            {activeTab === 'videos' && (
              <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} size="sm" className="border-0"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
                <Plus className="w-4 h-4 mr-1.5" />
                <span className="hidden sm:inline">Upload Video</span>
                <span className="sm:hidden">Upload</span>
              </Button>
            )}
          </div>
          {/* Tabs */}
          <div className="flex gap-1">
            {[{ id: 'videos', label: 'Videos', icon: Video, count: videos.length }, { id: 'users', label: 'Users', icon: Users, count: allUsers.length }].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={activeTab === tab.id ? { background: 'linear-gradient(135deg,#7c3aed,#2563eb)', color: 'white' } : { background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}>
                <tab.icon className="w-4 h-4" />
                {tab.label}
                <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }}>{tab.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <AdminStats videos={videos} users={allUsers} />

        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="px-4 sm:px-6 py-4 border-b border-white/8">
              <h2 className="font-semibold text-white">All Videos ({videos.length})</h2>
            </div>
            {isLoading ? (
              <div className="p-8 text-center text-slate-500">Loading...</div>
            ) : videos.length === 0 ? (
              <div className="p-12 text-center text-slate-500">No videos yet. Click Upload to get started.</div>
            ) : (
              <div className="divide-y divide-white/5">
                {videos.map((video) => (
                  <div key={video.id} className="flex items-center gap-3 px-4 sm:px-6 py-4 hover:bg-white/3 transition-colors">
                    <div className="w-16 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                      {video.thumbnail_url ? <img src={video.thumbnail_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Video className="w-4 h-4 text-slate-600" /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white text-sm truncate max-w-[180px] sm:max-w-xs">{video.title}</p>
                        {video.video_url && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs py-0">{video.grade}</Badge>
                        <Badge variant="outline" className="text-xs py-0">{video.tier}</Badge>
                        {video.topic && <span className="text-xs text-slate-500 hidden sm:inline">{video.topic}</span>}
                      </div>
                    </div>
                    <div className="hidden md:flex items-center gap-4 text-xs text-slate-500 flex-shrink-0">
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{video.views || 0}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{video.duration || '--'}</span>
                      <span>{format(new Date(video.created_date), 'MMM d, yy')}</span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => openEditDialog(video)} className="p-2 rounded-lg hover:bg-white/8 text-slate-400 hover:text-white transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteConfirm(video)} className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="px-4 sm:px-6 py-4 border-b border-white/8 flex items-center justify-between">
              <h2 className="font-semibold text-white">All Users ({allUsers.length})</h2>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-400" />{activeStudents.length} active</span>
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-400" />{allUsers.filter(u => u.role === 'admin').length} admin</span>
              </div>
            </div>
            {usersLoading ? (
              <div className="p-8 text-center text-slate-500">Loading...</div>
            ) : allUsers.length === 0 ? (
              <div className="p-12 text-center text-slate-500">No users yet.</div>
            ) : (
              <div className="divide-y divide-white/5">
                {allUsers.map((u) => {
                  const isAdmin = u.role === 'admin';
                  const trialActive = u.trial_end_date && new Date(u.trial_end_date) > now;
                  const subActive = u.subscription_active && u.subscription_end_date && new Date(u.subscription_end_date) > now;
                  const initials = u.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
                  return (
                    <div key={u.id} className="flex items-center gap-3 px-4 sm:px-6 py-4 hover:bg-white/3 transition-colors">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                        style={{ background: isAdmin ? 'linear-gradient(135deg,#f59e0b,#ef4444)' : 'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-white truncate">{u.full_name || '(no name)'}</p>
                          {isAdmin && <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}><Crown className="w-3 h-3" />Admin</span>}
                          {trialActive && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.12)', color: '#fbbf24' }}>Trial</span>}
                          {subActive && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399' }}>{u.subscription_tier}</span>}
                        </div>
                        <p className="text-xs text-slate-500 truncate">{u.email}</p>
                        {u.grade && <p className="text-xs text-slate-600">{u.grade}</p>}
                      </div>
                      <div className="hidden md:block text-xs text-slate-600 flex-shrink-0">
                        {u.created_date ? format(new Date(u.created_date), 'MMM d, yyyy') : '—'}
                      </div>
                      {u.id !== user.id && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button onClick={() => updateRoleMutation.mutate({ id: u.id, role: isAdmin ? 'student' : 'admin' })}
                            disabled={updateRoleMutation.isPending}
                            title={isAdmin ? 'Demote to student' : 'Promote to admin'}
                            className="p-2 rounded-lg hover:bg-white/8 text-slate-400 hover:text-amber-400 transition-colors">
                            {isAdmin ? <GraduationCap className="w-4 h-4" /> : <Crown className="w-4 h-4" />}
                          </button>
                          <button onClick={() => setDeleteUserConfirm(u)} className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors">
                            <UserX className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Video Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Video?</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-400 mb-4">Delete <strong>"{deleteConfirm?.title}"</strong>? This cannot be undone.</p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" disabled={deleteVideoMutation.isPending} onClick={() => deleteVideoMutation.mutate(deleteConfirm.id)}>
              {deleteVideoMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={!!deleteUserConfirm} onOpenChange={() => setDeleteUserConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete User?</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-400 mb-4">Delete <strong>{deleteUserConfirm?.email}</strong>? This cannot be undone.</p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setDeleteUserConfirm(null)}>Cancel</Button>
            <Button variant="destructive" disabled={deleteUserMutation.isPending} onClick={() => deleteUserMutation.mutate(deleteUserConfirm.id)}>
              {deleteUserMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload/Edit Video Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsDialogOpen(open); }}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingVideo ? 'Edit Video' : 'Upload New Video'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" value={formData.title} onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} placeholder="e.g., Introduction to Quadratic Equations" className="mt-1.5" />
              </div>
              <div>
                <Label>Grade *</Label>
                <Select value={formData.grade} onValueChange={(v) => setFormData(p => ({ ...p, grade: v }))}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select grade" /></SelectTrigger>
                  <SelectContent>{grades.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tier *</Label>
                <Select value={formData.tier} onValueChange={(v) => setFormData(p => ({ ...p, tier: v }))}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>{tiers.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Topic</Label>
                <Select value={formData.topic} onValueChange={(v) => setFormData(p => ({ ...p, topic: v }))}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select topic" /></SelectTrigger>
                  <SelectContent>{topics.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
                {formData.topic === 'Other' && <Input value={formData.customTopic} onChange={(e) => setFormData(p => ({ ...p, customTopic: e.target.value }))} placeholder="Enter custom topic" className="mt-2" />}
              </div>
              <div>
                <Label htmlFor="duration">Duration (e.g. 15:30)</Label>
                <Input id="duration" value={formData.duration} onChange={(e) => setFormData(p => ({ ...p, duration: e.target.value }))} placeholder="15:30" className="mt-1.5" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="What students will learn..." className="mt-1.5 min-h-[80px]" />
              </div>
              <div className="sm:col-span-2">
                <Label>Video File</Label>
                <div className="mt-1.5 border-2 border-dashed border-white/10 rounded-xl p-5 text-center hover:border-violet-500/40 transition-colors">
                  {formData.video_url ? (
                    <div className="flex items-center justify-center gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                      <span className="text-sm text-slate-300">Video uploaded</span>
                      <button type="button" onClick={() => setFormData(p => ({ ...p, video_url: '' }))} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <input type="file" accept="video/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'video')} disabled={uploading.video} />
                      <Upload className="w-8 h-8 mx-auto text-slate-500 mb-2" />
                      <p className="text-sm text-slate-400">{uploading.video ? 'Uploading...' : 'Click to upload video (max 500MB)'}</p>
                    </label>
                  )}
                </div>
              </div>
              <div className="sm:col-span-2">
                <Label>Thumbnail Image</Label>
                <div className="mt-1.5 border-2 border-dashed border-white/10 rounded-xl p-5 text-center hover:border-violet-500/40 transition-colors">
                  {formData.thumbnail_url ? (
                    <div className="flex items-center justify-center gap-3">
                      <img src={formData.thumbnail_url} alt="" className="h-14 rounded" />
                      <button type="button" onClick={() => setFormData(p => ({ ...p, thumbnail_url: '' }))} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'thumbnail')} disabled={uploading.thumbnail} />
                      <ImageIcon className="w-8 h-8 mx-auto text-slate-500 mb-2" />
                      <p className="text-sm text-slate-400">{uploading.thumbnail ? 'Uploading...' : 'Click to upload thumbnail (max 5MB)'}</p>
                    </label>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-white/8">
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              <Button type="submit" disabled={createVideoMutation.isPending || updateVideoMutation.isPending || uploading.video || uploading.thumbnail}
                className="border-0" style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
                <Save className="w-4 h-4 mr-2" />
                {createVideoMutation.isPending || updateVideoMutation.isPending ? 'Saving...' : editingVideo ? 'Update Video' : 'Upload Video'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
`;

writeFileSync('src/pages/AdminUpload.jsx', code, 'utf8');
console.log('AdminUpload.jsx written successfully, lines:', code.split('\n').length);
