import React from 'react';
import { Icon } from '../common/Icon.jsx';
import { formatDuration } from '../../utils/formatters.js';
import { getArtworkSrc } from '../../utils/artworkGenerator.js';
import { usePlayer } from '../../context/PlayerContext.jsx';
import { player as playerService } from '../../services/player.js';

export function QueueDrawer(props) {
  const player = usePlayer();

  const isOpen = props.isOpen || false;
  const queue = props.queue !== undefined ? props.queue : player.queue;
  const currentIndex = props.currentIndex !== undefined ? props.currentIndex : player.currentTrackIndex;
  const currentTrack = props.currentTrack !== undefined ? props.currentTrack : player.currentTrack;
  const currentTime = props.currentTime !== undefined ? props.currentTime : player.currentTime;
  const duration = props.duration !== undefined ? props.duration : player.duration;

  const onClose = props.onClose;
  const onClear = props.onClear || player.clearQueue;
  const onShuffleRest = props.onShuffleRest || player.shuffleRestQueue;
  const onSelectTrack = props.onSelectTrack || ((idx) => playerService.loadTrackAtIndex(idx, true));
  const onRemoveTrack = props.onRemoveTrack || player.removeFromQueue;

  const upcoming = queue.slice(currentIndex + 1);

  return (
    <div
      id="queue-drawer"
      className={`fixed inset-0 z-50 transition-opacity duration-200 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="queue-backdrop absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
      />

      {/* Slide-in Drawer */}
      <div
        className={`queue-panel absolute right-0 top-0 bottom-0 w-full max-w-md bg-dark-surface border-l border-dark-border shadow-2xl flex flex-col transform transition-transform duration-300 ease-out pt-safe pb-safe pointer-events-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-dark-border flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide">Play Queue</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {queue.length} track{queue.length === 1 ? '' : 's'} in queue
            </p>
          </div>
          <div className="flex items-center gap-2">
            {queue.length > 0 && onClear && (
              <button
                type="button"
                onClick={onClear}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors font-medium"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors focus:outline-none"
              aria-label="Close queue"
            >
              <Icon name="x" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Currently Playing Card */}
          {currentTrack && (
            <div>
              <div className="text-xs uppercase tracking-wider font-semibold text-cyan-400 mb-2 flex items-center gap-1.5">
                <span>Now Playing</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              </div>
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                <img
                  src={getArtworkSrc(currentTrack)}
                  alt={currentTrack.title || 'Current track'}
                  className="w-12 h-12 rounded-xl object-cover shadow-md flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-sm truncate">
                    {currentTrack.title || currentTrack.fileName}
                  </div>
                  <div className="text-xs text-slate-400 truncate mt-0.5">
                    {currentTrack.artist || 'Unknown Artist'}
                  </div>
                </div>
                <div className="text-xs font-mono text-cyan-400 flex-shrink-0">
                  {formatDuration(currentTime)} / {formatDuration(duration)}
                </div>
              </div>
            </div>
          )}

          {/* Up Next List */}
          <div>
            <div className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2 flex items-center justify-between">
              <span>Up Next ({upcoming.length})</span>
              {upcoming.length > 1 && onShuffleRest && (
                <button
                  type="button"
                  onClick={onShuffleRest}
                  className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300"
                >
                  <Icon name="shuffle" className="w-3.5 h-3.5" />
                  <span>Shuffle Rest</span>
                </button>
              )}
            </div>

            {upcoming.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No upcoming songs in the queue.
              </div>
            ) : (
              <div className="space-y-1.5">
                {upcoming.map((t, idx) => {
                  const actualQueueIndex = currentIndex + 1 + idx;
                  return (
                    <div
                      key={`${t.id || 'track'}-${actualQueueIndex}`}
                      onClick={() => onSelectTrack && onSelectTrack(actualQueueIndex)}
                      className="group flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <span className="text-xs text-slate-500 font-mono w-5 text-center">
                        {idx + 1}
                      </span>
                      <img
                        src={getArtworkSrc(t)}
                        alt={t.title || 'Track'}
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-200 group-hover:text-white text-xs truncate">
                          {t.title || t.fileName}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {t.artist || 'Unknown Artist'}
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 group-hover:text-slate-400">
                        {formatDuration(t.duration)}
                      </span>
                      {onRemoveTrack && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveTrack(actualQueueIndex);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 transition-opacity focus:outline-none"
                          aria-label="Remove from queue"
                        >
                          <Icon name="trash" className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QueueDrawer;
