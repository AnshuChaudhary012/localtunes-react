import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Icon } from '../common/Icon.jsx';

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: 'home', end: true },
  { path: '/library', label: 'Library', icon: 'library' },
  { path: '/favorites', label: 'Favorites', icon: 'heart' },
  { path: '/playlists', label: 'Playlists', icon: 'playlists' },
  { path: '/search', label: 'Search', icon: 'search' },
  { path: '/settings', label: 'Settings', icon: 'settings' },
];

export function DesktopSidebar({
  onAddMusic,
  onInstallPwa,
  canInstallPwa = false,
  storageInfo = null,
  trackCount = 0,
}) {
  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-dark-surface/80 border-r border-dark-border backdrop-blur-xl flex-shrink-0 z-20">
      <div className="flex flex-col h-full justify-between p-5">
        {/* Top: Brand Logo & Main Nav */}
        <div className="space-y-6">
          {/* Brand Header */}
          <Link
            to="/"
            className="flex items-center gap-3 px-2 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
              <img src="/icons/icon.svg" className="w-7 h-7" alt="LocalTunes Logo" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
                LocalTunes
                <span className="text-[10px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  Local
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">Offline Web Music</p>
            </div>
          </Link>

          {/* "Add Music" Primary Action */}
          <button
            type="button"
            onClick={onAddMusic}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-sm shadow-glow flex items-center justify-center gap-2 transition-all transform active:scale-98"
          >
            <Icon name="upload" className="w-4 h-4" />
            <span>Add Music</span>
          </button>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                    isActive
                      ? 'bg-[var(--color-accent-badge-bg)] text-[var(--color-accent-primary)] border border-[var(--color-accent-badge-border)] shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent font-medium'
                  }`
                }
              >
                <Icon name={item.icon} className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom: Storage & PWA Install */}
        <div className="space-y-3 pt-4 border-t border-dark-border/80">
          {canInstallPwa && (
            <button
              type="button"
              onClick={onInstallPwa}
              className="w-full py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-colors border border-white/5"
            >
              <Icon name="sparkles" className="w-3.5 h-3.5 text-cyan-400" />
              <span>Install Web App</span>
            </button>
          )}

          {/* Storage Indicator */}
          <div className="p-3 rounded-xl bg-dark-card/60 border border-dark-border">
            <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
              <span>Local Storage</span>
              <span className="text-cyan-400 font-mono">
                {storageInfo ? storageInfo.formattedUsage : 'Calculating...'}
              </span>
            </div>
            {storageInfo ? (
              <>
                <div className="w-full bg-white/10 rounded-full h-1.5 mt-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-400 to-purple-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(4, storageInfo.percent || 0)}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  {trackCount} track{trackCount === 1 ? '' : 's'} stored offline
                </div>
              </>
            ) : (
              <div className="text-[10px] text-slate-500 mt-0.5">Calculating...</div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

export default DesktopSidebar;
