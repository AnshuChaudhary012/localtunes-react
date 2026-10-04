import React from 'react';
import { Link } from 'react-router-dom';

export function MobileHeader({ onAddMusic, onInstallPwa, canInstallPwa = false }) {
  return (
    <header
      className="md:hidden flex items-center justify-between px-4 py-3 bg-dark-surface/90 border-b border-dark-border backdrop-blur-md z-20 pt-safe"
      style={{ paddingTop: '12px' }}
    >
      <Link
        to="/"
        className="flex items-center gap-2.5 cursor-pointer"
        aria-label="LocalTunes Home"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-glow">
          <img src="/icons/icon.svg" className="w-5 h-5" alt="Logo" />
        </div>
        <span className="font-extrabold text-base text-white tracking-tight">LocalTunes</span>
      </Link>

      <div className="flex items-center gap-2">
        {canInstallPwa && (
          <button
            type="button"
            onClick={onInstallPwa}
            className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:text-white transition-colors"
            title="Install LocalTunes App"
            aria-label="Install App"
          >
            <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        )}
        <Link
          to="/settings"
          className="p-2 rounded-xl bg-dark-card/80 border border-dark-border text-slate-300 hover:text-white transition-colors"
          aria-label="Settings"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </Link>

        <button
          type="button"
          onClick={onAddMusic}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium text-xs shadow-glow flex items-center gap-1.5 active:scale-95 transition-transform"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add</span>
        </button>
      </div>
    </header>
  );
}

export default MobileHeader;
