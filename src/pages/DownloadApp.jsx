import { useState } from 'react';
import { motion } from 'framer-motion';
import { Apple, Download, MoreVertical, Share, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { promptPwaInstall, usePwaInstallState } from '@/lib/pwaInstall';

export default function DownloadApp() {
  const installState = usePwaInstallState();
  const [message, setMessage] = useState('');
  const [installing, setInstalling] = useState(false);

  const handleInstall = async () => {
    setInstalling(true);
    setMessage('');
    try {
      const accepted = await promptPwaInstall();
      if (!accepted) setMessage('Installation was not completed. You can try again from your browser menu.');
    } catch (error) {
      console.error('PWA installation failed:', error);
      setMessage('Your browser could not start installation. Use the browser menu instructions below.');
    } finally {
      setInstalling(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f4ff] px-4 py-8 text-slate-800 sm:px-6 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#efedff] text-[#6546e8]">
            <Smartphone className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold sm:text-4xl">Install Prince Math Academy</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600 sm:text-base">
            Add the learning app to your home screen for quick access. It uses your browser and your existing account.
          </p>
        </div>

        <section className="rounded-2xl border border-[#e9e6f7] bg-white p-5 shadow-[0_12px_36px_rgba(70,58,125,0.08)] sm:p-7">
          {installState === 'installed' ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center text-sm text-emerald-800">
              Prince Math Academy is installed on this device.
            </div>
          ) : installState === 'available' ? (
            <div className="text-center">
              <Button
                onClick={handleInstall}
                disabled={installing}
                size="lg"
                className="w-full bg-[#5b38e8] text-white hover:bg-[#4c2ed0] sm:w-auto"
              >
                <Download className="h-4 w-4" />
                {installing ? 'Opening install prompt…' : 'Install app'}
              </Button>
              <p className="mt-3 text-xs text-slate-500">
                Your browser will show its own confirmation before installation.
              </p>
            </div>
          ) : (
            <p className="rounded-xl border border-[#ded9fa] bg-[#f5f3ff] p-4 text-center text-sm text-[#51428d]">
              This browser has not offered an automatic install prompt. Use the browser menu steps below instead.
            </p>
          )}

          {message && (
            <p role="status" className="mt-4 text-center text-sm text-amber-700">{message}</p>
          )}
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-[#e9e6f7] bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 font-semibold text-foreground">
              <MoreVertical className="h-4 w-4 text-[#6546e8]" />
              Android
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              Open this page in Chrome, tap the menu, then choose <strong className="text-slate-800">Install app</strong> or <strong className="text-slate-800">Add to Home screen</strong>, if shown.
            </p>
          </article>

          <article className="rounded-2xl border border-[#e9e6f7] bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 font-semibold text-foreground">
              <Apple className="h-4 w-4 text-[#6546e8]" />
              iPhone or iPad
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              Open this page in Safari, tap <Share className="inline h-4 w-4 align-text-bottom" /> Share, choose <strong className="text-slate-800">Add to Home Screen</strong>, then confirm.
            </p>
          </article>
        </section>

        <p className="mt-6 text-center text-xs text-slate-500">
          This is a web app installed from your browser. No APK download is provided.
        </p>
      </motion.div>
    </main>
  );
}
