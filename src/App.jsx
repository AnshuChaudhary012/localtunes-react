import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { LibraryPage } from './pages/LibraryPage.jsx';
import { FavoritesPage } from './pages/FavoritesPage.jsx';
import { PlaylistsPage } from './pages/PlaylistsPage.jsx';
import { SearchPage } from './pages/SearchPage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';
import { usePlayer } from './context/PlayerContext.jsx';
import { useLibrary } from './context/LibraryContext.jsx';
import { settingsService } from './services/settingsService.js';
import { player } from './services/player.js';
import { pwaService } from './services/pwaService.js';

export function App() {
  const navigate = useNavigate();
  const playerCtx = usePlayer();
  const library = useLibrary();

  const {
    allTracks,
    favoriteTracks,
    favoritesSet,
    playlists,
    recentlyPlayed,
    recentlyAdded,
    storageInfo,
    isLoading,
    error: dbError,
  } = library;

  // UI Settings states
  const [showMiniProgressBar, setShowMiniProgressBar] = useState(() =>
    settingsService.get('showMiniProgressBar')
  );
  const [showRemainingTime, setShowRemainingTime] = useState(() =>
    settingsService.get('showRemainingTime')
  );
  const [enableVisualizer, setEnableVisualizer] = useState(() =>
    settingsService.get('enableVisualizer') !== false
  );

  // PWA Installation & Update state
  const [canInstallPwa, setCanInstallPwa] = useState(pwaService.canInstall);

  // Toast notifications state
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Listen to PWA lifecycle events
  useEffect(() => {
    const unsubInstallable = pwaService.on('installable', (can) => {
      setCanInstallPwa(can);
    });
    const unsubInstalled = pwaService.on('installed', () => {
      setCanInstallPwa(false);
      addToast('LocalTunes installed successfully!', 'success');
    });
    const unsubUpdate = pwaService.on('updateAvailable', () => {
      addToast('New version available. Refresh to update.', 'info', 8000);
    });

    return () => {
      unsubInstallable();
      unsubInstalled();
      unsubUpdate();
    };
  }, [addToast]);

  const handleInstallPwa = useCallback(async () => {
    const res = await pwaService.promptInstall();
    if (res.success) {
      addToast('LocalTunes installed successfully!', 'success');
    } else if (res.reason === 'not-supported') {
      addToast('App installation is already complete or not supported in this browser.', 'info');
    }
  }, [addToast]);

  // Sync settings changes
  useEffect(() => {
    const unsub = settingsService.on('change', ({ key, value }) => {
      if (key === 'showMiniProgressBar') {
        setShowMiniProgressBar(value);
      } else if (key === 'showRemainingTime') {
        setShowRemainingTime(value);
      } else if (key === 'enableVisualizer') {
        setEnableVisualizer(value !== false);
      }
    });
    return () => unsub();
  }, []);

  const handleToggleRemainingTime = useCallback(() => {
    const nextVal = !settingsService.get('showRemainingTime');
    settingsService.set('showRemainingTime', nextVal);
    setShowRemainingTime(nextVal);
  }, []);

  // Legacy hash redirect handler (e.g. #library -> /library, #home -> /)
  useEffect(() => {
    if (window.location.hash) {
      const hashRoute = window.location.hash.replace('#', '').replace(/^\//, '');
      if (hashRoute) {
        const target = hashRoute === 'home' ? '/' : `/${hashRoute}`;
        navigate(target, { replace: true });
      }
    }
  }, [navigate]);

  // File import handling
  const importFiles = useCallback(
    async (files) => {
      if (!files || files.length === 0) return;
      const res = await library.importFiles(files);
      if (res.successCount > 0) {
        addToast(
          `Imported ${res.successCount} track${res.successCount === 1 ? '' : 's'} to Library`,
          'success'
        );
      } else {
        addToast('No tracks were imported', 'warning');
      }
    },
    [library, addToast]
  );

  // Bind native file input
  useEffect(() => {
    const fileInput = document.getElementById('audio-file-input');
    if (!fileInput) return;

    const handleFileChange = (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        importFiles(files);
      }
    };

    fileInput.addEventListener('change', handleFileChange);
    return () => fileInput.removeEventListener('change', handleFileChange);
  }, [importFiles]);

  const handleAddMusic = useCallback(() => {
    const fileInput = document.getElementById('audio-file-input');
    if (fileInput) {
      fileInput.value = '';
      fileInput.click();
    }
  }, []);

  // Try demo track synthesizer
  const handleTryDemoTrack = useCallback(async () => {
    try {
      const demoTrack = await library.createDemoTrack();
      addToast('Demo track created! Enjoy the music.', 'success');
      playerCtx.playTrack(demoTrack);
    } catch (err) {
      console.error('Failed to create demo track:', err);
      addToast('Failed to create demo track', 'error');
    }
  }, [library, playerCtx, addToast]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          playerCtx.togglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (e.shiftKey) {
            playerCtx.next();
          } else {
            playerCtx.seek(playerCtx.currentTime + 5);
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (e.shiftKey) {
            playerCtx.previous();
          } else {
            playerCtx.seek(playerCtx.currentTime - 5);
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          playerCtx.setVolume(playerCtx.volume + 0.05);
          break;
        case 'ArrowDown':
          e.preventDefault();
          playerCtx.setVolume(playerCtx.volume - 0.05);
          break;
        case 'KeyM':
          playerCtx.toggleMute();
          break;
        case 'KeyS':
          playerCtx.toggleShuffle();
          addToast(player.shuffle ? 'Shuffle On' : 'Shuffle Off', 'info', 1500);
          break;
        case 'KeyR':
          playerCtx.changeRepeatMode();
          addToast(`Repeat: ${player.repeat.toUpperCase()}`, 'info', 1500);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerCtx, addToast]);

  // Favorite toggle action
  const handleToggleFavorite = useCallback(
    async (track) => {
      if (!track || !track.id) return;
      try {
        const isNowFav = await library.toggleFavorite(track);
        addToast(
          isNowFav ? `Added "${track.title}" to Favorites` : `Removed "${track.title}" from Favorites`,
          isNowFav ? 'success' : 'info'
        );
      } catch (err) {
        console.error('Error toggling favorite:', err);
      }
    },
    [library, addToast]
  );

  // Track deletion action
  const handleDeleteTrack = useCallback(
    async (track) => {
      if (!track || !track.id) return;
      try {
        await library.deleteTrack(track);
        addToast(`Deleted "${track.title}" from Library`, 'info');
      } catch (err) {
        console.error('Error deleting track:', err);
      }
    },
    [library, addToast]
  );

  // Playlist actions
  const handleCreatePlaylist = useCallback(
    async (name, description) => {
      try {
        const pl = await library.createPlaylist(name, description);
        addToast(`Created playlist "${pl.name}"`, 'success');
      } catch (err) {
        addToast(err.message || 'Failed to create playlist', 'error');
      }
    },
    [library, addToast]
  );

  const handleRenamePlaylist = useCallback(
    async (id, newName) => {
      try {
        const pl = await library.renamePlaylist(id, newName);
        addToast(`Renamed playlist to "${pl.name}"`, 'success');
      } catch (err) {
        addToast(err.message || 'Failed to rename playlist', 'error');
      }
    },
    [library, addToast]
  );

  const handleDeletePlaylist = useCallback(
    async (id) => {
      try {
        await library.deletePlaylist(id);
        addToast('Playlist deleted', 'info');
      } catch (err) {
        addToast('Failed to delete playlist', 'error');
      }
    },
    [library, addToast]
  );

  const handleAddToPlaylist = useCallback(
    async (track, playlistId) => {
      if (!track || !playlistId) return;
      try {
        await library.addTrackToPlaylist(track, playlistId);
        addToast(`Added "${track.title}" to playlist`, 'success');
      } catch (err) {
        addToast('Failed to add track to playlist', 'error');
      }
    },
    [library, addToast]
  );

  const handleRemoveFromPlaylist = useCallback(
    async (track, playlistId) => {
      if (!track || !playlistId) return;
      try {
        await library.removeTrackFromPlaylist(track, playlistId);
        addToast(`Removed "${track.title}" from playlist`, 'info');
      } catch (err) {
        addToast('Failed to remove track from playlist', 'error');
      }
    },
    [library, addToast]
  );

  const handleClearFavorites = useCallback(async () => {
    try {
      await library.clearFavorites();
      addToast('Cleared all favorites', 'info');
    } catch (err) {
      addToast('Failed to clear favorites', 'error');
    }
  }, [library, addToast]);

  const handleClearRecentlyPlayed = useCallback(async () => {
    try {
      await library.clearRecentlyPlayed();
      addToast('Cleared recently played history', 'info');
    } catch (err) {
      addToast('Failed to clear recently played history', 'error');
    }
  }, [library, addToast]);

  const isCurrentFavorite = Boolean(
    playerCtx.currentTrack && favoritesSet.has(playerCtx.currentTrack.id)
  );

  return (
    <AppLayout
      onAddMusic={handleAddMusic}
      onInstallPwa={handleInstallPwa}
      canInstallPwa={canInstallPwa}
      storageInfo={storageInfo}
      trackCount={allTracks.length}
      isFavorite={isCurrentFavorite}
      showMiniProgressBar={showMiniProgressBar}
      showRemainingTime={showRemainingTime}
      enableVisualizer={enableVisualizer}
      onToggleFavorite={() => handleToggleFavorite(playerCtx.currentTrack)}
      onToggleRemainingTime={handleToggleRemainingTime}
      toasts={toasts}
      onDismissToast={dismissToast}
    >
      {/* Database Error Banner if IndexedDB fails */}
      {dbError && (
        <div className="mx-4 sm:mx-6 mb-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-3 text-rose-300 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse flex-shrink-0" />
            <span>Database error: {dbError}</span>
          </div>
          <button
            type="button"
            onClick={library.refreshLibrary}
            className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              allTracks={allTracks}
              recentlyPlayed={recentlyPlayed}
              recentlyAdded={recentlyAdded}
              favoritesSet={favoritesSet}
              isLoading={isLoading}
              onAddMusic={handleAddMusic}
              onTryDemoTrack={handleTryDemoTrack}
              onToggleFavorite={handleToggleFavorite}
              onAddToPlaylist={handleAddToPlaylist}
              onDeleteTrack={handleDeleteTrack}
            />
          }
        />
        <Route
          path="/library"
          element={
            <LibraryPage
              allTracks={allTracks}
              favoritesSet={favoritesSet}
              isLoading={isLoading}
              onAddMusic={handleAddMusic}
              onToggleFavorite={handleToggleFavorite}
              onAddToPlaylist={handleAddToPlaylist}
              onDeleteTrack={handleDeleteTrack}
            />
          }
        />
        <Route
          path="/favorites"
          element={
            <FavoritesPage
              favoriteTracks={favoriteTracks}
              favoritesSet={favoritesSet}
              isLoading={isLoading}
              onToggleFavorite={handleToggleFavorite}
              onAddToPlaylist={handleAddToPlaylist}
              onDeleteTrack={handleDeleteTrack}
            />
          }
        />
        <Route
          path="/playlists"
          element={
            <PlaylistsPage
              playlists={playlists}
              allTracks={allTracks}
              favoritesSet={favoritesSet}
              isLoading={isLoading}
              onCreatePlaylist={handleCreatePlaylist}
              onRenamePlaylist={handleRenamePlaylist}
              onDeletePlaylist={handleDeletePlaylist}
              onToggleFavorite={handleToggleFavorite}
              onAddToPlaylist={handleAddToPlaylist}
              onRemoveTrackFromPlaylist={handleRemoveFromPlaylist}
            />
          }
        />
        <Route
          path="/playlists/:id"
          element={
            <PlaylistsPage
              playlists={playlists}
              allTracks={allTracks}
              favoritesSet={favoritesSet}
              isLoading={isLoading}
              onCreatePlaylist={handleCreatePlaylist}
              onRenamePlaylist={handleRenamePlaylist}
              onDeletePlaylist={handleDeletePlaylist}
              onToggleFavorite={handleToggleFavorite}
              onAddToPlaylist={handleAddToPlaylist}
              onRemoveTrackFromPlaylist={handleRemoveFromPlaylist}
            />
          }
        />
        <Route
          path="/search"
          element={
            <SearchPage
              allTracks={allTracks}
              favoritesSet={favoritesSet}
              onToggleFavorite={handleToggleFavorite}
              onAddToPlaylist={handleAddToPlaylist}
              onDeleteTrack={handleDeleteTrack}
            />
          }
        />
        <Route
          path="/settings"
          element={
            <SettingsPage
              storageInfo={storageInfo}
              trackCount={allTracks.length}
              onClearFavorites={handleClearFavorites}
              onClearRecentlyPlayed={handleClearRecentlyPlayed}
            />
          }
        />
        {/* Fallback route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
