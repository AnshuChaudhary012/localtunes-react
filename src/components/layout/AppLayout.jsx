import React, { useState, useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { DesktopSidebar } from './DesktopSidebar.jsx';
import { MobileHeader } from './MobileHeader.jsx';
import { MobileBottomNav } from './MobileBottomNav.jsx';
import { DragDropOverlay } from './DragDropOverlay.jsx';
import { MiniPlayer } from '../player/MiniPlayer.jsx';
import { FullPlayer } from '../player/FullPlayer.jsx';
import { QueueDrawer } from '../player/QueueDrawer.jsx';
import { ToastContainer } from '../common/Toast.jsx';

export function AppLayout({
  onAddMusic,
  onInstallPwa,
  canInstallPwa = false,
  storageInfo = null,
  trackCount = 0,
  isFavorite = false,
  showMiniProgressBar = true,
  showRemainingTime = false,
  enableVisualizer = true,
  onToggleFavorite,
  onToggleRemainingTime,
  toasts = [],
  onDismissToast,
  children,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [fullPlayerOpen, setFullPlayerOpen] = useState(false);
  const [queueDrawerOpen, setQueueDrawerOpen] = useState(false);
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    const mainEl = document.getElementById('app-main-content');
    if (mainEl) {
      mainEl.scrollTop = 0;
    }
  }, [location.pathname]);

  useEffect(() => {
    let dragCounter = 0;

    const handleDragEnter = (e) => {
      e.preventDefault();
      dragCounter++;
      setIsDragging(true);
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter <= 0) {
        dragCounter = 0;
        setIsDragging(false);
      }
    };

    const handleDragOver = (e) => {
      e.preventDefault();
    };

    const handleDrop = (e) => {
      e.preventDefault();
      dragCounter = 0;
      setIsDragging(false);
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

  return (
    <div className="flex h-full w-full overflow-hidden bg-dark-bg text-slate-100">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={onDismissToast} />

      {/* Drag & Drop Fullscreen Overlay */}
      <DragDropOverlay isDragging={isDragging} />

      {/* Desktop Sidebar (Hidden on mobile) */}
      <DesktopSidebar
        onAddMusic={onAddMusic}
        onInstallPwa={onInstallPwa}
        canInstallPwa={canInstallPwa}
        storageInfo={storageInfo}
        trackCount={trackCount}
      />

      {/* Main Column */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        {/* Mobile Header (Hidden on desktop) */}
        <MobileHeader
          onAddMusic={onAddMusic}
          onInstallPwa={onInstallPwa}
          canInstallPwa={canInstallPwa}
        />

        {/* Scrollable Main Content Container */}
        <main
          id="app-main-content"
          className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 max-w-7xl w-full mx-auto"
        >
          {children || <Outlet />}
        </main>

        {/* Bottom Audio Players Container Slot */}
        <div id="player-container" className="relative z-30 flex-shrink-0">
          <MiniPlayer
            isFavorite={isFavorite}
            showProgressBar={showMiniProgressBar}
            onOpenFullPlayer={() => setFullPlayerOpen(true)}
            onToggleFavorite={onToggleFavorite}
          />
        </div>

        {/* Mobile Bottom Navigation (Hidden on desktop) */}
        <MobileBottomNav />
      </div>

      {/* Full Player Overlay */}
      <FullPlayer
        isOpen={fullPlayerOpen}
        isFavorite={isFavorite}
        showRemainingTime={showRemainingTime}
        enableVisualizer={enableVisualizer}
        onClose={() => setFullPlayerOpen(false)}
        onOpenQueue={() => setQueueDrawerOpen(true)}
        onToggleFavorite={onToggleFavorite}
        onToggleRemainingTime={onToggleRemainingTime}
      />

      {/* Up Next Queue Drawer */}
      <QueueDrawer
        isOpen={queueDrawerOpen}
        onClose={() => setQueueDrawerOpen(false)}
      />
    </div>
  );
}

export default AppLayout;
