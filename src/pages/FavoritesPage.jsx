import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/common/Icon.jsx';
import { TrackItem } from '../components/common/TrackItem.jsx';
import { formatDuration } from '../utils/formatters.js';
import { usePlayer } from '../context/PlayerContext.jsx';

export function FavoritesPage({
  favoriteTracks = [],
  favoritesSet = new Set(),
  isLoading = false,
  onToggleFavorite,
  onAddToPlaylist,
  onDeleteTrack,
}) {
  const { playTrack, setQueue } = usePlayer();
  const totalSecs = favoriteTracks.reduce((sum, t) => sum + (t.duration || 0), 0);

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 p-6 rounded-3xl bg-gradient-to-r from-rose-950/40 via-dark-card to-dark-surface border border-rose-500/20">
        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center text-white shadow-2xl flex-shrink-0">
          <Icon name="heartFilled" className="w-16 h-16 text-white" />
        </div>

        <div className="text-center sm:text-left flex-1 min-w-0">
          <div className="text-xs uppercase tracking-widest font-semibold text-rose-400">Playlist</div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">Favorites</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {favoriteTracks.length} song{favoriteTracks.length === 1 ? '' : 's'} &bull; {formatDuration(totalSecs)}
          </p>

          {favoriteTracks.length > 0 && (
            <div className="flex items-center justify-center sm:justify-start gap-3 mt-4">
              <button
                type="button"
                onClick={() => setQueue(favoriteTracks, 0, false)}
                className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-500/20 transition-all active:scale-95"
              >
                <Icon name="play" className="w-4 h-4" />
                <span>Play All</span>
              </button>
              <button
                type="button"
                onClick={() => setQueue(favoriteTracks, 0, true)}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs flex items-center gap-2 transition-all active:scale-95"
              >
                <Icon name="shuffle" className="w-4 h-4 text-rose-400" />
                <span>Shuffle</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Songs Content */}
      {isLoading && favoriteTracks.length === 0 ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          <div className="w-10 h-10 border-2 border-rose-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-medium text-slate-300">Loading favorites...</p>
        </div>
      ) : favoriteTracks.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-sm bg-dark-card/30 rounded-2xl border border-dark-border/40 p-8">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3 text-slate-500">
            <Icon name="heart" className="w-6 h-6" />
          </div>
          <p className="font-semibold text-white mb-1">No favorites yet</p>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mb-5">
            Tap the heart icon on any song in your library to add it to your favorites.
          </p>
          <Link
            to="/library"
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white font-medium transition-colors inline-block"
          >
            Browse Library
          </Link>
        </div>
      ) : (
        <div className="space-y-1">
          {favoriteTracks.map((track, idx) => (
            <TrackItem
              key={track.id}
              track={track}
              index={idx}
              isFavorite={favoritesSet.has(track.id)}
              contextQueue={favoriteTracks}
              onPlay={() => playTrack(track, favoriteTracks)}
              onToggleFavorite={onToggleFavorite}
              onAddToPlaylist={onAddToPlaylist}
              onDelete={onDeleteTrack}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default FavoritesPage;
