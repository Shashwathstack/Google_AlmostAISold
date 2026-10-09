import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Sun,
  Moon,
  Bell,
  Menu,
  ChevronRight,
  User,
  Building2,
  ChevronDown,
} from 'lucide-react';
import CommandPalette from '../ui/CommandPalette';

const PAGE_TITLES = {
  '/': 'Overview',
  '/opportunities': 'Lost Opportunities',
  '/dna': 'Lost Sale DNA',
  '/time-machine': 'Time Machine',
  '/recovery': 'Recovery Center',
  '/memory': 'Recovery Memory',
  '/settings': 'Settings',
  '/help': 'Help',
};

export default function TopBar() {
  const { theme, toggleTheme } = useTheme();
  const { currentBusiness, businesses, setCurrentBusiness, toggleMobileMenu } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [bizDropdownOpen, setBizDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const bizRef = useRef(null);
  const profileRef = useRef(null);

  const pageTitle = PAGE_TITLES[location.pathname] || 'AlmostSold AI';

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      if (e.key === '/' && !e.target.closest('input, textarea, select')) {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (bizRef.current && !bizRef.current.contains(e.target)) setBizDropdownOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <button
            className="btn btn-ghost btn-icon"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
            style={{ display: 'none' }}
            id="mobile-menu-btn"
          >
            <Menu size={20} />
          </button>
          <div className="topbar-breadcrumbs">
            <span>AlmostSold AI</span>
            <ChevronRight size={12} />
            <span style={{ color: 'var(--text-primary)' }}>{pageTitle}</span>
          </div>
        </div>

        <div className="topbar-right">
          <button
            className="topbar-btn topbar-search-btn"
            onClick={() => setCommandPaletteOpen(true)}
            id="search-btn"
          >
            <Search size={14} />
            <span>Search...</span>
            <kbd>⌘K</kbd>
          </button>

          <button className="topbar-btn" aria-label="Notifications" id="notifications-btn">
            <Bell size={18} />
            <span className="topbar-notification-dot" />
          </button>

          <button
            className="topbar-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            id="theme-toggle-btn"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Business selector */}
          <div className="dropdown" ref={bizRef}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setBizDropdownOpen(!bizDropdownOpen)}
              id="business-selector"
            >
              <Building2 size={14} />
              <span className="truncate" style={{ maxWidth: 120 }}>{currentBusiness.name}</span>
              <ChevronDown size={12} />
            </button>
            <div className={`dropdown-menu ${bizDropdownOpen ? 'open' : ''}`}>
              {businesses.map(biz => (
                <div
                  key={biz.id}
                  className="dropdown-item"
                  onClick={() => {
                    setCurrentBusiness(biz);
                    setBizDropdownOpen(false);
                  }}
                  style={biz.id === currentBusiness.id ? { color: 'var(--accent)', fontWeight: 600 } : {}}
                >
                  <Building2 size={14} />
                  {biz.name}
                </div>
              ))}
            </div>
          </div>

          {/* Profile */}
          <div className="dropdown" ref={profileRef}>
            <div
              className="topbar-profile"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              id="profile-btn"
            >
              <User size={14} />
            </div>
            <div className={`dropdown-menu ${profileDropdownOpen ? 'open' : ''}`}>
              <div className="dropdown-item" style={{ pointerEvents: 'none', opacity: 0.7 }}>
                <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>
                  Shashwath
                </span>
              </div>
              <div className="dropdown-divider" />
              <div className="dropdown-item" onClick={() => { navigate('/settings'); setProfileDropdownOpen(false); }}>
                Settings
              </div>
              <div className="dropdown-item" onClick={() => { navigate('/help'); setProfileDropdownOpen(false); }}>
                Help & Support
              </div>
            </div>
          </div>
        </div>
      </header>

      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      {/* Mobile menu button visibility */}
      <style>{`
        @media (max-width: 768px) {
          #mobile-menu-btn { display: flex !important; }
          .topbar-search-btn span,
          .topbar-search-btn kbd { display: none; }
          .topbar-search-btn { width: 36px; padding: 0; justify-content: center; }
          .topbar-breadcrumbs { display: none; }
        }
      `}</style>
    </>
  );
}
