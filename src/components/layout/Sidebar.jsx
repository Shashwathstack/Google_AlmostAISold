import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  SearchX,
  Dna,
  Clock,
  LifeBuoy,
  BookOpen,
  Settings,
  HelpCircle,
  ChevronsLeft,
  ChevronsRight,
  Zap,
  X,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/opportunities', label: 'Lost Opportunities', icon: SearchX },
  { to: '/dna', label: 'Lost Sale DNA', icon: Dna },
  { to: '/time-machine', label: 'Time Machine', icon: Clock },
  { to: '/recovery', label: 'Recovery Center', icon: LifeBuoy },
  { to: '/memory', label: 'Recovery Memory', icon: BookOpen },
];

const BOTTOM_ITEMS = [
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/help', label: 'Help', icon: HelpCircle },
];

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, mobileMenuOpen, setMobileMenuOpen } = useApp();
  const location = useLocation();

  const handleNavClick = () => {
    if (window.innerWidth <= 768) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="drawer-overlay open"
          style={{ zIndex: 199 }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <Zap size={18} />
          </div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">AlmostSold AI</span>
            <span className="sidebar-brand-sub">Revenue Recovery Intelligence</span>
          </div>
          {mobileMenuOpen && (
            <button
              className="btn btn-ghost btn-icon"
              onClick={() => setMobileMenuOpen(false)}
              style={{ marginLeft: 'auto' }}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-nav-section">
            <div className="sidebar-nav-label">Main</div>
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const isActive = item.to === '/' 
                ? location.pathname === '/' 
                : location.pathname.startsWith(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={handleNavClick}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <span className="sidebar-link-icon">
                    <Icon size={18} />
                  </span>
                  <span className="sidebar-link-text">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        <div className="sidebar-bottom">
          {BOTTOM_ITEMS.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`sidebar-link ${location.pathname === item.to ? 'active' : ''}`}
                onClick={handleNavClick}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <span className="sidebar-link-icon">
                  <Icon size={18} />
                </span>
                <span className="sidebar-link-text">{item.label}</span>
              </NavLink>
            );
          })}
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {sidebarCollapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
            <span className="sidebar-link-text">{sidebarCollapsed ? '' : 'Collapse'}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
