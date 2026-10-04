import React, { useState } from 'react';
import { Icon } from '../components/common/Icon.jsx';
import { TrackItem } from '../components/common/TrackItem.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { formatDuration } from '../utils/formatters.js';
import { getArtworkSrc } from '../utils/artworkGenerator.js';
import { usePlayer } from '../context/PlayerContext.jsx';

export function PlaylistDetailPage({
  playlist,
  allTracks = [],
  favoritesSet = new Set(),
  onBack,
  onToggleFavorite,
  onAddToPlaylist,
  onRemoveTrackFromPlaylist,
  onRenamePlaylist,
  onDeletePlaylist,
}) {
  const { playTrack, setQueue } = usePlayer();

  const [addSongsModalOpen, setAddSongsModalOpen] = useState(false);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [newName, setNewName] = useState(playlist?.name || '');

  if (!playlist) return null;

  const trackMap = new Map(allTracks.map((t) => [t.id, t]));
  const playlistTracks = (playlist.trackIds || [])
    .map((id) => trackMap.get(id))
    .filter(Boolean);

  const totalSecs = playlistTracks.reduce((sum, t) => sum + (t.duration || 0), 0);
  const firstTrack = playlistTracks[0];

  const existingTrackIds = new Set(playlist.trackIds || []);
  const availableTracks = allTracks.filter((t) => !existingTrackIds.has(t.id));

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Back Button */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Back to Playlists</span>
      </button>

      {/* Playlist Hero Banner */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-dark-card to-dark-surface border border-purple-500/20">
        <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 bg-dark-surface border border-white/10 flex items-center justify-center">
          {firstTrack ? (
            <img
              src={getArtworkSrc(firstTrack)}
              alt={playlist.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-purple-400">
              <Icon name="playlists" className="w-16 h-16" />
            </div>
          )}
        </div>

        <div className="text-center sm:text-left flex-1 min-w-0">
          <div className="text-xs uppercase tracking-widest font-semibold text-purple-400">
            Custom Playlist
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 truncate">
            {playlist.name}
          </h2>
          {playlist.description && (
            <p className="text-xs text-slate-300 mt-1 max-w-lg">{playlist.description}</p>
          )}
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {playlistTracks.length} song{playlistTracks.length === 1 ? '' : 's'} &bull; {formatDuration(totalSecs)}
          </p>

          <div className="flex items-center justify-center sm:justify-start gap-2.5 mt-4 flex-wrap">
            {playlistTracks.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => setQueue(playlistTracks, 0, false)}
                  className="px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/25 transition-all active:scale-95"
                >
                  <Icon name="play" className="w-4 h-4" />
                  <span>Play</span>
                </button>
                <button
                  type="button"
                  onClick={() => setQueue(playlistTracks, 0, true)}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs flex items-center gap-2 transition-all active:scale-95"
                >
                  <Icon name="shuffle" className="w-4 h-4 text-purple-400" />
                  <span>Shuffle</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setAddSongsModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-medium text-xs flex items-center gap-1.5 transition-colors border border-white/5 active:scale-95"
            >
              <Icon name="plus" className="w-4 h-4 text-cyan-400" />
              <span>Add Songs</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setNewName(playlist.name);
                setRenameModalOpen(true);
              }}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Rename Playlist"
            >
              <Icon name="edit" className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setDeleteModalOpen(true)}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-rose-500/15 text-slate-400 hover:text-rose-400 transition-colors"
              title="Delete Playlist"
            >
              <Icon name="trash" className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Playlist Songs */}
      {playlistTracks.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-sm bg-dark-card/30 rounded-2xl border border-dark-border/40 p-8">
          <p className="font-semibold text-white mb-1">This playlist is empty</p>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mb-5">
            Add songs from your library to start listening to this playlist.
          </p>
          <button
            type="button"
            onClick={() => setAddSongsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-purple-500 text-white font-medium text-xs shadow-glow-purple"
          >
            Add Songs Now
          </button>
        </div>
      ) : (
        <div className="space-y-1">
          {playlistTracks.map((track, idx) => (
            <TrackItem
              key={`${track.id}-${idx}`}
              track={track}
              index={idx}
              playlistId={playlist.id}
              isFavorite={favoritesSet.has(track.id)}
              contextQueue={playlistTracks}
              onPlay={() => playTrack(track, playlistTracks)}
              onToggleFavorite={onToggleFavorite}
              onAddToPlaylist={onAddToPlaylist}
              onRemoveFromPlaylist={onRemoveTrackFromPlaylist}
            />
          ))}
        </div>
      )}

      {/* Add Songs Modal */}
      <Modal
        isOpen={addSongsModalOpen}
        title="Add Songs to Playlist"
        showCancel={true}
        cancelText="Done"
        onClose={() => setAddSongsModalOpen(false)}
      >
        {availableTracks.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            All songs from your library are already in this playlist.
          </p>
        ) : (
          <div className="flex flex-col gap-1 max-h-72 overflow-y-auto pr-1">
            {availableTracks.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <img
                    src={getArtworkSrc(t)}
                    alt={t.title}
                    className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="font-medium text-xs text-white truncate">{t.title}</div>
                    <div className="text-[11px] text-slate-400 truncate">{t.artist}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (onAddToPlaylist) onAddToPlaylist(t, playlist.id);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 font-semibold text-xs transition-colors flex-shrink-0"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Rename Playlist Modal */}
      <Modal
        isOpen={renameModalOpen}
        title="Rename Playlist"
        confirmText="Save"
        onClose={() => setRenameModalOpen(false)}
        onConfirm={() => {
          if (!newName.trim()) return;
          if (onRenamePlaylist) onRenamePlaylist(playlist.id, newName);
          setRenameModalOpen(false);
        }}
      >
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Playlist Name
          </label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
            className="w-full px-4 py-2.5 bg-dark-surface border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
          />
        </div>
      </Modal>

      {/* Delete Playlist Modal */}
      <Modal
        isOpen={deleteModalOpen}
        title="Delete Playlist"
        confirmText="Delete"
        confirmStyle="danger"
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => {
          if (onDeletePlaylist) onDeletePlaylist(playlist.id);
          setDeleteModalOpen(false);
        }}
      >
        <p className="text-slate-300">
          Are you sure you want to delete <span className="font-semibold text-white">"{playlist.name}"</span>?
        </p>
        <p className="text-xs text-slate-400 mt-2">
          This will only remove the playlist. Audio files will remain in your library.
        </p>
      </Modal>
    </div>
  );
}

export default PlaylistDetailPage;
