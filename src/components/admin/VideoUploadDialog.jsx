import React from 'react';
import { Upload, X, Save, CheckCircle, Image as ImageIcon } from 'lucide-react';
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

const grades = ['Grade 10', 'Grade 11', 'Grade 12'];
const tiers = ['Standard', 'Premium'];
const topics = ['Algebra', 'Functions', 'Geometry', 'Statistics', 'Trigonometry'];

export default function VideoUploadDialog({ 
  isOpen, 
  onClose, 
  formData, 
  setFormData, 
  onSubmit, 
  editingVideo,
  uploading,
  handleFileUpload,
  isPending
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {editingVideo ? 'Edit Video Lesson' : 'Upload New Video Lesson'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title">Lesson Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Introduction to Quadratic Equations"
                className="mt-1.5"
                required
              />
            </div>

            <div>
              <Label htmlFor="grade">Grade Level *</Label>
              <Select
                value={formData.grade}
                onValueChange={(value) => setFormData(prev => ({ ...prev, grade: value }))}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map(g => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tier">Access Tier *</Label>
              <Select
                value={formData.tier}
                onValueChange={(value) => setFormData(prev => ({ ...prev, tier: value }))}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  {tiers.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="topic">Math Topic</Label>
              <Select
                value={formData.topic}
                onValueChange={(value) => setFormData(prev => ({ ...prev, topic: value }))}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select topic" />
                </SelectTrigger>
                <SelectContent>
                  {topics.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="duration">Duration (mm:ss)</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="e.g., 15:30"
                className="mt-1.5"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Lesson Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What will students learn in this lesson?"
                className="mt-1.5 min-h-[100px]"
              />
            </div>

            {/* Video Upload */}
            <div className="col-span-2">
              <Label>Video File</Label>
              <div className="mt-1.5 border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-violet-300 transition-colors">
                {formData.video_url ? (
                  <div className="flex items-center justify-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-slate-600">Video uploaded successfully</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, video_url: '' }))}
                    >
                      <X className="w-4 h-4" />
                    </Button>
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
                    <p className="text-sm text-slate-600 font-medium">
                      {uploading.video ? 'Uploading video...' : 'Click to upload video'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">MP4 recommended • Max 500MB</p>
                  </label>
                )}
              </div>
            </div>

            {/* Thumbnail Upload */}
            <div className="col-span-2">
              <Label>Thumbnail Image</Label>
              <div className="mt-1.5 border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-violet-300 transition-colors">
                {formData.thumbnail_url ? (
                  <div className="flex items-center justify-center gap-3">
                    <img src={formData.thumbnail_url} alt="Thumbnail" className="h-16 rounded" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, thumbnail_url: '' }))}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'thumbnail')}
                      disabled={uploading.thumbnail}
                    />
                    <ImageIcon className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                    <p className="text-sm text-slate-600 font-medium">
                      {uploading.thumbnail ? 'Uploading thumbnail...' : 'Click to upload thumbnail'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">JPG or PNG • 16:9 ratio • Max 5MB</p>
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {editingVideo ? 'Update Lesson' : 'Upload Lesson'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}