import React, { useState, useEffect, useRef, memo } from 'react';
import { Icon } from './Icon.jsx';
import { formatDuration } from '../../utils/formatters.js';
import { getArtworkSrc } from '../../utils/artworkGenerator.js';
import { usePlayer } from '../../context/PlayerContext.jsx';
import { useLibrary } from '../../context/LibraryContext.jsx';

function TrackItemComponent({
  track,
  index = null,
  isCurrent: isCurrentProp,
  isPlaying: isPlayingProp,
  isFavorite: isFavoriteProp,
  showAlbum = true,
  playlistId = null,
  contextQueue = null,
  onPlay,
  onToggleFavorite,
  onPlayNext,
  onAddToQueue,
  onAddToPlaylist,
  onRemoveFromPlaylist,
  onDelete,
}) {
  const player = usePlayer();
  let library = null;
  try {
    library = useLibrary();
  } catch (e) {
    // Render safely even if outside LibraryProvider
  }

  const isFavorite =
    isFavoriteProp !== undefined
      ? isFavoriteProp
      : !!(library && library.favoritesSet && library.favoritesSet.has(track.id));

  const isCurrent =
    isCurrentProp !== undefined
      ? isCurrentProp
      : !!(player.currentTrack && player.currentTrack.id === track.id);
  const isPlaying =
    isPlayingProp !== undefined ? isPlayingProp : isCurrent && player.isPlaying;

  const handlePlay = () => {
    if (onPlay) {
      onPlay(track);
    } else {
      player.playTrack(track, contextQueue);
    }
  };

  const handlePlayNext = () => {
    if (onPlayNext) {
      onPlayNext(track);
    } else {
      player.playNext(track);
    }
  };

  const handleAddToQueue = () => {
    if (onAddToQueue) {
      onAddToQueue(track);
    } else {
      player.addToQueue(track);
    }
  };

  const handleToggleFavorite = () => {
    if (onToggleFavorite) {
      onToggleFavorite(track);
    } else if (library?.toggleFavorite) {
      library.toggleFavorite(track);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(track);
    } else if (library?.deleteTrack) {
      library.deleteTrack(track);
    }
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [menuOpen]);

  const artworkSrc = getArtworkSrc(track);

  return (
    <div
      onClick={(e) => {
        if (e.target.closest('button')) return;
        handlePlay();
      }}
      className={`track-item-row group flex items-center gap-3 p-2.5 rounded-xl transition-all duration-150 cursor-pointer relative ${
        isCurrent ? 'bg-cyan-500/10 border border-cyan-500/20' : 'hover:bg-white/5 border border-transparent'
      }`}
    >
      {/* Index / Playing Equalizer Bars / Hover Play */}
      <div className="w-8 flex items-center justify-center flex-shrink-0 text-xs font-medium text-slate-400">
        {isCurrent && isPlaying ? (
          <div className="flex items-end gap-0.5 h-4">
            <span className="w-1 bg-cyan-400 rounded-full bar-1" />
            <span className="w-1 bg-cyan-400 rounded-full bar-2" />
            <span className="w-1 bg-cyan-400 rounded-full bar-3" />
          </div>
        ) : (
          <>
            <span className="group-hover:hidden">{index !== null ? index + 1 : ''}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePlay();
              }}
              className="hidden group-hover:flex items-center justify-center text-cyan-400 focus:outline-none"
              aria-label="Play song"
            >
              <Icon name="play" className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Artwork Thumbnail */}
      <div className="track-thumb-box relative w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 bg-dark-surface shadow-sm">
        <img
          src={artworkSrc}
          alt={track.title || 'Track artwork'}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {isCurrent && isPlaying && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          </div>
        )}
      </div>

      {/* Title & Artist/Album */}
      <div className="flex-1 min-w-0 pr-2">
        <div
          className={`font-medium text-sm truncate ${
            isCurrent ? 'text-cyan-400 font-semibold' : 'text-slate-100 group-hover:text-white'
          }`}
        >
          {track.title || track.fileName || 'Untitled'}
        </div>
        <div className="text-xs text-slate-400 truncate mt-0.5 flex items-center gap-1.5">
          <span>{track.artist || 'Unknown Artist'}</span>
          {showAlbum && track.album && track.album !== 'Unknown Album' && (
            <>
              <span className="inline-block w-1 h-1 rounded-full bg-slate-600" />
              <span className="text-slate-400">{track.album}</span>
            </>
          )}
        </div>
      </div>

      {/* Duration */}
      <div className="hidden sm:block text-xs text-slate-400 font-mono flex-shrink-0">
        {formatDuration(track.duration)}
      </div>

      {/* Quick Favorite Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleToggleFavorite();
        }}
        className="fav-quick-btn p-1.5 text-slate-500 hover:text-rose-500 transition-colors rounded-lg flex-shrink-0 focus:outline-none"
        aria-label="Toggle favorite"
      >
        {isFavorite ? (
          <Icon name="heartFilled" className="w-4 h-4 text-rose-500" />
        ) : (
          <Icon name="heart" className="w-4 h-4" />
        )}
      </button>

      {/* Three-dot Menu Trigger */}
      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((prev) => !prev);
          }}
          className="track-menu-trigger p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors rounded-lg flex-shrink-0 focus:outline-none"
          aria-label="More options"
        >
          <Icon name="moreVertical" className="w-4 h-4" />
        </button>

        {/* Dropdown Popover */}
        {menuOpen && (
          <div
            ref={menuRef}
            className="absolute right-0 top-full mt-1 z-50 w-52 py-1.5 rounded-xl glass-dropdown shadow-glass text-sm text-slate-200 animate-fadeIn"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                handlePlay();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2 text-left hover:bg-white/10 transition-colors"
            >
              <Icon name="play" className="w-4 h-4 text-cyan-400" />
              <span>Play Now</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                handlePlayNext();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2 text-left hover:bg-white/10 transition-colors"
            >
              <Icon name="skipForward" className="w-4 h-4 text-cyan-400" />
              <span>Play Next</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                handleAddToQueue();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2 text-left hover:bg-white/10 transition-colors"
            >
              <Icon name="queue" className="w-4 h-4 text-cyan-400" />
              <span>Add to Queue</span>
            </button>

            <div className="h-px bg-white/10 my-1" />

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                handleToggleFavorite();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2 text-left hover:bg-white/10 transition-colors"
            >
              {isFavorite ? (
                <Icon name="heartFilled" className="w-4 h-4 text-rose-500" />
              ) : (
                <Icon name="heart" className="w-4 h-4" />
              )}
              <span>{isFavorite ? 'Remove Favorite' : 'Add to Favorites'}</span>
            </button>

            {onAddToPlaylist && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onAddToPlaylist(track);
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2 text-left hover:bg-white/10 transition-colors"
              >
                <Icon name="playlists" className="w-4 h-4 text-purple-400" />
                <span>Add to Playlist...</span>
              </button>
            )}

            {playlistId && onRemoveFromPlaylist && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onRemoveFromPlaylist(track, playlistId);
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2 text-left hover:bg-rose-500/20 text-rose-400 transition-colors"
              >
                <Icon name="trash" className="w-4 h-4" />
                <span>Remove from Playlist</span>
              </button>
            )}

            {(onDelete || (library && library.deleteTrack)) && (
              <>
                <div className="h-px bg-white/10 my-1" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    handleDelete();
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2 text-left hover:bg-rose-500/20 text-rose-400 transition-colors"
                >
                  <Icon name="trash" className="w-4 h-4" />
                  <span>Delete from Library</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export const TrackItem = memo(TrackItemComponent);
export default TrackItem;
