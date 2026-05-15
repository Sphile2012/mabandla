import React, { useState, useEffect } from 'react';
import { prince } from '@/api/princeClient';
import { motion } from 'framer-motion';
import { Download, Smartphone, Monitor, CheckCircle, Shield, Apple, Globe, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

const platforms = [
  {
    id: 'android',
    label: 'Android',
    icon: Smartphone,
    color: 'from-green-500 to-emerald-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    badge: 'bg-green-100 text-green-800',
    hasApk: true,
    steps: [
      { title: 'Download the APK', desc: 'Tap the green "Download APK" button above to download MathTutor.apk to your phone.' },
      { title: 'Enable Unknown Sources', desc: 'When prompted, tap "Settings" and enable "Install from this source" (or go to Settings → Security → Unknown Sources).' },
      { title: 'Open the File', desc: 'Open your Downloads folder and tap on MathTutor.apk.' },
      { title: 'Install & Sign In', desc: 'Tap "Install", wait for it to finish, then open the app and sign in.' },
    ],
    note: 'Requires Android 5.0 or higher',
  },
  {
    id: 'ios',
    label: 'iPhone / iPad',
    icon: Apple,
    color: 'from-slate-700 to-slate-900',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-700',
    badge: 'bg-slate-100 text-slate-800',
    hasApk: false,
    steps: [
      { title: 'Open Safari', desc: 'On your iPhone or iPad, open Safari (not Chrome).' },
      { title: 'Visit the Website', desc: 'Go to princemath.co.za in Safari.' },
      { title: 'Tap the Share Button', desc: 'Tap the Share icon (the box with an arrow pointing up) at the bottom of Safari.' },
      { title: 'Add to Home Screen', desc: 'Scroll down and tap "Add to Home Screen", then tap "Add". The MathTutor icon will appear on your home screen!' },
    ],
    note: 'Works on iOS 12 or higher — no App Store needed',
  },
  {
    id: 'desktop',
    label: 'PC / Laptop',
    icon: Monitor,
    color: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-800',
    hasApk: false,
    steps: [
      { title: 'Open Chrome or Edge', desc: 'Use Google Chrome or Microsoft Edge on your computer.' },
      { title: 'Visit the Website', desc: 'Go to princemath.co.za.' },
      { title: 'Click the Install Icon', desc: 'Look for the install icon (⊕) in the browser address bar on the right side.' },
      { title: 'Install & Launch', desc: 'Click "Install" and MathTutor will open like a desktop app — no browser tab needed!' },
    ],
    note: 'Works on Windows, Mac, and Linux',
  },
];

export default function DownloadApp() {
  const [selected, setSelected] = useState('android');
  const [apkInfo, setApkInfo] = useState(null);
  const [loadingApk, setLoadingApk] = useState(false);

  const activePlatform = platforms.find(p => p.id === selected);

  useEffect(() => {
    // Fetch APK download info
    prince.functions.invoke('getApkDownload', {})
      .then(res => setApkInfo(res?.appInfo || res?.data?.appInfo || null))
      .catch(() => setApkInfo(null));
  }, []);

  const handleDownloadApk = async () => {
    // Try APK URL from function first
    if (apkInfo?.downloadUrl) {
      window.open(apkInfo.downloadUrl, '_blank');
      return;
    }
    // Fallback: direct download from GitHub releases or known URL
    const fallbackUrl = 'https://github.com/Sphile2012/math-mastery-hub-copy/releases/latest/download/MathTutor.apk';
    window.open(fallbackUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 py-14 md:py-20">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 px-4 py-2 rounded-full text-sm font-medium mb-5">
              <Globe className="w-4 h-4" />
              Available on All Devices
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
              Get the MathTutor App
            </h1>
            <p className="text-white/80 text-base md:text-lg">
              Install on Android, iPhone, iPad, or your computer — no app store needed!
            </p>

            {/* Download APK button — shown for Android */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                onClick={handleDownloadApk}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 h-12"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Android APK
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 px-8 h-12"
                onClick={() => {
                  setSelected('ios');
                  document.getElementById('platform-tabs')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Apple className="w-5 h-5 mr-2" />
                iPhone / iPad
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Platform Tabs */}
      <div id="platform-tabs" className="max-w-3xl mx-auto px-4 -mt-5">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-2 flex gap-2">
          {platforms.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelected(p.id)}
              className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                selected === p.id
                  ? `bg-gradient-to-r ${p.color} text-white shadow-md`
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <p.icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="text-center leading-tight">{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="max-w-3xl mx-auto px-4 py-6 md:py-8">
        <motion.div key={selected} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          
          {/* APK Download CTA for Android */}
          {selected === 'android' && (
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-5 mb-5 flex flex-col sm:flex-row items-center gap-4 text-white">
              <div className="flex-1">
                <h3 className="font-bold text-lg">MathTutor Android App</h3>
                <p className="text-white/80 text-sm mt-1">
                  {apkInfo?.available ? `Version ${apkInfo.version} · ${apkInfo.size}` : 'Direct APK download'}
                </p>
              </div>
              <Button
                onClick={handleDownloadApk}
                className="bg-white text-green-700 hover:bg-white/90 font-bold px-6 flex-shrink-0"
              >
                <Download className="w-4 h-4 mr-2" />
                Download APK
              </Button>
            </div>
          )}

          <div className={`rounded-2xl border-2 ${activePlatform.border} ${activePlatform.bg} p-5 md:p-8 mb-5`}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${activePlatform.color} flex items-center justify-center flex-shrink-0`}>
                <activePlatform.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className={`text-lg font-bold ${activePlatform.text}`}>{activePlatform.label} Setup Guide</h2>
                <span className={`text-xs px-2 py-0.5 rounded-full ${activePlatform.badge}`}>{activePlatform.note}</span>
              </div>
            </div>

            <div className="space-y-5">
              {activePlatform.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${activePlatform.color} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white font-bold text-sm">{i + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-0.5 text-sm md:text-base">{step.title}</h3>
                    <p className="text-slate-600 text-xs md:text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-8 mb-5">
            <h3 className="font-bold text-slate-800 mb-4 text-base md:text-lg">What you get</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                'Watch video lessons anytime',
                'Save your favourite lessons',
                'Comment and ask questions',
                'Get notifications for new content',
                'Works on all devices',
                'Learn at your own pace',
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-600 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <Alert className="border-violet-200 bg-violet-50">
            <Shield className="w-4 h-4 text-violet-600" />
            <AlertDescription className="text-slate-700 text-sm">
              <strong>Safe & Secure:</strong> MathTutor is completely safe to install on any device. Your data is protected and never shared.
            </AlertDescription>
          </Alert>
        </motion.div>
      </div>
    </div>
  );
}