import React from 'react';
import { motion } from 'framer-motion';
import { Video, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function UploadGuide() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 rounded-2xl p-6 mb-8"
    >
      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <Video className="w-5 h-5 text-violet-600" />
        Video Upload Guide
      </h3>

      <div className="space-y-4">
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <h4 className="font-medium text-slate-800 mb-2 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Best Practices
          </h4>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-violet-600 font-bold">•</span>
              <span><strong>Video Quality:</strong> Use at least 720p (HD) resolution for clear visibility</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-violet-600 font-bold">•</span>
              <span><strong>File Format:</strong> MP4 format is recommended for best compatibility</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-violet-600 font-bold">•</span>
              <span><strong>Thumbnail:</strong> Use 16:9 ratio images (1280x720px recommended)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-violet-600 font-bold">•</span>
              <span><strong>Duration:</strong> Keep lessons between 10-20 minutes for optimal engagement</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-violet-600 font-bold">•</span>
              <span><strong>Title:</strong> Use clear, descriptive titles (e.g., "Grade 11: Quadratic Equations - Part 1")</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <h4 className="font-medium text-slate-800 mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            Required Information
          </h4>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-violet-600 font-bold">•</span>
              <span><strong>Title:</strong> Required - The lesson name</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-violet-600 font-bold">•</span>
              <span><strong>Grade:</strong> Required - Grade 10, 11, or 12</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-violet-600 font-bold">•</span>
              <span><strong>Tier:</strong> Required - Standard or Premium access level</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-violet-600 font-bold">•</span>
              <span><strong>Topic:</strong> Optional - Math topic category</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-violet-600 font-bold">•</span>
              <span><strong>Description:</strong> Optional but recommended for better student understanding</span>
            </li>
          </ul>
        </div>
      </div>

      <Alert className="mt-4 border-violet-200 bg-violet-50">
        <AlertDescription className="text-sm text-slate-700">
          <strong>Note:</strong> After uploading, all registered students will receive a notification about the new lesson.
        </AlertDescription>
      </Alert>
    </motion.div>
  );
}