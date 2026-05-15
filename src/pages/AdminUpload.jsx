import React, { useState, useEffect } from 'react';
import { prince } from '@/api/princeClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Video, 
  Image as ImageIcon, 
  X, 
  Save, 
  Trash2, 
  Edit2,
  Plus,
  Clock,
  Eye,
  AlertCircle,
  CheckCircle,
  MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import AdminStats from '../components/admin/AdminStats';

const grades = ['Grade 10', 'Grade 11', 'Grade 12'];
const tiers = ['Standard', 'Premium'];
const topics = ['Algebra', 'Functions', 'Geometry', 'Statistics', 'Trigonometry', 'Calculus', 'Number Patterns', 'Finance', 'Probability', 'Analytical Geometry', 'Other'];

export default function AdminUpload() {
  const [user, setUser] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    grade: '',
    tier: 'Standard',
    topic: '',
    customTopic: '',
    duration: '',
    video_url: '',
    thumbnail_url: '',
  });
  const [uploading, setUploading] = useState({ video: false, thumbnail: false });
  const queryClient = useQueryClient();

  useEffect(() => {
    prince.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['admin-videos'],
    queryFn: () => prince.entities.Video.list('-created_date', 200),
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => prince.entities.User.list(),
    enabled: user?.role === 'admin',
  });

  const createVideoMutation = useMutation({
    mutationFn: async (data) => {
      await prince.functions.invoke('validateVideoUpload', {
        title: data.title,
        grade: data.grade,
        tier: data.tier
      });
      const video = await prince.entities.Video.create(data);
      prince.functions.invoke('sendNewVideoNotifications', {
        video_id: video.id,
        video_title: data.title,
        grade: data.grade
      }).catch(err => console.error('Notification error:', err));
      return video;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-videos'] });
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      toast.success('Video uploaded! Notifications sent to students.');
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || error.message || 'Upload failed');
    },
  });

  const updateVideoMutation = useMutation({
    mutationFn: ({ id, data }) => prince.entities.Video.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-videos'] });
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      toast.success('Video updated successfully!');
      resetForm();
    },
    onError: (error) => toast.error(error.message || 'Update failed'),
  });

  const deleteVideoMutation = useMutation({
    mutationFn: (id) => prince.entities.Video.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-videos'] });
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      setDeleteConfirm(null);
      toast.success('Video deleted.');
    },
    onError: (error) => toast.error(error.message || 'Delete failed'),
  });

  const resetForm = () => {
    setFormData({ title: '', description: '', grade: '', tier: 'Standard', topic: '', customTopic: '', duration: '', video_url: '', thumbnail_url: '' });
    setEditingVideo(null);
    setIsDialogOpen(false);
  };

  const handleFileUpload = async (file, type) => {
    try {
      setUploading(prev => ({ ...prev, [type]: true }));
      const maxSize = type === 'video' ? 500 * 1024 * 1024 : 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(`File too large. Max: ${type === 'video' ? '500MB' : '5MB'}`);
        setUploading(prev => ({ ...prev, [type]: false }));
        return;
      }
      const { file_url } = await prince.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, [`${type}_url`]: file_url }));
      toast.success(`${type === 'video' ? 'Video' : 'Thumbnail'} uploaded!`);
    } catch (error) {
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.grade) {
      toast.error('Please fill in required fields (title & grade)');
      return;
    }
    const finalTopic = formData.topic === 'Other' ? formData.customTopic : formData.topic;
    const submitData = { ...formData, topic: finalTopic };
    delete submitData.customTopic;

    if (editingVideo) {
      updateVideoMutation.mutate({ id: editingVideo.id, data: submitData });
    } else {
      createVideoMutation.mutate(submitData);
    }
  };

  const openEditDialog = (video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title || '',
      description: video.description || '',
      grade: video.grade || '',
      tier: video.tier || 'Standard',
      topic: video.topic || '',
      customTopic: '',
      duration: video.duration || '',
      video_url: video.video_url || '',
      thumbnail_url: video.thumbnail_url || '',
    });
    setIsDialogOpen(true);
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Access Denied</h2>
          <p className="text-slate-500">Only Prince (admin) can upload and manage video lessons.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Video className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-800">Video Management</h1>
                <p className="text-xs sm:text-sm text-slate-500">{videos.length} lessons uploaded</p>
              </div>
            </div>
            <Button
              onClick={() => { resetForm(); setIsDialogOpen(true); }}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-sm"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Upload Video</span>
              <span className="sm:hidden">Upload</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stats */}
        <AdminStats videos={videos} users={allUsers} />

        {/* Video List */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">All Videos</h2>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-slate-400">Loading videos...</div>
          ) : videos.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              No videos uploaded yet. Click "Upload" to get started.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {videos.map((video) => (
                <div key={video.id} className="flex items-center gap-3 px-4 sm:px-6 py-4 hover:bg-slate-50 transition-colors">
                  {/* Thumbnail */}
                  <div className="w-14 h-10 sm:w-20 sm:h-12 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                    {video.thumbnail_url ? (
                      <img src={video.thumbnail_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-4 h-4 text-slate-400" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap">
                      <p className="font-medium text-slate-800 text-sm truncate max-w-[160px] sm:max-w-xs">{video.title}</p>
                      {video.video_url && <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="secondary" className="text-xs py-0">{video.grade}</Badge>
                      <Badge variant="outline" className="text-xs py-0">{video.tier}</Badge>
                      {video.topic && <span className="text-xs text-slate-400 hidden sm:inline">{video.topic}</span>}
                    </div>
                  </div>

                  {/* Stats - hidden on small mobile */}
                  <div className="hidden md:flex items-center gap-4 text-xs text-slate-400 flex-shrink-0">
                    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{video.views || 0}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{video.duration || '--'}</span>
                    <span>{format(new Date(video.created_date), 'MMM d, yy')}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(video)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => setDeleteConfirm(video)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Video?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600 mb-4">
            Are you sure you want to delete <strong>"{deleteConfirm?.title}"</strong>? This cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={deleteVideoMutation.isPending}
              onClick={() => deleteVideoMutation.mutate(deleteConfirm.id)}
            >
              {deleteVideoMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsDialogOpen(open); }}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingVideo ? 'Edit Video' : 'Upload New Video'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Introduction to Quadratic Equations"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Grade *</Label>
                <Select value={formData.grade} onValueChange={(v) => setFormData(prev => ({ ...prev, grade: v }))}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select grade" /></SelectTrigger>
                  <SelectContent>{grades.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              <div>
                <Label>Tier *</Label>
                <Select value={formData.tier} onValueChange={(v) => setFormData(prev => ({ ...prev, tier: v }))}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>{tiers.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              <div>
                <Label>Topic</Label>
                <Select value={formData.topic} onValueChange={(v) => setFormData(prev => ({ ...prev, topic: v }))}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select topic" /></SelectTrigger>
                  <SelectContent>{topics.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
                {formData.topic === 'Other' && (
                  <Input
                    value={formData.customTopic}
                    onChange={(e) => setFormData(prev => ({ ...prev, customTopic: e.target.value }))}
                    placeholder="Enter custom topic"
                    className="mt-2"
                  />
                )}
              </div>

              <div>
                <Label htmlFor="duration">Duration (e.g. 15:30)</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="15:30"
                  className="mt-1.5"
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="What students will learn in this lesson..."
                  className="mt-1.5 min-h-[80px]"
                />
              </div>

              {/* Video Upload */}
              <div className="sm:col-span-2">
                <Label>Video File</Label>
                <div className="mt-1.5 border-2 border-dashed border-slate-200 rounded-xl p-5 text-center hover:border-violet-300 transition-colors">
                  {formData.video_url ? (
                    <div className="flex items-center justify-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-slate-600">Video uploaded successfully</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setFormData(prev => ({ ...prev, video_url: '' }))}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <input type="file" accept="video/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'video')} disabled={uploading.video} />
                      <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                      <p className="text-sm text-slate-600">{uploading.video ? 'Uploading... please wait' : 'Click to upload video (max 500MB)'}</p>
                    </label>
                  )}
                </div>
              </div>

              {/* Thumbnail Upload */}
              <div className="sm:col-span-2">
                <Label>Thumbnail Image</Label>
                <div className="mt-1.5 border-2 border-dashed border-slate-200 rounded-xl p-5 text-center hover:border-violet-300 transition-colors">
                  {formData.thumbnail_url ? (
                    <div className="flex items-center justify-center gap-3">
                      <img src={formData.thumbnail_url} alt="" className="h-14 rounded" />
                      <Button type="button" variant="ghost" size="sm" onClick={() => setFormData(prev => ({ ...prev, thumbnail_url: '' }))}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'thumbnail')} disabled={uploading.thumbnail} />
                      <ImageIcon className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                      <p className="text-sm text-slate-600">{uploading.thumbnail ? 'Uploading...' : 'Click to upload thumbnail (max 5MB)'}</p>
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              <Button
                type="submit"
                disabled={createVideoMutation.isPending || updateVideoMutation.isPending || uploading.video || uploading.thumbnail}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
              >
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