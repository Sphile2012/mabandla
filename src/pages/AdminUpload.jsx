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
  Megaphone,
  RotateCcw,
  Bot,
  KeyRound,
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
const topics = ['Algebra', 'Functions', 'Geometry', 'Trigonometry', 'Calculus', 'Number Patterns', 'Finance', 'Probability', 'Analytical Geometry', 'Other'];

function checkAccess(user) {
  return user?.role === 'admin';
}

export default function AdminUpload() {
  const [user, setUser] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activeTab, setActiveTab] = useState('videos'); // 'videos', 'announcements', or 'ai'
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
    notes_url: '',
  });
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    priority: 'normal',
  });
  const [uploading, setUploading] = useState({ video: false, thumbnail: false, notes: false });
  const [aiForm, setAiForm] = useState({
    enabled: true,
    apiUrl: '',
    model: '',
    apiKey: '',
    clearApiKey: false,
    systemPrompt: '',
  });
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

  const { data: announcements = [], isLoading: announcementsLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => prince.entities.Announcement.list('-created_date', 100),
    enabled: user?.role === 'admin',
  });

  const { data: aiSettings, isLoading: aiSettingsLoading } = useQuery({
    queryKey: ['ai-settings'],
    queryFn: () => prince.functions.invoke('getAISettings', {}),
    enabled: user?.role === 'admin',
  });

  useEffect(() => {
    if (!aiSettings) return;
    setAiForm((prev) => ({
      ...prev,
      enabled: aiSettings.enabled !== false,
      apiUrl: aiSettings.storedApiUrl || '',
      model: aiSettings.storedModel || '',
      systemPrompt: aiSettings.systemPrompt && aiSettings.systemPrompt !== 'You are the Prince Math Academy study assistant. Help South African Grade 10-12 learners understand mathematics step by step. Explain working clearly, ask a short guiding question when useful, and adapt to the learner. Do not claim to know which lessons, subscriptions, or account details a learner has; you do not have access to those records. If asked something outside your knowledge, say so plainly.'
        ? aiSettings.systemPrompt
        : '',
      apiKey: '',
      clearApiKey: false,
    }));
  }, [aiSettings]);

  const { data: xpEvents = [] } = useQuery({
    queryKey: ['xp-events'],
    queryFn: () => prince.entities.XPEvent.list('-created_date', 500),
    enabled: user?.role === 'admin',
  });

  const { data: videoProgress = [] } = useQuery({
    queryKey: ['video-progress'],
    queryFn: () => prince.entities.VideoProgress.list('-created_date', 500),
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

  const saveAISettingsMutation = useMutation({
    mutationFn: (data) => prince.functions.invoke('updateAISettings', data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['ai-settings'] });
      if (result?.settings) {
        setAiForm((prev) => ({ ...prev, apiKey: '', clearApiKey: false }));
      }
      toast.success('AI settings saved.');
    },
    onError: (error) => toast.error(error.message || 'Failed to save AI settings'),
  });

  const handleAISubmit = (e) => {
    e.preventDefault();
    const payload = {
      enabled: aiForm.enabled,
      apiUrl: aiForm.apiUrl.trim(),
      model: aiForm.model.trim(),
      systemPrompt: aiForm.systemPrompt,
      clearApiKey: aiForm.clearApiKey,
    };
    if (aiForm.apiKey.trim()) payload.apiKey = aiForm.apiKey.trim();
    saveAISettingsMutation.mutate(payload);
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', grade: '', tier: 'Standard', topic: '', customTopic: '', duration: '', video_url: '', thumbnail_url: '', notes_url: '' });
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
      const maxSize = type === 'video' ? 500 * 1024 * 1024 : type === 'notes' ? 20 * 1024 * 1024 : 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(`File too large. Max: ${type === 'video' ? '500MB' : type === 'notes' ? '20MB' : '5MB'}`);
        setUploading(prev => ({ ...prev, [type]: false }));
        return;
      }
      const { file_url } = await prince.integrations.Core.UploadFile({ file, kind: type === 'notes' ? 'notes' : undefined });
      setFormData(prev => ({ ...prev, [`${type}_url`]: file_url }));
      toast.success(`${type === 'video' ? 'Video' : type === 'notes' ? 'Notes' : 'Thumbnail'} uploaded!`);
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
      notes_url: video.notes_url || '',
    });
    setIsDialogOpen(true);
  };

  if (!checkAccess(user)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Access Denied</h2>
          <p className="text-slate-500">Only admins can upload and manage video lessons.</p>
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
                {activeTab === 'videos' ? (
                  <Video className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                ) : activeTab === 'announcements' ? (
                  <Megaphone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                ) : (
                  <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-800">
                  {activeTab === 'videos' ? 'Video Management' : activeTab === 'announcements' ? 'Announcements' : 'AI Settings'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  {activeTab === 'videos'
                    ? `${videos.length} lessons uploaded`
                    : activeTab === 'announcements'
                      ? `${announcements.length} announcements`
                      : 'Configure the AI study assistant'}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 justify-end">
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
                variant={activeTab === 'ai' ? 'default' : 'outline'}
                onClick={() => setActiveTab('ai')}
                className="text-sm"
                size="sm"
              >
                <Bot className="w-4 h-4 mr-1.5" />
                AI Settings
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

        {/* AI Settings */}
        {activeTab === 'ai' && (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-slate-800">AI Study Assistant Configuration</h2>
                <p className="text-sm text-slate-500 mt-0.5">Configure the OpenAI-compatible provider used by the AI chat feature.</p>
              </div>
              <Badge variant={aiSettings?.hasApiKey ? 'outline' : 'secondary'} className={aiSettings?.hasApiKey ? 'text-green-700 border-green-300' : ''}>
                {aiSettings?.hasApiKey ? 'Configured' : 'Not configured'}
              </Badge>
            </div>

            {aiSettingsLoading ? (
              <div className="p-8 text-center text-slate-400">Loading AI settings...</div>
            ) : (
              <form onSubmit={handleAISubmit} className="p-4 sm:p-6 space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2 flex items-center justify-between rounded-xl border border-slate-200 p-4">
                    <div>
                      <p className="font-medium text-slate-800">Enable AI tutor</p>
                      <p className="text-sm text-slate-500">Turn the AI study assistant on or off for learners.</p>
                    </div>
                    <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={aiForm.enabled}
                        onChange={(e) => setAiForm((prev) => ({ ...prev, enabled: e.target.checked }))}
                        className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                      />
                      Enabled
                    </label>
                  </div>

                  <div className="sm:col-span-2">
                    <Label htmlFor="ai-api-url">API URL</Label>
                    <Input
                      id="ai-api-url"
                      value={aiForm.apiUrl}
                      onChange={(e) => setAiForm((prev) => ({ ...prev, apiUrl: e.target.value }))}
                      placeholder={aiSettings?.envConfigured ? 'Using environment/default URL unless overridden' : 'https://api.openai.com/v1/chat/completions'}
                      className="mt-1.5"
                    />
                    <p className="text-xs text-slate-500 mt-1">Leave blank to use the environment/default OpenAI-compatible chat completions URL.</p>
                  </div>

                  <div>
                    <Label htmlFor="ai-model">Model</Label>
                    <Input
                      id="ai-model"
                      value={aiForm.model}
                      onChange={(e) => setAiForm((prev) => ({ ...prev, model: e.target.value }))}
                      placeholder="gpt-4o-mini"
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="ai-api-key">API Key</Label>
                    <div className="relative mt-1.5">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        id="ai-api-key"
                        type="password"
                        value={aiForm.apiKey}
                        onChange={(e) => setAiForm((prev) => ({ ...prev, apiKey: e.target.value, clearApiKey: false }))}
                        placeholder={aiSettings?.hasStoredApiKey ? 'Stored key saved (leave blank to keep)' : aiSettings?.envConfigured ? 'Using environment key (enter to override)' : 'Enter API key'}
                        className="pl-9"
                        autoComplete="off"
                      />
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span>{aiSettings?.hasStoredApiKey ? 'A key is stored in app settings.' : aiSettings?.envConfigured ? 'Using AI_API_KEY from environment.' : 'No API key configured.'}</span>
                      {(aiSettings?.hasStoredApiKey || aiSettings?.envConfigured) && (
                        <label className="inline-flex items-center gap-2 text-slate-700">
                          <input
                            type="checkbox"
                            checked={aiForm.clearApiKey}
                            onChange={(e) => setAiForm((prev) => ({ ...prev, clearApiKey: e.target.checked, apiKey: e.target.checked ? '' : prev.apiKey }))}
                            className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                          />
                          Clear stored key
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <Label htmlFor="ai-system-prompt">System Prompt (optional)</Label>
                    <Textarea
                      id="ai-system-prompt"
                      value={aiForm.systemPrompt}
                      onChange={(e) => setAiForm((prev) => ({ ...prev, systemPrompt: e.target.value }))}
                      placeholder="Leave blank to use the default Prince Math Academy tutor instructions."
                      className="mt-1.5 min-h-[140px]"
                    />
                    <p className="text-xs text-slate-500 mt-1">Custom instructions for the AI tutor. Leave blank to use the built-in default behavior.</p>
                  </div>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  {aiSettings?.envConfigured && !aiSettings?.hasStoredApiKey
                    ? 'The server environment already has an AI API key configured. Saving a key here stores an override in the database; clearing the stored key falls back to the environment key.'
                    : 'API keys saved here are stored in the database and used by the server. Never share keys publicly. After changing settings, test the AI chat to confirm the provider and model are correct.'}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['ai-settings'] })}
                    disabled={saveAISettingsMutation.isPending}
                  >
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    disabled={saveAISettingsMutation.isPending}
                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saveAISettingsMutation.isPending ? 'Saving...' : 'Save AI Settings'}
                  </Button>
                </div>
              </form>
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
                <Label htmlFor="video-url">Video URL</Label>
                <Input
                  id="video-url"
                  value={formData.video_url || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
                  placeholder="Paste a video URL or upload a file below"
                  className="mt-1.5"
                />
                <p className="text-xs text-slate-500 mt-1">Use an external/hosted video URL, or upload a video file below.</p>
              </div>

              <div className="sm:col-span-2">
                <Label>Video File Upload</Label>
                <div className="mt-1.5 border-2 border-dashed border-slate-200 rounded-xl p-5 text-center hover:border-violet-300 transition-colors">
                  {uploading.video ? (
                    <div className="flex items-center justify-center gap-3">
                      <Upload className="w-5 h-5 text-violet-500 animate-pulse" />
                      <span className="text-sm text-slate-600">Uploading... please wait</span>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'video')}
                        disabled={uploading.video}
                      />
                      <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                      <p className="text-sm text-slate-600">Click to upload a video file (max 500MB)</p>
                      {formData.video_url && <p className="text-xs text-green-600 mt-1">A video URL is currently set. Uploading will replace it.</p>}
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

              {/* Notes Upload */}
              <div className="sm:col-span-2">
                <Label>Lesson Notes (PDF)</Label>
                <div className="mt-1.5 border-2 border-dashed border-slate-200 rounded-xl p-5 text-center hover:border-violet-300 transition-colors">
                  {formData.notes_url ? (
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-sm font-medium text-violet-700">Notes PDF uploaded (private, download-limited)</span>
                      <Button type="button" variant="ghost" size="sm" aria-label="Remove notes" onClick={() => setFormData(prev => ({ ...prev, notes_url: '' }))}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <input type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'notes')} disabled={uploading.notes} />
                      <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                      <p className="text-sm text-slate-600">{uploading.notes ? 'Uploading...' : 'Click to upload notes (PDF, max 20MB)'}</p>
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              <Button
                type="submit"
                disabled={createVideoMutation.isPending || updateVideoMutation.isPending || uploading.video || uploading.thumbnail || uploading.notes}
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
    </div>
  );
}