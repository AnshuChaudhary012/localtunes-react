import React, { useState, useEffect } from 'react';
import { Icon } from '../common/Icon.jsx';
import { Visualizer } from './Visualizer.jsx';
import { formatDuration } from '../../utils/formatters.js';
import { getArtworkSrc, getTrackTheme } from '../../utils/artworkGenerator.js';
import { usePlayer } from '../../context/PlayerContext.jsx';

export function FullPlayer(props) {
  const player = usePlayer();

  const isOpen = props.isOpen || false;
  const track = props.track !== undefined ? props.track : player.currentTrack;
  const isPlaying = props.isPlaying !== undefined ? props.isPlaying : player.isPlaying;
  const currentTime = props.currentTime !== undefined ? props.currentTime : player.currentTime;
  const duration = props.duration !== undefined ? props.duration : player.duration;
  const volume = props.volume !== undefined ? props.volume : player.volume;
  const isMuted = props.isMuted !== undefined ? props.isMuted : player.isMuted;
  const shuffle = props.shuffle !== undefined ? props.shuffle : player.shuffle;
  const repeat = props.repeat !== undefined ? props.repeat : player.repeatMode;
  const isFavorite = props.isFavorite !== undefined ? props.isFavorite : false;
  const showRemainingTime = props.showRemainingTime !== undefined ? props.showRemainingTime : false;
  const enableVisualizer = props.enableVisualizer !== undefined ? props.enableVisualizer : true;

  const onClose = props.onClose;
  const onOpenQueue = props.onOpenQueue;
  const onTogglePlay = props.onTogglePlay || player.togglePlay;
  const onPrevious = props.onPrevious || player.previous;
  const onNext = props.onNext || player.next;
  const onSeek = props.onSeek || player.seek;
  const onVolumeChange = props.onVolumeChange || player.setVolume;
  const onToggleMute = props.onToggleMute || player.toggleMute;
  const onToggleShuffle = props.onToggleShuffle || player.toggleShuffle;
  const onToggleRepeat = props.onToggleRepeat || player.changeRepeatMode;
  const onToggleFavorite = props.onToggleFavorite;
  const onToggleRemainingTime = props.onToggleRemainingTime;

  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubValue, setScrubValue] = useState(0);

  useEffect(() => {
    if (!isScrubbing) {
      setScrubValue(currentTime);
    }
  }, [currentTime, isScrubbing]);

  if (!track) return null;

  const theme = getTrackTheme(track);
  const artworkSrc = getArtworkSrc(track);

  const totalSec = isFinite(duration) && duration > 0 ? duration : 100;
  const activeSec = isScrubbing ? scrubValue : currentTime;
  const seekPercent = totalSec > 0 ? Math.min(100, Math.max(0, (activeSec / totalSec) * 100)) : 0;
  const currentVol = isMuted ? 0 : volume;
  const volumePercent = Math.min(100, Math.max(0, currentVol * 100));

  const remainingTimeSec = Math.max(0, (duration || 0) - activeSec);
  const durationText = showRemainingTime && isFinite(duration) && duration > 0
    ? `-${formatDuration(remainingTimeSec)}`
    : formatDuration(duration);

  // Swipe down to dismiss on mobile
  const handleTouchStart = (e) => {
    e.currentTarget.touchStartY = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const startY = e.currentTarget.touchStartY || 0;
    const endY = e.changedTouches[0].clientY;
    if (endY - startY > 100 && onClose) {
      onClose();
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      id="full-player-overlay"
      className={`fixed inset-0 z-40 bg-dark-bg flex flex-col justify-between overflow-hidden transform transition-transform duration-300 ease-out pb-safe pt-safe ${
        isOpen ? 'translate-y-0' : 'translate-y-full pointer-events-none'
      }`}
    >
      {/* Ambient Dynamic Glowing Backdrop */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
        <div className="ambient-glow -top-32 -left-32 w-96 h-96" style={{ background: theme.from }} />
        <div className="ambient-glow -bottom-32 -right-32 w-96 h-96" style={{ background: theme.to }} />
        <div className="absolute inset-0 bg-dark-bg/80 backdrop-blur-3xl" />
      </div>

      {/* Top Header Navigation */}
      <header className="relative z-10 flex items-center justify-between px-6 pt-4 pb-2">
        <button
          type="button"
          onClick={onClose}
          className="p-2 -ml-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors focus:outline-none"
          aria-label="Collapse player"
        >
          <Icon name="chevronDown" className="w-7 h-7" />
        </button>

        <div className="text-center">
          <div className="text-xs uppercase tracking-widest font-semibold text-slate-400">Playing from Library</div>
          <div className="text-xs text-cyan-400 font-medium truncate max-w-[200px] sm:max-w-xs mt-0.5">
            {track.album || 'LocalTunes'}
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenQueue}
          className="p-2 -mr-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors focus:outline-none"
          aria-label="Open queue"
        >
          <Icon name="queue" className="w-6 h-6" />
        </button>
      </header>

      {/* Center: Large Artwork & Visualizer */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 py-2 min-h-0">
        <div className="relative w-full max-w-[340px] sm:max-w-[380px] aspect-square rounded-3xl overflow-hidden shadow-2xl border border-white/10 group transition-all duration-300">
          <img
            src={artworkSrc}
            alt={track.title || 'Track artwork'}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
          />

          {/* Vinyl center gradient reflection */}
          <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10 pointer-events-none" />

          {isPlaying && (
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-[11px] font-medium text-cyan-300">PLAYING</span>
            </div>
          )}
        </div>

        {/* Live Audio Spectrum Visualizer */}
        <div className="w-full max-w-[340px] sm:max-w-[380px] h-10 mt-4 flex items-center justify-center">
          <Visualizer isPlaying={isPlaying} enabled={enableVisualizer && isOpen} />
        </div>
      </main>

      {/* Bottom Controls Area */}
      <footer className="relative z-10 w-full max-w-lg mx-auto px-6 sm:px-8 pb-2 pt-2 flex flex-col gap-4">
        {/* Title, Artist & Favorite */}
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-white truncate tracking-tight">
              {track.title || track.fileName || 'Untitled'}
            </h2>
            <p className="text-sm sm:text-base text-slate-400 truncate mt-0.5">
              {track.artist || 'Unknown Artist'}
            </p>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onToggleFavorite) onToggleFavorite(track);
            }}
            className="p-2 text-slate-400 hover:text-rose-500 rounded-full hover:bg-white/5 transition-all focus:outline-none flex-shrink-0"
            aria-label="Favorite"
          >
            {isFavorite ? (
              <Icon name="heartFilled" className="w-7 h-7 text-rose-500" />
            ) : (
              <Icon name="heart" className="w-7 h-7" />
            )}
          </button>
        </div>

        {/* Interactive Progress Bar */}
        <div className="flex flex-col gap-1.5">
          <div className="relative w-full py-1">
            <input
              type="range"
              min={0}
              max={totalSec}
              step={0.1}
              value={activeSec}
              style={{ '--progress': `${seekPercent}%` }}
              onInput={(e) => {
                setIsScrubbing(true);
                setScrubValue(parseFloat(e.target.value));
              }}
              onChange={(e) => {
                const targetSec = parseFloat(e.target.value);
                if (onSeek) onSeek(targetSec);
                setIsScrubbing(false);
              }}
              className="w-full slider-progress cursor-pointer"
              aria-label="Seek track"
            />
          </div>
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>{formatDuration(activeSec)}</span>
            <button
              type="button"
              onClick={onToggleRemainingTime}
              className="hover:text-cyan-400 transition-colors focus:outline-none"
              title="Toggle elapsed / remaining time"
            >
              {durationText}
            </button>
          </div>
        </div>

        {/* Main Playback Controls: Shuffle, Prev, Play/Pause, Next, Repeat */}
        <div className="flex items-center justify-between pt-1">
          {/* Shuffle Button */}
          <button
            type="button"
            onClick={onToggleShuffle}
            className={`p-3 rounded-full transition-all focus:outline-none ${
              shuffle ? 'text-cyan-400 bg-cyan-400/10 shadow-glow' : 'text-slate-400 hover:text-white'
            }`}
            aria-label="Shuffle"
          >
            <Icon name="shuffle" className="w-6 h-6" />
          </button>

          {/* Previous Button */}
          <button
            type="button"
            onClick={onPrevious}
            className="p-3 text-slate-200 hover:text-white hover:scale-110 active:scale-95 transition-all focus:outline-none"
            aria-label="Previous track"
          >
            <Icon name="skipBack" className="w-8 h-8" />
          </button>

          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={onTogglePlay}
            className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-white text-slate-950 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-glow focus:outline-none"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Icon name="pause" className="w-8 h-8" />
            ) : (
              <Icon name="play" className="w-8 h-8 ml-1" />
            )}
          </button>

          {/* Next Button */}
          <button
            type="button"
            onClick={onNext}
            className="p-3 text-slate-200 hover:text-white hover:scale-110 active:scale-95 transition-all focus:outline-none"
            aria-label="Next track"
          >
            <Icon name="skipForward" className="w-8 h-8" />
          </button>

          {/* Repeat Button */}
          <button
            type="button"
            onClick={onToggleRepeat}
            className={`p-3 rounded-full transition-all focus:outline-none ${
              repeat !== 'off' ? 'text-cyan-400 bg-cyan-400/10 shadow-glow' : 'text-slate-400 hover:text-white'
            }`}
            aria-label="Repeat mode"
          >
            {repeat === 'one' ? (
              <Icon name="repeatOne" className="w-6 h-6" />
            ) : (
              <Icon name="repeat" className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Volume & Bottom Actions */}
        <div className="flex items-center justify-between gap-4 pt-2">
          {/* Volume Slider */}
          <div className="flex items-center gap-2 flex-1 max-w-[220px]">
            <button
              type="button"
              onClick={onToggleMute}
              className="text-slate-400 hover:text-white transition-colors focus:outline-none"
              aria-label="Mute or unmute"
            >
              {isMuted || volume === 0 ? (
                <Icon name="volumeMute" className="w-5 h-5" />
              ) : (
                <Icon name="volume" className="w-5 h-5" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={currentVol}
              style={{ '--progress': `${volumePercent}%` }}
              onInput={(e) => {
                if (onVolumeChange) onVolumeChange(parseFloat(e.target.value));
              }}
              className="w-full slider-progress cursor-pointer"
              aria-label="Volume slider"
            />
          </div>

          {/* Queue Drawer Toggle */}
          <button
            type="button"
            onClick={onOpenQueue}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 hover:text-white transition-colors border border-white/5"
            aria-label="Up next queue"
          >
            <Icon name="queue" className="w-4 h-4 text-cyan-400" />
            <span>Up Next</span>
          </button>
        </div>
      </footer>
    </div>
  );
}

export default FullPlayer;
