import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Search,
  LayoutDashboard,
  SearchX,
  Dna,
  Clock,
  LifeBuoy,
  BookOpen,
  Plus,
  Upload,
  ArrowRight,
} from 'lucide-react';

const NAV_COMMANDS = [
  { id: 'nav-overview', label: 'Go to Overview', icon: LayoutDashboard, action: '/', type: 'navigation' },
  { id: 'nav-opportunities', label: 'Go to Lost Opportunities', icon: SearchX, action: '/opportunities', type: 'navigation' },
  { id: 'nav-dna', label: 'Go to Lost Sale DNA', icon: Dna, action: '/dna', type: 'navigation' },
  { id: 'nav-time-machine', label: 'Go to Time Machine', icon: Clock, action: '/time-machine', type: 'navigation' },
  { id: 'nav-recovery', label: 'Go to Recovery Center', icon: LifeBuoy, action: '/recovery', type: 'navigation' },
  { id: 'nav-memory', label: 'Go to Recovery Memory', icon: BookOpen, action: '/memory', type: 'navigation' },
];

const ACTION_COMMANDS = [
  { id: 'action-new', label: 'Create New Opportunity', icon: Plus, action: 'new-opportunity', type: 'action' },
  { id: 'action-import', label: 'Import CSV', icon: Upload, action: 'import-csv', type: 'action' },
  { id: 'action-tm', label: 'Launch Time Machine', icon: Clock, action: '/time-machine', type: 'navigation' },
];

export default function CommandPalette({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { opportunities } = useApp();

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Search opportunities
  const matchedOpportunities = useMemo(() => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    return opportunities
      .filter(o =>
        o.product_name.toLowerCase().includes(q) ||
        o.loss_reason.toLowerCase().includes(q) ||
        (o.customer_notes && o.customer_notes.toLowerCase().includes(q))
      )
      .slice(0, 5)
      .map(o => ({
        id: `opp-${o.id}`,
        label: o.product_name,
        sublabel: `${o.loss_reason} · ₹${o.quoted_value.toFixed(0)}`,
        icon: SearchX,
        action: `/opportunities?selected=${o.id}`,
        type: 'navigation',
      }));
  }, [query, opportunities]);

  const filteredCommands = useMemo(() => {
    const q = query.toLowerCase();
    const navFiltered = NAV_COMMANDS.filter(c => c.label.toLowerCase().includes(q));
    const actionFiltered = ACTION_COMMANDS.filter(c => c.label.toLowerCase().includes(q));
    return { navigation: navFiltered, actions: actionFiltered, opportunities: matchedOpportunities };
  }, [query, matchedOpportunities]);

  const allItems = [
    ...filteredCommands.opportunities,
    ...filteredCommands.actions,
    ...filteredCommands.navigation,
  ];

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const executeItem = (item) => {
    onClose();
    if (item.type === 'navigation') {
      navigate(item.action);
    }
    // action types handled elsewhere
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, allItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && allItems[selectedIndex]) {
      executeItem(allItems[selectedIndex]);
    }
  };

  if (!open) return null;

  let itemIndex = 0;

  return (
    <div className={`command-palette-overlay ${open ? 'open' : ''}`} onClick={onClose}>
      <div className="command-palette" onClick={e => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="command-palette-input"
          placeholder="Search opportunities, navigate, or run a command..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="command-palette-results">
          {filteredCommands.opportunities.length > 0 && (
            <>
              <div className="command-palette-section-title">Opportunities</div>
              {filteredCommands.opportunities.map(item => {
                const idx = itemIndex++;
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className={`command-palette-item ${idx === selectedIndex ? 'selected' : ''}`}
                    onClick={() => executeItem(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <Icon size={16} />
                    <div className="command-palette-item-label">
                      <div>{item.label}</div>
                      {item.sublabel && (
                        <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>
                          {item.sublabel}
                        </div>
                      )}
                    </div>
                    <ArrowRight size={12} style={{ color: 'var(--text-tertiary)' }} />
                  </div>
                );
              })}
            </>
          )}

          {filteredCommands.actions.length > 0 && (
            <>
              <div className="command-palette-section-title">Actions</div>
              {filteredCommands.actions.map(item => {
                const idx = itemIndex++;
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className={`command-palette-item ${idx === selectedIndex ? 'selected' : ''}`}
                    onClick={() => executeItem(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <Icon size={16} />
                    <span className="command-palette-item-label">{item.label}</span>
                  </div>
                );
              })}
            </>
          )}

          {filteredCommands.navigation.length > 0 && (
            <>
              <div className="command-palette-section-title">Navigation</div>
              {filteredCommands.navigation.map(item => {
                const idx = itemIndex++;
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className={`command-palette-item ${idx === selectedIndex ? 'selected' : ''}`}
                    onClick={() => executeItem(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <Icon size={16} />
                    <span className="command-palette-item-label">{item.label}</span>
                  </div>
                );
              })}
            </>
          )}

          {allItems.length === 0 && query && (
            <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 'var(--fs-sm)' }}>
              No results for "{query}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
