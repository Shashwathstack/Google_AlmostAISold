import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/financial';
import {
  Search,
  Filter,
  Plus,
  Upload,
  Download,
  ArrowUpDown,
  Clock,
  Edit3,
  Trash2,
  Brain,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import Drawer from '../ui/Drawer';
import AddOpportunityModal from './AddOpportunityModal';
import ConfirmDialog from '../ui/ConfirmDialog';
import ImportCsv from '../ui/ImportCsv';

const PAGE_SIZE = 10;

export default function LostOpportunities() {
  const { opportunities, updateOpportunity, deleteOpportunity, loading, currentBusiness } = useApp();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters
  const [search, setSearch] = useState('');
  const [reasonFilter, setReasonFilter] = useState(searchParams.get('reason') || '');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editingOpp, setEditingOpp] = useState(null);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Open drawer from URL params
  useEffect(() => {
    const selectedId = searchParams.get('selected');
    if (selectedId) {
      const opp = opportunities.find(o => o.id === selectedId);
      if (opp) setSelectedOpp(opp);
    }
  }, [searchParams, opportunities]);

  // Apply reason filter from URL
  useEffect(() => {
    const reason = searchParams.get('reason');
    if (reason) setReasonFilter(reason);
  }, [searchParams]);

  // Filter + sort
  const filtered = useMemo(() => {
    let data = [...opportunities];

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      data = data.filter(o =>
        o.product_name.toLowerCase().includes(q) ||
        o.loss_reason.toLowerCase().includes(q) ||
        (o.customer_notes && o.customer_notes.toLowerCase().includes(q))
      );
    }

    if (reasonFilter) data = data.filter(o => o.loss_reason === reasonFilter);
    if (statusFilter) data = data.filter(o => o.status === statusFilter);
    if (priorityFilter) data = data.filter(o => o.priority === priorityFilter);

    // Sort
    data.sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case 'date': cmp = new Date(a.created_at) - new Date(b.created_at); break;
        case 'value': cmp = a.quoted_value - b.quoted_value; break;
        case 'product': cmp = a.product_name.localeCompare(b.product_name); break;
        case 'priority': {
          const order = { high: 3, medium: 2, low: 1 };
          cmp = (order[a.priority] || 0) - (order[b.priority] || 0);
          break;
        }
        default: cmp = 0;
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return data;
  }, [opportunities, debouncedSearch, reasonFilter, statusFilter, priorityFilter, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const clearFilters = () => {
    setSearch('');
    setReasonFilter('');
    setStatusFilter('');
    setPriorityFilter('');
    setSearchParams({});
    setPage(1);
  };

  const hasFilters = search || reasonFilter || statusFilter || priorityFilter;
  const priorityColors = { high: 'badge-negative', medium: 'badge-warning', low: 'badge-neutral' };
  const statusLabels = { open: 'Open', analyzing: 'Analyzing', strategy_selected: 'Strategy Selected', recovery_attempted: 'Attempted', recovered: 'Recovered', closed: 'Closed' };

  const handleExportCSV = () => {
    const headers = ['Product', 'Loss Reason', 'Quoted Value', 'Priority', 'Status', 'Date', 'Customer Notes'];
    const rows = filtered.map(o => [
      o.product_name, o.loss_reason, o.quoted_value, o.priority, o.status,
      new Date(o.created_at).toLocaleDateString(), o.customer_notes || '',
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lost-opportunities.csv';
    a.click();
    URL.revokeObjectURL(url);
    addToast('CSV exported successfully', 'success');
  };

  const handleStatusUpdate = (oppId, newStatus) => {
    updateOpportunity(oppId, { status: newStatus });
    addToast('Status updated', 'success');
    if (selectedOpp?.id === oppId) {
      setSelectedOpp(prev => ({ ...prev, status: newStatus }));
    }
  };

  if (loading) {
    return (
      <div className="page-enter">
        <div className="section-header"><div className="skeleton skeleton-heading" /></div>
        <div className="skeleton" style={{ height: 48, borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)' }} />
        <div className="skeleton" style={{ height: 400, borderRadius: 'var(--radius-lg)' }} />
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div className="section-header">
        <div>
          <h1 className="section-title">Lost Opportunities</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)', marginTop: 'var(--space-1)' }}>
            {filtered.length} opportunit{filtered.length === 1 ? 'y' : 'ies'} found
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
            <Download size={14} /> Export
          </button>
          <ImportCsv businessId={currentBusiness?.id || 'demo-biz-1'} />
          <button className="btn btn-primary btn-sm" onClick={() => setAddModalOpen(true)} id="add-opportunity-btn">
            <Plus size={14} /> Add Opportunity
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{
        display: 'flex',
        gap: 'var(--space-3)',
        marginBottom: 'var(--space-5)',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 300 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            className="form-input"
            style={{ paddingLeft: 32 }}
            placeholder="Search opportunities..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <select className="form-select" style={{ width: 'auto', minWidth: 130 }} value={reasonFilter} onChange={e => { setReasonFilter(e.target.value); setPage(1); }}>
          <option value="">All Reasons</option>
          {['Price', 'Availability', 'Delivery', 'Confusion', 'Competitor', 'Timing', 'Other'].map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <select className="form-select" style={{ width: 'auto', minWidth: 130 }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          {Object.entries(statusLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        <select className="form-select" style={{ width: 'auto', minWidth: 110 }} value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value); setPage(1); }}>
          <option value="">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select className="form-select" style={{ width: 'auto', minWidth: 130 }} value={`${sortBy}-${sortDir}`} onChange={e => { const [field, dir] = e.target.value.split('-'); setSortBy(field); setSortDir(dir); }}>
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="value-desc">Highest Value</option>
          <option value="value-asc">Lowest Value</option>
          <option value="priority-desc">Highest Priority</option>
          <option value="product-asc">Product A-Z</option>
        </select>

        {hasFilters && (
          <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Product / Service</th>
              <th>Loss Reason</th>
              <th style={{ textAlign: 'right' }}>Quoted Value</th>
              <th style={{ textAlign: 'right' }}>Potential Profit</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="empty-state">
                    <div className="empty-state-title">{hasFilters ? 'No matching opportunities' : 'No opportunities yet'}</div>
                    <div className="empty-state-text">
                      {hasFilters ? 'Try adjusting your filters.' : 'Add your first lost opportunity to get started.'}
                    </div>
                    {!hasFilters && (
                      <button className="btn btn-primary" onClick={() => setAddModalOpen(true)}>
                        <Plus size={14} /> Add Opportunity
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paged.map(opp => (
                <tr key={opp.id} onClick={() => setSelectedOpp(opp)}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{opp.product_name}</div>
                  </td>
                  <td>
                    <span className="badge badge-accent">{opp.loss_reason}</span>
                  </td>
                  <td className="num-col">{formatCurrency(opp.quoted_value)}</td>
                  <td className="num-col" style={{ color: 'var(--positive)' }}>
                    {formatCurrency(opp.quoted_value - opp.fulfillment_cost)}
                  </td>
                  <td><span className={`badge ${priorityColors[opp.priority]}`}>{opp.priority}</span></td>
                  <td><span className="badge badge-neutral">{statusLabels[opp.status] || opp.status}</span></td>
                  <td style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)' }}>
                    {new Date(opp.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                      <button className="btn btn-ghost btn-icon btn-sm" title="Time Machine" onClick={() => navigate(`/time-machine?opp=${opp.id}`)}>
                        <Clock size={14} />
                      </button>
                      <button className="btn btn-ghost btn-icon btn-sm" title="Delete" onClick={() => setDeleteConfirm(opp.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-3)',
          marginTop: 'var(--space-5)',
        }}>
          <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft size={14} /> Previous
          </button>
          <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)' }}>
            Page {page} of {totalPages}
          </span>
          <button className="btn btn-ghost btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Detail Drawer */}
      <Drawer
        open={!!selectedOpp}
        onClose={() => { setSelectedOpp(null); setEditingOpp(null); }}
        title={selectedOpp?.product_name || ''}
        footer={
          selectedOpp && (
            <>
              <button className="btn btn-secondary" onClick={() => navigate(`/time-machine?opp=${selectedOpp.id}`)}>
                <Clock size={14} /> Time Machine
              </button>
              <button className="btn btn-primary" onClick={() => {
                handleStatusUpdate(selectedOpp.id, 'strategy_selected');
                navigate(`/time-machine?opp=${selectedOpp.id}`);
              }}>
                <Brain size={14} /> Analyze
              </button>
            </>
          )
        }
      >
        {selectedOpp && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
              <div>
                <div className="form-label">Quoted Value</div>
                <div style={{ fontSize: 'var(--fs-xl)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                  {formatCurrency(selectedOpp.quoted_value)}
                </div>
              </div>
              <div>
                <div className="form-label">Potential Profit</div>
                <div style={{ fontSize: 'var(--fs-xl)', fontWeight: 700, color: 'var(--positive)' }}>
                  {formatCurrency(selectedOpp.quoted_value - selectedOpp.fulfillment_cost)}
                </div>
              </div>
            </div>

            <div className="form-group">
              <div className="form-label">Loss Reason</div>
              <span className="badge badge-accent">{selectedOpp.loss_reason}</span>
            </div>

            <div className="form-group">
              <div className="form-label">Priority</div>
              <span className={`badge ${priorityColors[selectedOpp.priority]}`}>{selectedOpp.priority}</span>
            </div>

            <div className="form-group">
              <div className="form-label">Status</div>
              <select
                className="form-select"
                value={selectedOpp.status}
                onChange={e => handleStatusUpdate(selectedOpp.id, e.target.value)}
                style={{ width: 'auto' }}
              >
                {Object.entries(statusLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <div className="form-label">Customer Notes</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)', lineHeight: 'var(--lh-relaxed)', background: 'var(--bg-elevated)', padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)' }}>
                {selectedOpp.customer_notes || 'No notes recorded.'}
              </p>
            </div>

            <div className="form-group">
              <div className="form-label">Fulfillment Cost</div>
              <p style={{ fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(selectedOpp.fulfillment_cost)}</p>
            </div>

            <div className="form-group">
              <div className="form-label">Date Recorded</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)' }}>
                {new Date(selectedOpp.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            {selectedOpp.recovered_revenue > 0 && (
              <div style={{ padding: 'var(--space-4)', background: 'var(--positive-subtle)', borderRadius: 'var(--radius-md)', marginTop: 'var(--space-4)' }}>
                <div className="form-label" style={{ color: 'var(--positive)' }}>Recovery Outcome</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                  <div>
                    <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>Recovered Revenue</div>
                    <div style={{ fontWeight: 600, color: 'var(--positive)' }}>{formatCurrency(selectedOpp.recovered_revenue)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>Realized Profit</div>
                    <div style={{ fontWeight: 600, color: 'var(--positive)' }}>
                      {formatCurrency(selectedOpp.recovered_revenue - selectedOpp.actual_cost - selectedOpp.recovery_expense)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>

      <AddOpportunityModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />

      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => { deleteOpportunity(deleteConfirm); addToast('Opportunity deleted', 'success'); }}
        title="Delete Opportunity"
        message="Are you sure you want to delete this opportunity? This action cannot be undone."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
