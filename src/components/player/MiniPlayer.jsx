import React from 'react';
import { Icon } from '../common/Icon.jsx';
import { getArtworkSrc } from '../../utils/artworkGenerator.js';
import { usePlayer } from '../../context/PlayerContext.jsx';

export function MiniPlayer(props) {
  const player = usePlayer();

  const track = props.track !== undefined ? props.track : player.currentTrack;
  const isPlaying = props.isPlaying !== undefined ? props.isPlaying : player.isPlaying;
  const progress =
    props.progress !== undefined
      ? props.progress
      : player.duration > 0
      ? (player.currentTime / player.duration) * 100
      : 0;
  const isFavorite = props.isFavorite !== undefined ? props.isFavorite : false;
  const showProgressBar = props.showProgressBar !== undefined ? props.showProgressBar : true;

  const onOpenFullPlayer = props.onOpenFullPlayer;
  const onTogglePlay = props.onTogglePlay || player.togglePlay;
  const onNext = props.onNext || player.next;
  const onToggleFavorite = props.onToggleFavorite;
  const onSeekPercent = props.onSeekPercent || player.seekPercent;

  if (!track) return null;

  const artworkSrc = getArtworkSrc(track);

  const handleProgressClick = (e) => {
    e.stopPropagation();
    if (!onSeekPercent) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
    onSeekPercent(pct);
  };

  return (
    <div
      id="mini-player"
      className="w-full bg-dark-card/90 backdrop-blur-xl border-t border-dark-border/80 shadow-glass transition-transform duration-300 transform translate-y-0"
    >
      {/* Slim Top Progress Indicator Line */}
      {showProgressBar && (
        <div
          onClick={handleProgressClick}
          className="w-full h-1 bg-white/10 relative overflow-hidden cursor-pointer"
          title="Click to seek"
        >
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-100"
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        </div>
      )}

      <div className="px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Track Info (Click opens Full Player) */}
        <div
          onClick={onOpenFullPlayer}
          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
        >
          <div className="relative w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 shadow-md bg-dark-surface">
            <img
              src={artworkSrc}
              alt={track.title || 'Now playing'}
              className="w-full h-full object-cover"
            />
            {isPlaying && (
              <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-cyan-400 shadow-glow animate-pulse" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-sm text-white truncate">
              {track.title || track.fileName || 'Untitled'}
            </div>
            <div className="text-xs text-slate-400 truncate mt-0.5">
              {track.artist || 'Unknown Artist'}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Favorite Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onToggleFavorite) onToggleFavorite(track);
            }}
            className="p-2 text-slate-400 hover:text-rose-500 transition-colors rounded-xl focus:outline-none"
            aria-label="Favorite"
          >
            {isFavorite ? (
              <Icon name="heartFilled" className="w-5 h-5 text-rose-500" />
            ) : (
              <Icon name="heart" className="w-5 h-5" />
            )}
          </button>

          {/* Play / Pause */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onTogglePlay) onTogglePlay();
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-slate-950 hover:scale-105 active:scale-95 transition-all shadow-glow focus:outline-none"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Icon name="pause" className="w-5 h-5" />
            ) : (
              <Icon name="play" className="w-5 h-5 ml-0.5" />
            )}
          </button>

          {/* Next */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onNext) onNext();
            }}
            className="p-2 text-slate-300 hover:text-white transition-colors rounded-xl focus:outline-none"
            aria-label="Next track"
          >
            <Icon name="skipForward" className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default MiniPlayer;
