import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from '../common/Icon.jsx';

const MOBILE_NAV_ITEMS = [
  { path: '/', label: 'Home', icon: 'home', end: true },
  { path: '/library', label: 'Library', icon: 'library' },
  { path: '/search', label: 'Search', icon: 'search' },
  { path: '/favorites', label: 'Favorites', icon: 'heart' },
  { path: '/settings', label: 'Settings', icon: 'settings' },
];

export function MobileBottomNav() {
  return (
    <nav className="md:hidden bg-dark-surface/95 border-t border-dark-border backdrop-blur-xl z-20 pb-0">
      <div className="flex items-center justify-around px-2 py-2">
        {MOBILE_NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-2.5 text-xs transition-colors ${
                isActive
                  ? 'font-semibold text-[var(--color-accent-primary)]'
                  : 'font-medium text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <Icon name={item.icon} className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default MobileBottomNav;
