import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/common/Icon.jsx';

export function NotFoundPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] px-6 text-center animate-fadeIn">
      {/* Glow Icon Box */}
      <div className="relative w-24 h-24 mb-6 flex items-center justify-center rounded-3xl bg-gradient-to-tr from-cyan-500/20 via-purple-500/20 to-blue-500/20 border border-white/10 shadow-glow">
        <div className="text-cyan-400">
          <Icon name="music" className="w-12 h-12" />
        </div>
        <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-md">
          404
        </div>
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
        Page Not Found
      </h1>
      <p className="text-slate-400 max-w-md text-sm sm:text-base mb-8">
        The page you are looking for doesn't exist or may have been moved. Return home to continue playing your music.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          to="/"
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-glow flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95"
        >
          <Icon name="home" className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <Link
          to="/library"
          className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <Icon name="library" className="w-4 h-4 text-cyan-400" />
          <span>Browse Library</span>
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
