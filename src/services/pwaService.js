// LocalTunes PWA Service & Service Worker Lifecycle Manager
class PwaService {
  constructor() {
    this.deferredInstallPrompt = null;
    this.registration = null;
    this.canInstall = false;
    this.updateAvailable = false;
    this.listeners = new Map();

    this.init();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.listeners.get(event).delete(callback);
  }

  emit(event, payload) {
    if (this.listeners.has(event)) {
      for (const cb of this.listeners.get(event)) {
        try {
          cb(payload);
        } catch (e) {
          console.error(`Error in PWA listener for ${event}:`, e);
        }
      }
    }
  }

  init() {
    if (typeof window === 'undefined') return;

    // 1. Listen for PWA installation prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent automatic mini-infobar on mobile Chrome
      e.preventDefault();
      this.deferredInstallPrompt = e;
      this.canInstall = true;
      this.emit('installable', true);
    });

    // 2. Listen for successful installation
    window.addEventListener('appinstalled', () => {
      this.deferredInstallPrompt = null;
      this.canInstall = false;
      this.emit('installed', true);
      this.emit('installable', false);
    });

    // 3. Register service worker in production environments only
    // In development (Vite HMR), registration is skipped to prevent caching stale dev modules
    const isProd = Boolean(typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.PROD);

    if ('serviceWorker' in navigator) {
      if (isProd) {
        window.addEventListener('load', () => {
          this.registerServiceWorker();
        });
      } else {
        // In development mode, ensure any stale service worker is unregistered
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister().catch(() => {});
          }
        }).catch(() => {});
      }
    }
  }

  async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;

    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      this.registration = reg;

      // Check for updates
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version installed and waiting
            this.updateAvailable = true;
            this.emit('updateAvailable', {
              applyUpdate: () => {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              },
            });
          }
        });
      });
    } catch (err) {
      console.warn('LocalTunes ServiceWorker registration note:', err);
    }
  }

  // Trigger PWA Installation flow
  async promptInstall() {
    if (!this.deferredInstallPrompt) {
      return { success: false, reason: 'not-supported' };
    }

    try {
      this.deferredInstallPrompt.prompt();
      const choiceResult = await this.deferredInstallPrompt.userChoice;
      this.deferredInstallPrompt = null;
      this.canInstall = false;
      this.emit('installable', false);

      return {
        success: choiceResult.outcome === 'accepted',
        outcome: choiceResult.outcome,
      };
    } catch (err) {
      console.error('PWA install error:', err);
      return { success: false, error: err };
    }
  }
}

export const pwaService = new PwaService();
export default pwaService;
