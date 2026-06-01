import React, { useState, useEffect } from 'react';
import { prince } from '@/api/princeClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Upload, Video, Image as ImageIcon, X, Save, Trash2, Edit2, Plus,
  Clock, Eye, AlertCircle, CheckCircle, Megaphone, RotateCcw,
  FileText, Users, BarChart3, ClipboardList, Shield,
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
import { useAuth } from '@/lib/AuthContext';
import { isAdminOrTeacher } from '@/lib/access';

const GOLD = '#f5c842';
const GOLD_LIGHT = '#fde68a';
const GOLD_DARK = '#d97706';

const grades = ['Grade 10', 'Grade 11', 'Grade 12'];
const tiers = ['Standard', 'Premium'];
const topics = ['Algebra', 'Functions', 'Geometry', 'Trigonometry', 'Calculus', 'Number Patterns', 'Finance', 'Probability', 'Analytical Geometry', 'Other'];
const userRoles = ['student', 'teacher', 'admin'];
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@princemath.co.za';

export default function AdminUpload() {
  const { user, isLoadingAuth } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activeTab, setActiveTab] = useState('videos'); // 'videos' or 'announcements'
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
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
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    priority: 'normal',
  });
  const [uploading, setUploading] = useState({ video: false, thumbnail: false });
  const [grantAdminDialogOpen, setGrantAdminDialogOpen] = useState(false);
  const [grantAdminEmail, setGrantAdminEmail] = useState('');
  const queryClient = useQueryClient();

  // No need for useEffect to fetch user — useAuth handles it

  const isAdmin = user?.role === 'admin' || user?.email === ADMIN_EMAIL;
  const canManagePage = isAdminOrTeacher(user);

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['admin-videos'],
    queryFn: () => prince.entities.Video.list('-created_date', 200),
    enabled: canManagePage,
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => prince.entities.User.list(),
    enabled: canManagePage,
  });

  const { data: announcements = [], isLoading: announcementsLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => prince.entities.Announcement.list('-created_date', 100),
    enabled: canManagePage,
  });

  const { data: xpEvents = [] } = useQuery({
    queryKey: ['xp-events'],
    queryFn: () => prince.entities.XPEvent.list('-created_date', 500),
    enabled: canManagePage,
  });

  const { data: videoProgress = [] } = useQuery({
    queryKey: ['video-progress'],
    queryFn: () => prince.entities.VideoProgress.list('-created_date', 500),
    enabled: canManagePage,
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: ({ id, role }) => prince.entities.User.update(id, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User role updated successfully.');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || error.message || 'Failed to update user role');
    },
  });

  const handleUpdateUserRole = (id, role) => {
    if (!isAdmin) {
      toast.error('Only admins can change user roles.');
      return;
    }
    updateUserRoleMutation.mutate({ id, role });
  };

  const grantAdminMutation = useMutation({
    mutationFn: async (email) => {
      const trimmedEmail = email.trim().toLowerCase();
      const targetUser = allUsers.find(u => u.email?.toLowerCase() === trimmedEmail);
      if (!targetUser) {
        throw new Error('User not found with this email address.');
      }
      if (targetUser.role === 'admin') {
        throw new Error('This user is already an admin.');
      }
      await prince.entities.User.update(targetUser.id, { role: 'admin' });
      return targetUser;
    },
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(`✅ Admin access granted to ${user.email}`);
      setGrantAdminEmail('');
      setGrantAdminDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to grant admin access');
    },
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

  const createAnnouncementMutation = useMutation({
    mutationFn: (data) => prince.entities.Announcement.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement posted successfully!');
      setAnnouncementForm({ title: '', content: '', priority: 'normal' });
      setEditingAnnouncement(null);
      setAnnouncementDialogOpen(false);
    },
    onError: (error) => toast.error(error.message || 'Failed to post announcement'),
  });

  const updateAnnouncementMutation = useMutation({
    mutationFn: ({ id, data }) => prince.entities.Announcement.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement updated successfully!');
      setAnnouncementForm({ title: '', content: '', priority: 'normal' });
      setEditingAnnouncement(null);
      setAnnouncementDialogOpen(false);
    },
    onError: (error) => toast.error(error.message || 'Failed to update announcement'),
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: (id) => prince.entities.Announcement.update(id, { is_deleted: true, deleted_at: new Date().toISOString() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement deleted.');
    },
    onError: (error) => toast.error(error.message || 'Failed to delete announcement'),
  });

  const restoreAnnouncementMutation = useMutation({
    mutationFn: (id) => prince.entities.Announcement.update(id, { is_deleted: false, deleted_at: null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement restored successfully!');
    },
    onError: (error) => toast.error(error.message || 'Failed to restore announcement'),
  });

  const resetForm = () => {
    setFormData({ title: '', description: '', grade: '', tier: 'Standard', topic: '', customTopic: '', duration: '', video_url: '', thumbnail_url: '' });
    setEditingVideo(null);
    setIsDialogOpen(false);
  };

  const resetAnnouncementForm = () => {
    setAnnouncementForm({ title: '', content: '', priority: 'normal' });
    setEditingAnnouncement(null);
    setAnnouncementDialogOpen(false);
  };

  const handleAnnouncementSubmit = (e) => {
    e.preventDefault();
    if (!announcementForm.title || !announcementForm.content) {
      toast.error('Please fill in title and content');
      return;
    }

    const data = {
      title: announcementForm.title,
      content: announcementForm.content,
      priority: announcementForm.priority,
      is_active: true,
    };

    if (editingAnnouncement) {
      updateAnnouncementMutation.mutate({ id: editingAnnouncement.id, data });
    } else {
      createAnnouncementMutation.mutate(data);
    }
  };

  const openEditAnnouncementDialog = (announcement) => {
    setEditingAnnouncement(announcement);
    setAnnouncementForm({
      title: announcement.title || '',
      content: announcement.content || '',
      priority: announcement.priority || 'normal',
    });
    setAnnouncementDialogOpen(true);
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

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f0c07' }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: GOLD, borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!isAdminOrTeacher(user)) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0f0c07' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <Shield className="w-10 h-10" style={{ color: '#f87171' }} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Sora',sans-serif" }}>
            Access Denied
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>
            Only teachers and admins can upload and manage video lessons.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#0f0c07' }}>
      {/* Header */}
      <div style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(245,200,66,0.12)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `linear-gradient(135deg,${GOLD_LIGHT},${GOLD})` }}>
                {activeTab === 'videos' ? (
                  <Video className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                ) : activeTab === 'announcements' ? (
                  <Megaphone className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                ) : (
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                )}
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white" style={{ fontFamily: "'Sora',sans-serif" }}>
                  {activeTab === 'videos' ? 'Video Management' : activeTab === 'announcements' ? 'Announcements' : 'User Management'}
                </h1>
                <p className="text-xs sm:text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {activeTab === 'videos' ? `${videos.length} lessons uploaded` : activeTab === 'announcements' ? `${announcements.length} announcements` : `${allUsers.length} registered users`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={activeTab === 'videos' ? 'default' : 'outline'}
                onClick={() => setActiveTab('videos')}
                className="text-sm"
                size="sm"
              >
                <Video className="w-4 h-4 mr-1.5" />
                Videos
              </Button>
              <Button
                variant={activeTab === 'announcements' ? 'default' : 'outline'}
                onClick={() => setActiveTab('announcements')}
                className="text-sm"
                size="sm"
              >
                <Megaphone className="w-4 h-4 mr-1.5" />
                Announcements
              </Button>
              <Button
                variant={activeTab === 'users' ? 'default' : 'outline'}
                onClick={() => setActiveTab('users')}
                className="text-sm"
                size="sm"
              >
                <Users className="w-4 h-4 mr-1.5" />
                Users
              </Button>
              {activeTab === 'videos' && (
                <Button
                  onClick={() => { resetForm(); setIsDialogOpen(true); }}
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-sm"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  <span className="hidden sm:inline">Upload Video</span>
                  <span className="sm:hidden">Upload</span>
                </Button>
              )}
              {activeTab === 'announcements' && (
                <Button
                  onClick={() => { resetAnnouncementForm(); setAnnouncementDialogOpen(true); }}
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-sm"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  <span className="hidden sm:inline">New Announcement</span>
                  <span className="sm:hidden">New</span>
                </Button>
              )}
              {activeTab === 'users' && (
                <Button
                  onClick={() => setGrantAdminDialogOpen(true)}
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-sm text-white"
                  size="sm"
                >
                  <Shield className="w-4 h-4 mr-1.5" />
                  <span className="hidden sm:inline">Grant Admin</span>
                  <span className="sm:hidden">Admin</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stats */}
        <AdminStats videos={videos} users={allUsers} xpEvents={xpEvents} videoProgress={videoProgress} />

        {/* Video List */}
        {activeTab === 'videos' && (
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
        )}

        {/* Announcements List */}
        {activeTab === 'announcements' && (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">All Announcements</h2>
            </div>

            {announcementsLoading ? (
              <div className="p-8 text-center text-slate-400">Loading announcements...</div>
            ) : announcements.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                No announcements yet. Click "New Announcement" to create one.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className={`flex items-start gap-3 px-4 sm:px-6 py-4 transition-colors ${announcement.is_deleted ? 'bg-red-50 opacity-60' : 'hover:bg-slate-50'}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 flex-wrap">
                        <p className={`font-medium text-sm truncate max-w-[200px] sm:max-w-md ${announcement.is_deleted ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                          {announcement.title}
                        </p>
                        <Badge
                          variant={announcement.priority === 'urgent' ? 'destructive' : announcement.priority === 'important' ? 'default' : 'secondary'}
                          className="text-xs py-0"
                        >
                          {announcement.priority}
                        </Badge>
                        {announcement.is_active && !announcement.is_deleted && (
                          <Badge variant="outline" className="text-xs py-0 text-green-600 border-green-600">Active</Badge>
                        )}
                        {announcement.is_deleted && (
                          <Badge variant="outline" className="text-xs py-0 text-red-600 border-red-600">Deleted</Badge>
                        )}
                      </div>
                      <p className={`text-xs mt-1 line-clamp-2 ${announcement.is_deleted ? 'text-slate-400' : 'text-slate-600'}`}>
                        {announcement.content}
                      </p>
                      <p className="text-xs text-slate-400 mt-2">
                        {format(new Date(announcement.created_date), 'MMM d, yyyy HH:mm')}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!announcement.is_deleted && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditAnnouncementDialog(announcement)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      )}
                      {announcement.is_deleted ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => restoreAnnouncementMutation.mutate(announcement.id)}
                          disabled={restoreAnnouncementMutation.isPending}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => deleteAnnouncementMutation.mutate(announcement.id)}
                          disabled={deleteAnnouncementMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users List */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
              <h2 className="font-semibold text-slate-800">All Registered Users ({allUsers.length})</h2>
              <Button
                onClick={() => setGrantAdminDialogOpen(true)}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-sm text-white"
                size="sm"
              >
                <Shield className="w-4 h-4 mr-1.5" />
                Grant Admin Access
              </Button>
            </div>

            {!allUsers || allUsers.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                No users registered yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="text-left px-4 sm:px-6 py-3 font-semibold text-slate-700">Name</th>
                      <th className="text-left px-4 sm:px-6 py-3 font-semibold text-slate-700">Email</th>
                      <th className="text-left px-4 sm:px-6 py-3 font-semibold text-slate-700">Grade</th>
                      <th className="text-left px-4 sm:px-6 py-3 font-semibold text-slate-700">Role</th>
                      <th className="text-left px-4 sm:px-6 py-3 font-semibold text-slate-700">Status</th>
                      <th className="text-center px-4 sm:px-6 py-3 font-semibold text-slate-700">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 sm:px-6 py-3 text-slate-800 font-medium">{user.full_name || 'N/A'}</td>
                        <td className="px-4 sm:px-6 py-3 text-slate-600 text-xs sm:text-sm break-all">{user.email}</td>
                        <td className="px-4 sm:px-6 py-3 text-slate-600">{user.grade || 'N/A'}</td>
                        <td className="px-4 sm:px-6 py-3">
                          <Select 
                            value={user.role || 'student'}
                            onValueChange={(newRole) => handleUpdateUserRole(user.id, newRole)}
                          >
                            <SelectTrigger className="h-8 w-28 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="student">Student</SelectItem>
                              <SelectItem value="teacher">Teacher</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 sm:px-6 py-3">
                          <Badge 
                            variant={user.subscription_active ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {user.subscription_active ? 'Active' : user.trial_end_date && new Date(user.trial_end_date) > new Date() ? 'Trial' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-center">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(user.email);
                              toast.success('Email copied!');
                            }}
                            className="text-xs h-7"
                          >
                            Copy Email
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
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

      {/* Announcement Dialog */}
      <Dialog open={announcementDialogOpen} onOpenChange={(open) => { if (!open) resetAnnouncementForm(); setAnnouncementDialogOpen(open); }}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAnnouncementSubmit} className="space-y-5">
            <div>
              <Label htmlFor="announcement-title">Title *</Label>
              <Input
                id="announcement-title"
                value={announcementForm.title}
                onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Important: Exam Schedule Update"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="announcement-content">Content *</Label>
              <Textarea
                id="announcement-content"
                value={announcementForm.content}
                onChange={(e) => setAnnouncementForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter your announcement message..."
                className="mt-1.5 min-h-[120px]"
              />
            </div>

            <div>
              <Label>Priority</Label>
              <Select value={announcementForm.priority} onValueChange={(v) => setAnnouncementForm(prev => ({ ...prev, priority: v }))}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="important">Important</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={resetAnnouncementForm}>Cancel</Button>
              <Button
                type="submit"
                disabled={createAnnouncementMutation.isPending || updateAnnouncementMutation.isPending}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {createAnnouncementMutation.isPending || updateAnnouncementMutation.isPending ? 'Saving...' : editingAnnouncement ? 'Update Announcement' : 'Post Announcement'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Grant Admin Access Dialog */}
      <Dialog open={grantAdminDialogOpen} onOpenChange={setGrantAdminDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Grant Admin Access</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Enter the email address of the user you want to make an admin.
            </p>

            <div>
              <Label htmlFor="admin-email">User Email Address</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="user@example.com"
                value={grantAdminEmail}
                onChange={(e) => setGrantAdminEmail(e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div className="p-3 rounded-lg" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
              <p className="text-xs text-slate-600">
                💡 <strong>Tip:</strong> Make sure you know this person before granting admin access. They will have full control over users, videos, and announcements.
              </p>
            </div>

            <div className="flex gap-3 justify-end pt-2 border-t">
              <Button 
                variant="outline" 
                onClick={() => {
                  setGrantAdminEmail('');
                  setGrantAdminDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => grantAdminMutation.mutate(grantAdminEmail)}
                disabled={!grantAdminEmail.trim() || grantAdminMutation.isPending}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
              >
                {grantAdminMutation.isPending ? 'Granting...' : 'Grant Admin Access'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}