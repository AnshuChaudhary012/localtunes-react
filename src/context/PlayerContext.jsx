import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react';
import { player } from '../services/player.js';

export const PlayerContext = createContext(null);

const initialPlayerState = {
  currentTrack: player.currentTrack || null,
  isPlaying: player.isPlaying || false,
  currentTime: player.currentTime || 0,
  duration: player.duration || 0,
  volume: typeof player.volume === 'number' ? player.volume : 0.8,
  isMuted: player.isMuted || false,
  shuffle: player.shuffle || false,
  repeatMode: player.repeat || 'off',
  queue: player.queue || [],
  currentTrackIndex: player.currentIndex !== undefined ? player.currentIndex : -1,
};

function playerReducer(state, action) {
  switch (action.type) {
    case 'TRACK_CHANGE':
      return {
        ...state,
        currentTrack: action.payload,
        duration: action.payload?.duration || (action.payload ? state.duration : 0),
        currentTime: action.payload ? state.currentTime : 0,
      };
    case 'PLAYBACK_CHANGE':
      return {
        ...state,
        isPlaying: action.payload,
      };
    case 'TIME_UPDATE':
      // Avoid redundant re-renders if position hasn't changed meaningfully
      if (
        Math.abs(state.currentTime - action.payload.currentTime) < 0.25 &&
        state.duration === action.payload.duration
      ) {
        return state;
      }
      return {
        ...state,
        currentTime: action.payload.currentTime,
        duration: action.payload.duration || state.duration,
      };
    case 'QUEUE_CHANGE':
      return {
        ...state,
        queue: action.payload.queue,
        currentTrackIndex: action.payload.currentIndex,
      };
    case 'VOLUME_CHANGE':
      return {
        ...state,
        volume: action.payload.volume,
        isMuted: action.payload.isMuted,
      };
    case 'MODE_CHANGE':
      return {
        ...state,
        shuffle: action.payload.shuffle,
        repeatMode: action.payload.repeat,
      };
    default:
      return state;
  }
}

export function PlayerProvider({ children }) {
  const [state, dispatch] = useReducer(playerReducer, initialPlayerState);

  useEffect(() => {
    // Synchronize React state with underlying audio player events
    const unsubTrack = player.on('trackChange', (track) => {
      dispatch({ type: 'TRACK_CHANGE', payload: track });
    });

    const unsubPlayback = player.on('playbackChange', (isPlaying) => {
      dispatch({ type: 'PLAYBACK_CHANGE', payload: isPlaying });
    });

    const unsubTime = player.on('timeUpdate', ({ currentTime, duration }) => {
      dispatch({ type: 'TIME_UPDATE', payload: { currentTime, duration } });
    });

    const unsubQueue = player.on('queueChange', ({ queue, currentIndex }) => {
      dispatch({ type: 'QUEUE_CHANGE', payload: { queue, currentIndex } });
    });

    const unsubMode = player.on('modeChange', ({ shuffle, repeat }) => {
      dispatch({ type: 'MODE_CHANGE', payload: { shuffle, repeat } });
    });

    const unsubVolume = player.on('volumeChange', ({ volume, isMuted }) => {
      dispatch({ type: 'VOLUME_CHANGE', payload: { volume, isMuted } });
    });

    // Initial sync with player current state
    dispatch({ type: 'TRACK_CHANGE', payload: player.currentTrack });
    dispatch({ type: 'PLAYBACK_CHANGE', payload: player.isPlaying });
    dispatch({ type: 'QUEUE_CHANGE', payload: { queue: player.queue, currentIndex: player.currentIndex } });
    dispatch({ type: 'MODE_CHANGE', payload: { shuffle: player.shuffle, repeat: player.repeat } });
    dispatch({ type: 'VOLUME_CHANGE', payload: { volume: player.volume, isMuted: player.isMuted } });

    return () => {
      unsubTrack();
      unsubPlayback();
      unsubTime();
      unsubQueue();
      unsubMode();
      unsubVolume();
    };
  }, []);

  // Action methods invoking player service
  const play = useCallback(() => player.play(), []);
  const pause = useCallback(() => player.pause(), []);
  const togglePlay = useCallback(() => player.togglePlay(), []);
  const next = useCallback(() => player.next(), []);
  const previous = useCallback(() => player.previous(), []);
  const seek = useCallback((seconds) => player.seek(seconds), []);
  const seekPercent = useCallback((percent) => player.seekPercent(percent), []);
  const setVolume = useCallback((vol) => player.setVolume(vol), []);
  const toggleMute = useCallback(() => player.toggleMute(), []);
  const toggleShuffle = useCallback((syncSettings) => player.toggleShuffle(syncSettings), []);
  const changeRepeatMode = useCallback((mode) => (mode ? player.setRepeat(mode) : player.toggleRepeat()), []);

  const addToQueue = useCallback((track) => {
    if (!track) return;
    if (player.queue.length === 0) {
      player.setQueue([track], 0, false);
    } else {
      player.queue.push(track);
      player.unshuffledQueue.push(track);
      player.emit('queueChange', { queue: player.queue, currentIndex: player.currentIndex });
    }
  }, []);

  const playNext = useCallback((track) => {
    if (!track) return;
    if (player.queue.length === 0) {
      player.setQueue([track], 0, true);
    } else {
      player.queue.splice(player.currentIndex + 1, 0, track);
      player.unshuffledQueue.push(track);
      player.emit('queueChange', { queue: player.queue, currentIndex: player.currentIndex });
    }
  }, []);

  const removeFromQueue = useCallback((index) => player.removeFromQueue(index), []);
  const clearQueue = useCallback(() => player.clearQueue(), []);
  const playTrack = useCallback((track, queueContext) => player.playTrack(track, queueContext), []);
  const setQueue = useCallback((tracks, startIndex, autoPlay) => player.setQueue(tracks, startIndex, autoPlay), []);

  const shuffleRestQueue = useCallback(() => {
    const currentIdx = player.currentIndex;
    const head = player.queue.slice(0, currentIdx + 1);
    const tail = player.queue.slice(currentIdx + 1);
    player.shuffleArray(tail);
    player.queue = [...head, ...tail];
    player.emit('queueChange', { queue: player.queue, currentIndex: player.currentIndex });
  }, []);

  const getFrequencyData = useCallback(() => player.getFrequencyData(), []);

  const value = useMemo(
    () => ({
      // Exposed state properties (Requirement 3)
      currentTrack: state.currentTrack,
      isPlaying: state.isPlaying,
      currentTime: state.currentTime,
      duration: state.duration,
      volume: state.volume,
      isMuted: state.isMuted,
      shuffle: state.shuffle,
      repeatMode: state.repeatMode,
      repeat: state.repeatMode, // compatibility alias
      queue: state.queue,
      currentTrackIndex: state.currentTrackIndex,
      currentIndex: state.currentTrackIndex, // compatibility alias
      // Exposed action functions (Requirement 4)
      play,
      pause,
      togglePlay,
      next,
      previous,
      seek,
      seekPercent,
      setVolume,
      toggleMute,
      toggleShuffle,
      changeRepeatMode,
      toggleRepeat: changeRepeatMode, // compatibility alias
      addToQueue,
      playNext,
      removeFromQueue,
      clearQueue,
      playTrack,
      setQueue,
      shuffleRestQueue,
      getFrequencyData,
    }),
    [
      state,
      play,
      pause,
      togglePlay,
      next,
      previous,
      seek,
      seekPercent,
      setVolume,
      toggleMute,
      toggleShuffle,
      changeRepeatMode,
      addToQueue,
      playNext,
      removeFromQueue,
      clearQueue,
      playTrack,
      setQueue,
      shuffleRestQueue,
      getFrequencyData,
    ]
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}

export default PlayerContext;
