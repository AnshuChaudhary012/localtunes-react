import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/common/Icon.jsx';
import { TrackItem } from '../components/common/TrackItem.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { getGreeting } from '../utils/formatters.js';
import { getArtworkSrc } from '../utils/artworkGenerator.js';
import { usePlayer } from '../context/PlayerContext.jsx';

export function HomePage({
  allTracks = [],
  recentlyPlayed = [],
  recentlyAdded = [],
  favoritesSet = new Set(),
  isLoading = false,
  onAddMusic,
  onTryDemoTrack,
  onToggleFavorite,
  onAddToPlaylist,
  onDeleteTrack,
}) {
  const { currentTrack, isPlaying, playTrack, setQueue } = usePlayer();
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);

  // If initial load is in progress, show loading state
  if (isLoading && allTracks.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center animate-fadeIn">
        <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-400">Loading music library...</p>
      </div>
    );
  }

  // If library has no tracks, show rich empty state
  if (allTracks.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[75vh] px-6 text-center animate-fadeIn">
        <div className="relative w-28 h-28 mb-6 flex items-center justify-center rounded-3xl bg-gradient-to-tr from-cyan-500/20 via-purple-500/20 to-blue-500/20 border border-white/10 shadow-glow">
          <div className="text-cyan-400">
            <Icon name="music" className="w-14 h-14" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-white shadow-md">
            <Icon name="plus" className="w-5 h-5" />
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
          Your library is empty
        </h2>
        <p className="text-slate-400 max-w-md text-sm sm:text-base mb-8">
          Add your first song to start listening. LocalTunes plays your local audio files directly in the browser with full offline playback.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={onAddMusic}
            className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-glow flex items-center gap-2.5 transition-all transform hover:scale-105 active:scale-95"
          >
            <Icon name="upload" className="w-5 h-5" />
            <span>Add Music</span>
          </button>

          {onTryDemoTrack && (
            <button
              type="button"
              onClick={onTryDemoTrack}
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 text-sm font-medium flex items-center gap-2 transition-colors active:scale-95"
            >
              <Icon name="sparkles" className="w-4 h-4 text-cyan-400" />
              <span>Try Demo Track</span>
            </button>
          )}
        </div>

        <div className="mt-8 flex items-center gap-2 text-xs text-slate-500">
          <span>Supported: MP3, M4A, WAV, AAC, FLAC, OGG</span>
        </div>
      </div>
    );
  }

  // Continue listening track
  const continueTrack = recentlyPlayed[0] || allTracks[0];

  return (
    <div className="space-y-8 pb-12 animate-fadeIn">
      {/* Greeting & Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {getGreeting()}
          </h2>
          <p className="text-sm text-slate-400 mt-1">Here is what's ready to play in your local collection</p>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setQueue(allTracks, 0, true)}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-2 transition-all active:scale-95"
          >
            <Icon name="shuffle" className="w-4 h-4 text-cyan-400" />
            <span>Shuffle Library</span>
          </button>
          <button
            type="button"
            onClick={onAddMusic}
            className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-2 transition-all active:scale-95"
          >
            <Icon name="upload" className="w-4 h-4" />
            <span>Add Music</span>
          </button>
          <button
            type="button"
            onClick={() => setShortcutsModalOpen(true)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs transition-colors"
            title="Keyboard Shortcuts"
          >
            <Icon name="info" className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Continue Listening Hero Card */}
      {continueTrack && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-dark-card via-dark-surface to-dark-card border border-dark-border p-6 shadow-xl">
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div
                onClick={() => playTrack(continueTrack, allTracks)}
                className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-lg flex-shrink-0 group cursor-pointer"
              >
                <img
                  src={getArtworkSrc(continueTrack)}
                  alt={continueTrack.title || 'Track'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-glow">
                    <Icon name="play" className="w-5 h-5 ml-0.5" />
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider font-semibold text-cyan-400">
                  Continue Listening
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5 max-w-md truncate">
                  {continueTrack.title || continueTrack.fileName}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  {continueTrack.artist || 'Unknown Artist'} &bull; {continueTrack.album || 'Local'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => playTrack(continueTrack, allTracks)}
              className="px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-glow flex items-center gap-2.5 transition-all transform active:scale-95"
            >
              <Icon name="play" className="w-5 h-5" />
              <span>Play Now</span>
            </button>
          </div>
        </div>
      )}

      {/* Recently Played Section */}
      {recentlyPlayed.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white tracking-tight">Recently Played</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {recentlyPlayed.slice(0, 6).map((track) => (
              <div
                key={track.id}
                onClick={() => playTrack(track, recentlyPlayed)}
                className="group p-3 rounded-2xl bg-dark-card/60 hover:bg-dark-card border border-dark-border/60 hover:border-dark-border transition-all cursor-pointer"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden mb-2.5 shadow-md">
                  <img
                    src={getArtworkSrc(track)}
                    alt={track.title || 'Track'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <div className="w-9 h-9 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-glow">
                      <Icon name="play" className="w-4 h-4 ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="font-medium text-xs text-white truncate">
                  {track.title || track.fileName}
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">
                  {track.artist || 'Unknown Artist'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recently Added Tracks List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Recently Added</h3>
            <p className="text-xs text-slate-400 mt-0.5">Your latest imported local audio</p>
          </div>
          <Link
            to="/library"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            See all in Library &rarr;
          </Link>
        </div>

        <div className="space-y-1">
          {recentlyAdded.slice(0, 8).map((track, idx) => (
            <TrackItem
              key={track.id}
              track={track}
              index={idx}
              isFavorite={favoritesSet.has(track.id)}
              contextQueue={allTracks}
              onPlay={() => playTrack(track, allTracks)}
              onToggleFavorite={onToggleFavorite}
              onAddToPlaylist={onAddToPlaylist}
              onDelete={onDeleteTrack}
            />
          ))}
        </div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      <Modal
        isOpen={shortcutsModalOpen}
        title="Keyboard Shortcuts"
        onClose={() => setShortcutsModalOpen(false)}
        showCancel={false}
        confirmText="Got it"
        onConfirm={() => setShortcutsModalOpen(false)}
      >
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between py-1.5 border-b border-white/5">
            <span className="text-slate-400">Play / Pause</span>
            <kbd className="px-2 py-1 bg-white/10 rounded font-mono text-xs text-cyan-400">Space</kbd>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-white/5">
            <span className="text-slate-400">Seek 5s Forward / Back</span>
            <kbd className="px-2 py-1 bg-white/10 rounded font-mono text-xs text-cyan-400">&larr; / &rarr;</kbd>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-white/5">
            <span className="text-slate-400">Next Track</span>
            <kbd className="px-2 py-1 bg-white/10 rounded font-mono text-xs text-cyan-400">Shift + &rarr;</kbd>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-white/5">
            <span className="text-slate-400">Previous Track</span>
            <kbd className="px-2 py-1 bg-white/10 rounded font-mono text-xs text-cyan-400">Shift + &larr;</kbd>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-white/5">
            <span className="text-slate-400">Volume Up / Down</span>
            <kbd className="px-2 py-1 bg-white/10 rounded font-mono text-xs text-cyan-400">&uarr; / &darr;</kbd>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-white/5">
            <span className="text-slate-400">Toggle Mute</span>
            <kbd className="px-2 py-1 bg-white/10 rounded font-mono text-xs text-cyan-400">M</kbd>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-white/5">
            <span className="text-slate-400">Toggle Shuffle</span>
            <kbd className="px-2 py-1 bg-white/10 rounded font-mono text-xs text-cyan-400">S</kbd>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-slate-400">Toggle Repeat</span>
            <kbd className="px-2 py-1 bg-white/10 rounded font-mono text-xs text-cyan-400">R</kbd>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default HomePage;
