import { useSyncExternalStore } from 'react';

let deferredPrompt = null;
let installed = false;
const listeners = new Set();

function notify() {
  listeners.forEach((listener) => listener());
}

if (typeof window !== 'undefined') {
  installed = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    notify();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    installed = true;
    notify();
  });
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  if (installed) return 'installed';
  return deferredPrompt ? 'available' : 'unavailable';
}

export function usePwaInstallState() {
  return useSyncExternalStore(subscribe, getSnapshot, () => 'unavailable');
}

export async function promptPwaInstall() {
  if (!deferredPrompt) return false;

  const prompt = deferredPrompt;
  deferredPrompt = null;
  notify();

  await prompt.prompt();
  const choice = await prompt.userChoice;
  if (choice.outcome === 'accepted') installed = true;
  notify();
  return choice.outcome === 'accepted';
}
