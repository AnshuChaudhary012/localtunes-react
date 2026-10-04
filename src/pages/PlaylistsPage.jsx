import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '../components/common/Icon.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { PlaylistDetailPage } from './PlaylistDetailPage.jsx';
import { getArtworkSrc } from '../utils/artworkGenerator.js';
import { usePlayer } from '../context/PlayerContext.jsx';

export function PlaylistsPage({
  playlists = [],
  allTracks = [],
  currentTrack = null,
  isPlaying = false,
  favoritesSet = new Set(),
  isLoading = false,
  onCreatePlaylist,
  onPlayTrack,
  onToggleFavorite,
  onPlayNext,
  onAddToQueue,
  onAddToPlaylist,
  onRemoveTrackFromPlaylist,
  onRenamePlaylist,
  onDeletePlaylist,
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playTrack } = usePlayer();

  const [localSelectedId, setLocalSelectedId] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newPlName, setNewPlName] = useState('');
  const [newPlDesc, setNewPlDesc] = useState('');

  const activePlaylistId = id || localSelectedId;
  const trackMap = new Map(allTracks.map((t) => [t.id, t]));

  // If a playlist is selected, render the detail page
  if (activePlaylistId) {
    const selectedPlaylist = playlists.find((p) => p.id === activePlaylistId);
    return (
      <PlaylistDetailPage
        playlist={selectedPlaylist}
        allTracks={allTracks}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        favoritesSet={favoritesSet}
        onBack={() => {
          setLocalSelectedId(null);
          navigate('/playlists');
        }}
        onPlayTrack={onPlayTrack}
        onToggleFavorite={onToggleFavorite}
        onPlayNext={onPlayNext}
        onAddToQueue={onAddToQueue}
        onAddToPlaylist={onAddToPlaylist}
        onRemoveTrackFromPlaylist={onRemoveTrackFromPlaylist}
        onRenamePlaylist={onRenamePlaylist}
        onDeletePlaylist={(delId) => {
          if (onDeletePlaylist) onDeletePlaylist(delId);
          setLocalSelectedId(null);
          navigate('/playlists');
        }}
      />
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Playlists</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Organize your music collection into custom playlists</p>
        </div>

        <button
          type="button"
          onClick={() => {
            setNewPlName('');
            setNewPlDesc('');
            setCreateModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-semibold text-xs flex items-center gap-2 shadow-glow-purple transition-all transform active:scale-95"
        >
          <Icon name="plus" className="w-4 h-4" />
          <span>New Playlist</span>
        </button>
      </div>

      {/* Playlists Grid */}
      {isLoading && playlists.length === 0 ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          <div className="w-10 h-10 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-medium text-slate-300">Loading playlists...</p>
        </div>
      ) : playlists.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-sm bg-dark-card/30 rounded-2xl border border-dark-border/40 p-8">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-3">
            <Icon name="playlists" className="w-7 h-7" />
          </div>
          <p className="font-semibold text-white mb-1 text-base">No playlists yet</p>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mb-6">
            Create a playlist to group your songs for parties, workouts, focus, or relaxation.
          </p>
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-purple-500 text-white font-semibold text-xs shadow-glow-purple"
          >
            Create Your First Playlist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {playlists.map((pl) => {
            const firstTrackId = pl.trackIds && pl.trackIds[0];
            const firstTrack = firstTrackId ? trackMap.get(firstTrackId) : null;
            const trackCount = pl.trackIds ? pl.trackIds.length : 0;
            const playlistSongs = (pl.trackIds || []).map((tId) => trackMap.get(tId)).filter(Boolean);

            return (
              <div
                key={pl.id}
                onClick={() => {
                  setLocalSelectedId(pl.id);
                  navigate(`/playlists/${pl.id}`);
                }}
                className="group p-3.5 rounded-2xl bg-dark-card/60 hover:bg-dark-card border border-dark-border/60 hover:border-dark-border transition-all cursor-pointer relative"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden mb-3 shadow-md bg-dark-surface flex items-center justify-center border border-white/5">
                  {firstTrack ? (
                    <img
                      src={getArtworkSrc(firstTrack)}
                      alt={pl.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="text-purple-400/80 group-hover:scale-110 transition-transform">
                      <Icon name="playlists" className="w-12 h-12" />
                    </div>
                  )}

                  {trackCount > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (playlistSongs.length > 0) {
                          if (onPlayTrack) {
                            onPlayTrack(playlistSongs[0], playlistSongs);
                          } else {
                            playTrack(playlistSongs[0], playlistSongs);
                          }
                        }
                      }}
                      className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-purple-500 hover:bg-purple-400 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-glow-purple transition-all transform hover:scale-110"
                      aria-label="Play playlist"
                    >
                      <Icon name="play" className="w-5 h-5 ml-0.5" />
                    </button>
                  )}
                </div>

                <div className="font-bold text-sm text-white truncate">{pl.name}</div>
                <div className="text-xs text-slate-400 truncate mt-0.5">
                  {trackCount} song{trackCount === 1 ? '' : 's'}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Playlist Modal */}
      <Modal
        isOpen={createModalOpen}
        title="Create New Playlist"
        confirmText="Create"
        onClose={() => setCreateModalOpen(false)}
        onConfirm={() => {
          if (!newPlName.trim()) return;
          if (onCreatePlaylist) onCreatePlaylist(newPlName, newPlDesc);
          setCreateModalOpen(false);
          setNewPlName('');
          setNewPlDesc('');
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Playlist Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={newPlName}
              onChange={(e) => setNewPlName(e.target.value)}
              placeholder="e.g. My Favorites, Late Night Chill"
              autoFocus
              className="w-full px-4 py-2.5 bg-dark-surface border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Description (Optional)
            </label>
            <textarea
              value={newPlDesc}
              onChange={(e) => setNewPlDesc(e.target.value)}
              placeholder="Give your playlist a vibe or notes..."
              rows={3}
              className="w-full px-4 py-2.5 bg-dark-surface border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default PlaylistsPage;
