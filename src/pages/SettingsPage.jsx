import React, { useState, useEffect } from 'react';
import { Icon } from '../components/common/Icon.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { settingsService, ACCENT_COLORS } from '../services/settingsService.js';

export function SettingsPage({
  storageInfo = null,
  trackCount = 0,
  onClearRecentlyPlayed,
  onClearFavorites,
  onResetSettings,
}) {
  const [settings, setSettings] = useState(() => settingsService.getAll());
  const [effectiveTheme, setEffectiveTheme] = useState(() => settingsService.getEffectiveTheme());

  const [clearFavsModalOpen, setClearFavsModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);

  useEffect(() => {
    const unsub = settingsService.on('change', () => {
      setSettings(settingsService.getAll());
      setEffectiveTheme(settingsService.getEffectiveTheme());
    });
    return () => unsub();
  }, []);

  const handleUpdate = (key, value) => {
    settingsService.set(key, value);
    setSettings(settingsService.getAll());
    setEffectiveTheme(settingsService.getEffectiveTheme());
  };

  const handleReset = () => {
    settingsService.reset();
    setSettings(settingsService.getAll());
    setEffectiveTheme(settingsService.getEffectiveTheme());
    if (onResetSettings) onResetSettings();
    setResetModalOpen(false);
  };

  return (
    <div className="space-y-8 pb-20 max-w-4xl mx-auto animate-fadeIn">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-dark-border/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-glow">
              <Icon name="settings" className="w-6 h-6" />
            </span>
            <span>Settings</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Personalize your listening experience, interface theme, audio behavior, and storage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setResetModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold border border-white/5 transition-all flex items-center gap-1.5 focus:outline-none"
          >
            <Icon name="refresh" className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </header>

      {/* SECTION 1: APPEARANCE */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-slate-400">
          <Icon name="palette" className="w-4 h-4 text-cyan-400" />
          <span>Appearance & Themes</span>
        </div>

        <div className="p-5 rounded-2xl bg-dark-card/60 border border-dark-border/60 space-y-6">
          {/* Theme Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-white">Interface Theme</h3>
                <p className="text-xs text-slate-400">Choose your preferred appearance or sync with your device OS</p>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Active: {effectiveTheme.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* System */}
              <button
                type="button"
                onClick={() => handleUpdate('theme', 'system')}
                className={`relative p-4 rounded-xl border text-left transition-all focus:outline-none flex flex-col justify-between gap-3 ${
                  settings.theme === 'system'
                    ? 'bg-cyan-500/10 border-cyan-500/40 shadow-glow'
                    : 'bg-dark-bg/60 border-dark-border hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-white/5 text-slate-300">
                    <Icon name="monitor" className="w-5 h-5" />
                  </div>
                  {settings.theme === 'system' && (
                    <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-xs font-bold">
                      <Icon name="check" className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">System</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Automatically follows OS mode</p>
                </div>
              </button>

              {/* Dark */}
              <button
                type="button"
                onClick={() => handleUpdate('theme', 'dark')}
                className={`relative p-4 rounded-xl border text-left transition-all focus:outline-none flex flex-col justify-between gap-3 ${
                  settings.theme === 'dark'
                    ? 'bg-cyan-500/10 border-cyan-500/40 shadow-glow'
                    : 'bg-dark-bg/60 border-dark-border hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-white/5 text-slate-300">
                    <Icon name="moon" className="w-5 h-5" />
                  </div>
                  {settings.theme === 'dark' && (
                    <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-xs font-bold">
                      <Icon name="check" className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Dark</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Deep charcoal with subtle neon glows</p>
                </div>
              </button>

              {/* Light */}
              <button
                type="button"
                onClick={() => handleUpdate('theme', 'light')}
                className={`relative p-4 rounded-xl border text-left transition-all focus:outline-none flex flex-col justify-between gap-3 ${
                  settings.theme === 'light'
                    ? 'bg-cyan-500/10 border-cyan-500/40 shadow-glow'
                    : 'bg-dark-bg/60 border-dark-border hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-white/5 text-slate-300">
                    <Icon name="sun" className="w-5 h-5" />
                  </div>
                  {settings.theme === 'light' && (
                    <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-xs font-bold">
                      <Icon name="check" className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Light</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Crisp, clean high-contrast daylight</p>
                </div>
              </button>
            </div>
          </div>

          {/* Accent Color Selection */}
          <div className="pt-4 border-t border-dark-border/40">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-white">Accent Palette</h3>
              <p className="text-xs text-slate-400">Customizes sliders, glowing playback progress, and active controls</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
              {ACCENT_COLORS.map((col) => (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => handleUpdate('accentColor', col.id)}
                  className={`p-2.5 rounded-xl border transition-all flex items-center gap-2.5 text-left focus:outline-none ${
                    settings.accentColor === col.id
                      ? 'border-white/40 bg-white/10 shadow-sm'
                      : 'border-dark-border/60 bg-dark-bg/40 hover:bg-white/5'
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center shadow-md"
                    style={{ backgroundColor: col.hex }}
                  >
                    {settings.accentColor === col.id && (
                      <Icon name="check" className="w-3.5 h-3.5 text-white" />
                    )}
                  </span>
                  <span className="text-xs font-medium text-slate-200 truncate">{col.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Layout Density & Artwork Toggles */}
          <div className="pt-4 border-t border-dark-border/40 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-dark-bg/40 border border-dark-border/60 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-white">Layout Density</h4>
                <p className="text-[11px] text-slate-400">Compact or spacious rows</p>
              </div>
              <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5 border border-white/5">
                <button
                  type="button"
                  onClick={() => handleUpdate('layout', 'comfortable')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    settings.layout === 'comfortable'
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Comfortable
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdate('layout', 'compact')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    settings.layout === 'compact'
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Compact
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-dark-bg/40 border border-dark-border/60 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-white">Show Artwork</h4>
                <p className="text-[11px] text-slate-400">Thumbnails in song lists</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!settings.showArtwork}
                  onChange={(e) => handleUpdate('showArtwork', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500" />
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: PLAYBACK BEHAVIOR */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-slate-400">
          <Icon name="play" className="w-4 h-4 text-cyan-400" />
          <span>Playback Engine</span>
        </div>

        <div className="p-5 rounded-2xl bg-dark-card/60 border border-dark-border/60 space-y-4">
          <div className="flex items-center justify-between py-1">
            <div className="pr-4">
              <h3 className="text-sm font-semibold text-white">Autoplay Next Song</h3>
              <p className="text-xs text-slate-400">Automatically start the next song when current track finishes</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={!!settings.autoplay}
                onChange={(e) => handleUpdate('autoplay', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500" />
            </label>
          </div>

          <div className="pt-3 border-t border-dark-border/40 flex items-center justify-between py-1">
            <div className="pr-4">
              <h3 className="text-sm font-semibold text-white">Remember Active Song</h3>
              <p className="text-xs text-slate-400">Restore last active track and queue when opening the web player</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={!!settings.rememberLastTrack}
                onChange={(e) => handleUpdate('rememberLastTrack', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500" />
            </label>
          </div>

          <div className="pt-3 border-t border-dark-border/40 flex items-center justify-between py-1">
            <div className="pr-4">
              <h3 className="text-sm font-semibold text-white">Remember Playback Timestamp</h3>
              <p className="text-xs text-slate-400">Resume paused tracks from where you left off</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={!!settings.rememberPlaybackPosition}
                onChange={(e) => handleUpdate('rememberPlaybackPosition', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500" />
            </label>
          </div>
        </div>
      </section>

      {/* SECTION 3: PLAYER & LOCK SCREEN */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-slate-400">
          <Icon name="sliders" className="w-4 h-4 text-cyan-400" />
          <span>Player & Lock-Screen Controls</span>
        </div>

        <div className="p-5 rounded-2xl bg-dark-card/60 border border-dark-border/60 space-y-4">
          <div className="flex items-center justify-between py-1">
            <div className="pr-4">
              <h3 className="text-sm font-semibold text-white">Lock-Screen & Headphone Controls</h3>
              <p className="text-xs text-slate-400">Enable Media Session API for iPhone lock-screen, Apple Watch, and AirPods</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={!!settings.enableMediaSession}
                onChange={(e) => handleUpdate('enableMediaSession', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500" />
            </label>
          </div>

          <div className="pt-3 border-t border-dark-border/40 flex items-center justify-between py-1">
            <div className="pr-4">
              <h3 className="text-sm font-semibold text-white">Show Remaining Time</h3>
              <p className="text-xs text-slate-400">Display remaining countdown (-02:45) instead of total track length</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={!!settings.showRemainingTime}
                onChange={(e) => handleUpdate('showRemainingTime', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500" />
            </label>
          </div>

          <div className="pt-3 border-t border-dark-border/40 flex items-center justify-between py-1">
            <div className="pr-4">
              <h3 className="text-sm font-semibold text-white">Mini Player Progress Indicator</h3>
              <p className="text-xs text-slate-400">Display top slim progress line on the bottom mini player</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={!!settings.showMiniProgressBar}
                onChange={(e) => handleUpdate('showMiniProgressBar', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500" />
            </label>
          </div>

          <div className="pt-3 border-t border-dark-border/40 flex items-center justify-between py-1">
            <div className="pr-4">
              <h3 className="text-sm font-semibold text-white">Audio Spectrum Visualizer</h3>
              <p className="text-xs text-slate-400">Display real-time animated frequency visualizer in the expanded player</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={settings.enableVisualizer !== false}
                onChange={(e) => handleUpdate('enableVisualizer', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500" />
            </label>
          </div>
        </div>
      </section>

      {/* SECTION 4: LIBRARY & SORTING */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-slate-400">
          <Icon name="library" className="w-4 h-4 text-cyan-400" />
          <span>Library Defaults</span>
        </div>

        <div className="p-5 rounded-2xl bg-dark-card/60 border border-dark-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Default Library Sort Order</h3>
              <p className="text-xs text-slate-400">Choose how songs are ordered when browsing your library</p>
            </div>

            <select
              value={settings.defaultLibrarySort || 'dateAdded'}
              onChange={(e) => handleUpdate('defaultLibrarySort', e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-dark-bg border border-dark-border text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="dateAdded">Recently Added</option>
              <option value="title">Song Title (A-Z)</option>
              <option value="artist">Artist Name (A-Z)</option>
              <option value="album">Album Name (A-Z)</option>
              <option value="duration">Duration</option>
            </select>
          </div>
        </div>
      </section>

      {/* SECTION 5: DATA & STORAGE MANAGEMENT */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-slate-400">
          <Icon name="database" className="w-4 h-4 text-cyan-400" />
          <span>Offline Storage & Data</span>
        </div>

        <div className="p-5 rounded-2xl bg-dark-card/60 border border-dark-border/60 space-y-5">
          {/* Storage Gauge */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
              <span>Browser IndexedDB Usage</span>
              <span className="font-mono text-cyan-400">
                {storageInfo ? `${storageInfo.formattedUsage} / ${storageInfo.formattedQuota}` : 'Calculating...'}
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-400 to-purple-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.max(3, storageInfo?.percent || 0)}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500 mt-1.5 flex items-center justify-between">
              <span>{trackCount} song{trackCount === 1 ? '' : 's'} stored offline in your device</span>
              <span>{storageInfo?.percent || 0}% quota utilized</span>
            </div>
          </div>

          {/* Danger Zone Actions */}
          <div className="pt-4 border-t border-dark-border/40 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onClearRecentlyPlayed}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white border border-white/5 transition-all flex items-center justify-center gap-2 focus:outline-none"
            >
              <Icon name="refresh" className="w-3.5 h-3.5" />
              <span>Clear Recently Played</span>
            </button>

            <button
              type="button"
              onClick={() => setClearFavsModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-xs font-semibold text-rose-400 hover:text-rose-300 border border-rose-500/20 transition-all flex items-center justify-center gap-2 focus:outline-none"
            >
              <Icon name="trash" className="w-3.5 h-3.5" />
              <span>Clear All Favorites</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 6: PRIVACY & SYSTEM INFO */}
      <footer className="p-5 rounded-2xl bg-dark-card/40 border border-dark-border/40 text-center space-y-1.5">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-300">
          <span>LocalTunes Web Player</span>
          <span className="w-1 h-1 rounded-full bg-slate-500" />
          <span className="font-mono text-cyan-400">v1.2.0 (React)</span>
        </div>
        <p className="text-[11px] text-slate-500 max-w-md mx-auto">
          100% private, client-side offline audio engine. All songs, artwork, and preferences remain solely on your device.
        </p>
      </footer>

      {/* Modal: Clear Favorites */}
      <Modal
        isOpen={clearFavsModalOpen}
        title="Clear All Favorites?"
        onClose={() => setClearFavsModalOpen(false)}
        confirmText="Clear Favorites"
        confirmStyle="danger"
        onConfirm={() => {
          if (onClearFavorites) onClearFavorites();
          setClearFavsModalOpen(false);
        }}
      >
        <p className="text-sm text-slate-300">
          Are you sure you want to remove all songs from your Favorites? Your offline audio files will not be deleted.
        </p>
      </Modal>

      {/* Modal: Reset Settings */}
      <Modal
        isOpen={resetModalOpen}
        title="Reset All Settings?"
        onClose={() => setResetModalOpen(false)}
        confirmText="Reset to Defaults"
        confirmStyle="cyan"
        onConfirm={handleReset}
      >
        <p className="text-sm text-slate-300">
          This will restore default theme, accent color, and playback behaviors. Your songs and playlists will remain untouched.
        </p>
      </Modal>
    </div>
  );
}
