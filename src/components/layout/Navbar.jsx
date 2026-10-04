import React from 'react';
import { DesktopSidebar } from './DesktopSidebar.jsx';
import { MobileHeader } from './MobileHeader.jsx';
import { MobileBottomNav } from './MobileBottomNav.jsx';

export function Navbar({
  onAddMusic,
  onInstallPwa,
  canInstallPwa = false,
  storageInfo = null,
  trackCount = 0,
}) {
  return (
    <>
      <DesktopSidebar
        onAddMusic={onAddMusic}
        onInstallPwa={onInstallPwa}
        canInstallPwa={canInstallPwa}
        storageInfo={storageInfo}
        trackCount={trackCount}
      />
      <MobileHeader onAddMusic={onAddMusic} />
      <MobileBottomNav />
    </>
  );
}

export { DesktopSidebar, MobileHeader, MobileBottomNav };
export default Navbar;
