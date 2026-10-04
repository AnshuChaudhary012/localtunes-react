import React, { useState, useMemo } from 'react';
import { Icon } from '../components/common/Icon.jsx';
import { TrackItem } from '../components/common/TrackItem.jsx';
import { formatDuration } from '../utils/formatters.js';
import { getArtworkSrc } from '../utils/artworkGenerator.js';
import { usePlayer } from '../context/PlayerContext.jsx';

export function LibraryPage({
  allTracks = [],
  favoritesSet = new Set(),
  isLoading = false,
  onAddMusic,
  onToggleFavorite,
  onAddToPlaylist,
  onDeleteTrack,
}) {
  const { currentTrack, isPlaying, playTrack, setQueue } = usePlayer();
  const [activeTab, setActiveTab] = useState('songs'); // 'songs' | 'albums' | 'artists'
  const [sortBy, setSortBy] = useState('dateAdded');
  const [subView, setSubView] = useState(null); // null | { type: 'album' | 'artist', name: string }

  // Group into albums and artists
  const { albumsList, artistsList } = useMemo(() => {
    const albumsMap = new Map();
    const artistsMap = new Map();

    allTracks.forEach((track) => {
      const albumName = track.album || 'Unknown Album';
      const artistName = track.artist || 'Unknown Artist';

      if (!albumsMap.has(albumName)) {
        albumsMap.set(albumName, { name: albumName, artist: artistName, tracks: [], firstTrack: track });
      }
      albumsMap.get(albumName).tracks.push(track);

      if (!artistsMap.has(artistName)) {
        artistsMap.set(artistName, { name: artistName, tracks: [], firstTrack: track });
      }
      artistsMap.get(artistName).tracks.push(track);
    });

    return {
      albumsList: Array.from(albumsMap.values()),
      artistsList: Array.from(artistsMap.values()),
    };
  }, [allTracks]);

  // Sort tracks
  const sortedTracks = useMemo(() => {
    return [...allTracks].sort((a, b) => {
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'artist') return (a.artist || '').localeCompare(b.artist || '');
      if (sortBy === 'duration') return (b.duration || 0) - (a.duration || 0);
      return (b.dateAdded || 0) - (a.dateAdded || 0);
    });
  }, [allTracks, sortBy]);

  // Handle SubView (Album or Artist detail)
  if (subView) {
    const isAlbum = subView.type === 'album';
    const matchingTracks = allTracks.filter((t) =>
      isAlbum ? (t.album || 'Unknown Album') === subView.name : (t.artist || 'Unknown Artist') === subView.name
    );
    const firstTrack = matchingTracks[0] || {};
    const totalSecs = matchingTracks.reduce((sum, t) => sum + (t.duration || 0), 0);

    return (
      <div className="space-y-6 pb-12 animate-fadeIn">
        <div>
          <button
            type="button"
            onClick={() => setSubView(null)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-4"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Library</span>
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 p-6 rounded-3xl bg-gradient-to-r from-dark-card to-dark-surface border border-dark-border">
            <div
              className={`w-36 h-36 sm:w-44 sm:h-44 ${
                isAlbum ? 'rounded-2xl' : 'rounded-full'
              } overflow-hidden shadow-2xl flex-shrink-0 border border-white/10`}
            >
              <img
                src={getArtworkSrc(firstTrack)}
                alt={subView.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="text-center sm:text-left flex-1 min-w-0">
              <div className="text-xs uppercase tracking-widest font-semibold text-cyan-400">
                {isAlbum ? 'Album' : 'Artist'}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 truncate">
                {subView.name}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                {matchingTracks.length} song{matchingTracks.length === 1 ? '' : 's'} &bull; {formatDuration(totalSecs)}
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setQueue(matchingTracks, 0, false)}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-glow active:scale-95 transition-all"
                >
                  <Icon name="play" className="w-4 h-4" />
                  <span>Play All</span>
                </button>
                <button
                  type="button"
                  onClick={() => setQueue(matchingTracks, 0, true)}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs flex items-center gap-2 active:scale-95 transition-all"
                >
                  <Icon name="shuffle" className="w-4 h-4 text-cyan-400" />
                  <span>Shuffle</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          {matchingTracks.map((track, idx) => (
            <TrackItem
              key={track.id}
              track={track}
              index={idx}
              showAlbum={!isAlbum}
              isFavorite={favoritesSet.has(track.id)}
              contextQueue={matchingTracks}
              onPlay={() => playTrack(track, matchingTracks)}
              onToggleFavorite={onToggleFavorite}
              onAddToPlaylist={onAddToPlaylist}
              onDelete={onDeleteTrack}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Your Library</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {allTracks.length} song{allTracks.length === 1 ? '' : 's'} in your offline library
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {allTracks.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => setQueue(sortedTracks, 0, false)}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-glow active:scale-95 transition-all"
              >
                <Icon name="play" className="w-4 h-4" />
                <span>Play All</span>
              </button>
              <button
                type="button"
                onClick={() => setQueue(sortedTracks, 0, true)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-2 active:scale-95 transition-all"
              >
                <Icon name="shuffle" className="w-4 h-4 text-cyan-400" />
                <span>Shuffle</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onAddMusic}
            className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-2 transition-all active:scale-95"
          >
            <Icon name="upload" className="w-4 h-4" />
            <span>Add Music</span>
          </button>
        </div>
      </div>

      {/* Segmented Tab Navigation & Sort Controls */}
      <div className="flex items-center justify-between border-b border-dark-border pb-3 flex-wrap gap-3">
        <div className="flex items-center gap-2 p-1 rounded-xl bg-dark-card/80 border border-dark-border">
          <button
            type="button"
            onClick={() => setActiveTab('songs')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'songs' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Songs ({allTracks.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('albums')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'albums' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Albums ({albumsList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('artists')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'artists' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Artists ({artistsList.length})
          </button>
        </div>

        {activeTab === 'songs' && allTracks.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-dark-card border border-dark-border text-xs rounded-xl px-3 py-1.5 text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="dateAdded">Date Added</option>
              <option value="title">Title</option>
              <option value="artist">Artist</option>
              <option value="duration">Duration</option>
            </select>
          </div>
        )}
      </div>

      {/* Content for Tabs */}
      {isLoading && allTracks.length === 0 ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-medium text-slate-300">Loading your music library...</p>
        </div>
      ) : allTracks.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-sm bg-dark-card/30 rounded-2xl border border-dark-border/40 p-8">
          <p className="font-semibold text-white mb-1">Your library is empty</p>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mb-5">
            Add audio files from your device to begin building your local collection.
          </p>
          <button
            type="button"
            onClick={onAddMusic}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold shadow-glow"
          >
            Add Music
          </button>
        </div>
      ) : activeTab === 'songs' ? (
        <div className="space-y-1">
          {sortedTracks.map((track, idx) => (
            <TrackItem
              key={track.id}
              track={track}
              index={idx}
              isFavorite={favoritesSet.has(track.id)}
              contextQueue={sortedTracks}
              onPlay={() => playTrack(track, sortedTracks)}
              onToggleFavorite={onToggleFavorite}
              onAddToPlaylist={onAddToPlaylist}
              onDelete={onDeleteTrack}
            />
          ))}
        </div>
      ) : activeTab === 'albums' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {albumsList.map((album) => (
            <div
              key={album.name}
              onClick={() => setSubView({ type: 'album', name: album.name })}
              className="group p-3 rounded-2xl bg-dark-card/60 hover:bg-dark-card border border-dark-border/60 hover:border-dark-border transition-all cursor-pointer"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden mb-3 shadow-md">
                <img
                  src={getArtworkSrc(album.firstTrack)}
                  alt={album.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      playTrack(album.tracks[0], album.tracks);
                    }}
                    className="w-10 h-10 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-glow"
                  >
                    <Icon name="play" className="w-5 h-5 ml-0.5" />
                  </div>
                </div>
              </div>
              <div className="font-semibold text-sm text-white truncate">{album.name}</div>
              <div className="text-xs text-slate-400 truncate mt-0.5">{album.artist}</div>
              <div className="text-[11px] text-slate-500 mt-1">
                {album.tracks.length} track{album.tracks.length === 1 ? '' : 's'}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {artistsList.map((artist) => (
            <div
              key={artist.name}
              onClick={() => setSubView({ type: 'artist', name: artist.name })}
              className="group p-4 rounded-2xl bg-dark-card/60 hover:bg-dark-card border border-dark-border/60 hover:border-dark-border transition-all cursor-pointer text-center"
            >
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full overflow-hidden mb-3 shadow-lg border-2 border-white/5 group-hover:border-cyan-500/40 transition-colors">
                <img
                  src={getArtworkSrc(artist.firstTrack)}
                  alt={artist.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      playTrack(artist.tracks[0], artist.tracks);
                    }}
                    className="w-9 h-9 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-glow"
                  >
                    <Icon name="play" className="w-4 h-4 ml-0.5" />
                  </div>
                </div>
              </div>
              <div className="font-semibold text-sm text-white truncate">{artist.name}</div>
              <div className="text-xs text-slate-400 mt-1">
                {artist.tracks.length} song{artist.tracks.length === 1 ? '' : 's'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LibraryPage;
