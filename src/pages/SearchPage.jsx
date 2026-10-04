import React, { useState, useMemo } from 'react';
import { Icon } from '../components/common/Icon.jsx';
import { TrackItem } from '../components/common/TrackItem.jsx';
import { usePlayer } from '../context/PlayerContext.jsx';

export function SearchPage({
  allTracks = [],
  favoritesSet = new Set(),
  onPlayTrack,
  onToggleFavorite,
  onAddToPlaylist,
  onDeleteTrack,
}) {
  const { playTrack } = usePlayer();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'songs' | 'artists' | 'albums'

  const filteredTracks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const matchingSongs = allTracks.filter((t) => (t.title || '').toLowerCase().includes(q));
    const matchingArtists = allTracks.filter((t) => (t.artist || '').toLowerCase().includes(q));
    const matchingAlbums = allTracks.filter((t) => (t.album || '').toLowerCase().includes(q));

    if (activeFilter === 'songs') return matchingSongs;
    if (activeFilter === 'artists') return matchingArtists;
    if (activeFilter === 'albums') return matchingAlbums;

    // All matches (deduplicated)
    const map = new Map();
    [...matchingSongs, ...matchingArtists, ...matchingAlbums].forEach((t) => map.set(t.id, t));
    return Array.from(map.values());
  }, [allTracks, query, activeFilter]);

  const handleTrackPlay = (track) => {
    if (onPlayTrack) {
      onPlayTrack(track, filteredTracks);
    } else {
      playTrack(track, filteredTracks);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Search Header & Input */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-4">Search</h2>

        <div className="relative max-w-xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Icon name="search" className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search songs, artists, or albums..."
            autoFocus
            className="w-full pl-12 pr-10 py-3 sm:py-3.5 bg-dark-card border border-dark-border rounded-2xl text-white placeholder-slate-500 text-base focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-glass transition-all"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white"
              aria-label="Clear search"
            >
              <Icon name="x" className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
          {['all', 'songs', 'artists', 'albums'].map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                activeFilter === filter
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-dark-card text-slate-400 hover:text-white border border-dark-border'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Results Container */}
      {!query.trim() ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3 text-slate-500">
            <Icon name="search" className="w-6 h-6" />
          </div>
          <p className="font-medium text-white mb-1">Search Your Music</p>
          <p className="text-xs text-slate-500">Type a song title, artist, or album name to find matches instantly.</p>
        </div>
      ) : filteredTracks.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-sm">
          <p className="font-medium text-white mb-1">No results for "{query}"</p>
          <p className="text-xs text-slate-500">Check for typos or try searching with another keyword.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-xs text-slate-400 font-medium">
            Found {filteredTracks.length} match{filteredTracks.length === 1 ? '' : 'es'}
          </div>
          <div className="space-y-1">
            {filteredTracks.map((track, idx) => (
              <TrackItem
                key={track.id}
                track={track}
                index={idx}
                isFavorite={favoritesSet.has(track.id)}
                contextQueue={filteredTracks}
                onPlay={() => handleTrackPlay(track)}
                onToggleFavorite={onToggleFavorite}
                onAddToPlaylist={onAddToPlaylist}
                onDelete={onDeleteTrack}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchPage;
