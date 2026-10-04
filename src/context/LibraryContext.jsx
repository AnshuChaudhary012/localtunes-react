import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { openDB } from '../services/db.js';
import {
  getAllTracks,
  getFavoriteTracks,
  getFavoriteIds,
  getPlaylists,
  getRecentlyPlayed,
  getRecentlyAdded,
  getStorageUsage,
  saveTrack,
  deleteTrack as deleteTrackFromStorage,
  toggleFavorite as toggleFavoriteInStorage,
  clearAllFavorites as clearFavoritesInStorage,
  createPlaylist as createPlaylistInStorage,
  renamePlaylist as renamePlaylistInStorage,
  deletePlaylist as deletePlaylistInStorage,
  addTrackToPlaylist as addTrackToPlaylistInStorage,
  removeTrackFromPlaylist as removeTrackFromPlaylistInStorage,
  clearRecentlyPlayed as clearRecentlyPlayedInStorage,
} from '../services/musicStorage.js';
import { extractMetadata } from '../utils/metadataParser.js';
import { player } from '../services/player.js';

export const LibraryContext = createContext(null);

export function LibraryProvider({ children }) {
  const [allTracks, setAllTracks] = useState([]);
  const [favoriteTracks, setFavoriteTracks] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [recentlyAdded, setRecentlyAdded] = useState([]);
  const [storageInfo, setStorageInfo] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState(null);

  // Set of favorite IDs for O(1) lookup
  const favoritesSet = useMemo(() => {
    return new Set(favoriteIds);
  }, [favoriteIds]);

  // Refresh all collections from IndexedDB
  const refreshLibrary = useCallback(async () => {
    try {
      setDbError(null);
      await openDB(); // Verify DB can be opened

      const [tracks, favTracks, favIds, pls, recPlayed, recAdded, storage] = await Promise.all([
        getAllTracks().catch(() => []),
        getFavoriteTracks().catch(() => []),
        getFavoriteIds().catch(() => []),
        getPlaylists().catch(() => []),
        getRecentlyPlayed().catch(() => []),
        getRecentlyAdded().catch(() => []),
        getStorageUsage().catch(() => null),
      ]);

      setAllTracks(tracks);
      setFavoriteTracks(favTracks);
      setFavoriteIds(favIds);
      setPlaylists(pls);
      setRecentlyPlayed(recPlayed);
      setRecentlyAdded(recAdded);
      setStorageInfo(storage);

      return tracks;
    } catch (err) {
      console.error('Failed to load library data from IndexedDB:', err);
      setDbError(err.message || 'Failed to open local music database');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load on mount
  useEffect(() => {
    let isMounted = true;

    async function init() {
      setIsLoading(true);
      const tracks = await refreshLibrary();

      // Restore saved player state if tracks exist and player has no active queue
      if (isMounted && tracks.length > 0 && player.queue.length === 0) {
        try {
          await player.restoreSavedState(tracks);
        } catch (e) {
          console.warn('Could not restore saved player state:', e);
        }
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, [refreshLibrary]);

  // Import files using metadataParser and save to IndexedDB
  const importFiles = useCallback(
    async (files) => {
      if (!files || files.length === 0) return { successCount: 0, totalCount: 0, imported: [] };

      const fileArray = Array.from(files);
      const imported = [];
      let successCount = 0;

      for (const file of fileArray) {
        try {
          const meta = await extractMetadata(file);
          const trackData = {
            id: 'trk_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
            title: meta.title,
            artist: meta.artist,
            album: meta.album,
            duration: meta.duration,
            audioBlob: file,
            artworkBlob: meta.artworkBlob,
            artworkUrl: meta.artworkUrl,
            fileType: meta.fileType,
            fileName: meta.fileName,
            fileSize: meta.fileSize,
            dateAdded: Date.now(),
          };

          const saved = await saveTrack(trackData);
          imported.push(saved);
          successCount++;
        } catch (err) {
          console.error('Failed to import track file:', file.name, err);
        }
      }

      if (successCount > 0) {
        await refreshLibrary();
      }

      return {
        successCount,
        totalCount: fileArray.length,
        imported,
      };
    },
    [refreshLibrary]
  );

  // Toggle Favorite
  const toggleFavorite = useCallback(
    async (trackOrId) => {
      const id = typeof trackOrId === 'string' ? trackOrId : trackOrId?.id;
      if (!id) return false;

      try {
        const isNowFav = await toggleFavoriteInStorage(id);
        // Optimistically update local favorite state
        setFavoriteIds((prev) => (isNowFav ? [...prev, id] : prev.filter((tId) => tId !== id)));
        await refreshLibrary();
        return isNowFav;
      } catch (err) {
        console.error('Failed to toggle favorite:', err);
        throw err;
      }
    },
    [refreshLibrary]
  );

  // Clear all favorites
  const clearFavorites = useCallback(async () => {
    try {
      await clearFavoritesInStorage();
      await refreshLibrary();
      return true;
    } catch (err) {
      console.error('Failed to clear favorites:', err);
      throw err;
    }
  }, [refreshLibrary]);

  // Delete Track
  const deleteTrack = useCallback(
    async (trackOrId) => {
      const id = typeof trackOrId === 'string' ? trackOrId : trackOrId?.id;
      if (!id) return false;

      try {
        // If track is currently playing, halt playback and clear queue
        if (player.currentTrack && player.currentTrack.id === id) {
          player.pause();
          player.clearQueue();
        }

        const success = await deleteTrackFromStorage(id);
        await refreshLibrary();
        return success;
      } catch (err) {
        console.error('Failed to delete track:', err);
        throw err;
      }
    },
    [refreshLibrary]
  );

  // Create Playlist
  const createPlaylist = useCallback(
    async (name, description = '') => {
      try {
        const newPl = await createPlaylistInStorage(name, description);
        await refreshLibrary();
        return newPl;
      } catch (err) {
        console.error('Failed to create playlist:', err);
        throw err;
      }
    },
    [refreshLibrary]
  );

  // Rename Playlist
  const renamePlaylist = useCallback(
    async (id, newName) => {
      try {
        const updated = await renamePlaylistInStorage(id, newName);
        await refreshLibrary();
        return updated;
      } catch (err) {
        console.error('Failed to rename playlist:', err);
        throw err;
      }
    },
    [refreshLibrary]
  );

  // Delete Playlist
  const deletePlaylist = useCallback(
    async (id) => {
      try {
        const success = await deletePlaylistInStorage(id);
        await refreshLibrary();
        return success;
      } catch (err) {
        console.error('Failed to delete playlist:', err);
        throw err;
      }
    },
    [refreshLibrary]
  );

  // Add Track to Playlist
  const addTrackToPlaylist = useCallback(
    async (trackOrId, playlistId) => {
      const trackId = typeof trackOrId === 'string' ? trackOrId : trackOrId?.id;
      if (!trackId || !playlistId) return null;

      try {
        const updated = await addTrackToPlaylistInStorage(playlistId, trackId);
        await refreshLibrary();
        return updated;
      } catch (err) {
        console.error('Failed to add track to playlist:', err);
        throw err;
      }
    },
    [refreshLibrary]
  );

  // Remove Track from Playlist
  const removeTrackFromPlaylist = useCallback(
    async (trackOrId, playlistId) => {
      const trackId = typeof trackOrId === 'string' ? trackOrId : trackOrId?.id;
      if (!trackId || !playlistId) return null;

      try {
        const updated = await removeTrackFromPlaylistInStorage(playlistId, trackId);
        await refreshLibrary();
        return updated;
      } catch (err) {
        console.error('Failed to remove track from playlist:', err);
        throw err;
      }
    },
    [refreshLibrary]
  );

  // Clear Recently Played
  const clearRecentlyPlayed = useCallback(async () => {
    try {
      await clearRecentlyPlayedInStorage();
      await refreshLibrary();
      return true;
    } catch (err) {
      console.error('Failed to clear recently played:', err);
      throw err;
    }
  }, [refreshLibrary]);

  // Create Synthesized Demo Track
  const createDemoTrack = useCallback(async () => {
    try {
      const { generateDemoAudioBlob } = await import('../utils/demoAudioGenerator.js');
      const blob = generateDemoAudioBlob();
      const demoTrack = {
        id: 'demo_' + Date.now(),
        title: 'Neon Horizon (Synthesized Demo)',
        artist: 'LocalTunes Demo Lab',
        album: 'Synthesized Sounds',
        duration: 15,
        audioBlob: blob,
        fileType: 'audio/wav',
        fileName: 'neon_horizon_demo.wav',
        fileSize: blob.size,
        dateAdded: Date.now(),
        playCount: 0,
      };

      await saveTrack(demoTrack);
      await refreshLibrary();
      return demoTrack;
    } catch (err) {
      console.error('Failed to create synthesized demo track:', err);
      throw err;
    }
  }, [refreshLibrary]);

  const value = useMemo(
    () => ({
      // State
      allTracks,
      favoriteTracks,
      favoriteIds,
      favoritesSet,
      playlists,
      recentlyPlayed,
      recentlyAdded,
      storageInfo,
      isLoading,
      error: dbError,
      trackCount: allTracks.length,

      // Operations
      refreshLibrary,
      importFiles,
      toggleFavorite,
      clearFavorites,
      deleteTrack,
      createPlaylist,
      renamePlaylist,
      deletePlaylist,
      addTrackToPlaylist,
      removeTrackFromPlaylist,
      clearRecentlyPlayed,
      createDemoTrack,
    }),
    [
      allTracks,
      favoriteTracks,
      favoriteIds,
      favoritesSet,
      playlists,
      recentlyPlayed,
      recentlyAdded,
      storageInfo,
      isLoading,
      dbError,
      refreshLibrary,
      importFiles,
      toggleFavorite,
      clearFavorites,
      deleteTrack,
      createPlaylist,
      renamePlaylist,
      deletePlaylist,
      addTrackToPlaylist,
      removeTrackFromPlaylist,
      clearRecentlyPlayed,
      createDemoTrack,
    ]
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
}

export default LibraryContext;
