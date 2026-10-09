import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency, formatNumber } from '../../utils/financial';
import {
  Plus,
  Upload,
  SearchX,
  DollarSign,
  TrendingUp,
  Wallet,
  PiggyBank,
  ArrowRight,
  Brain,
  Clock,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import Drawer from '../ui/Drawer';
import AddOpportunityModal from './AddOpportunityModal';

const PIE_COLORS = ['#6558F5', '#958AFF', '#159B72', '#E8A23A', '#D95364', '#747B91', '#A0A5B8'];

function SkeletonCard() {
  return <div className="skeleton skeleton-card" />;
}

function MetricCard({ label, value, subtitle, icon: Icon, iconColor = 'accent', tooltip }) {
  return (
    <div className="metric-card">
      <div className="metric-card-header">
        <span className="metric-card-label">{label}</span>
        <div className={`metric-card-icon ${iconColor}`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="metric-card-value animate-number">{value}</div>
      {subtitle && <div className="metric-card-subtitle">{subtitle}</div>}
    </div>
  );
}

function CustomChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-3) var(--space-4)',
      boxShadow: 'var(--shadow-lg)',
      fontSize: 'var(--fs-sm)',
    }}>
      <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 0' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
          <span style={{ color: 'var(--text-secondary)' }}>{p.name}:</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
            {formatCurrency(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

function OpportunityRow({ opp, onClick }) {
  const priorityColors = { high: 'badge-negative', medium: 'badge-warning', low: 'badge-neutral' };
  return (
    <tr onClick={onClick} style={{ cursor: 'pointer' }}>
      <td>
        <div style={{ fontWeight: 500 }}>{opp.product_name}</div>
      </td>
      <td>
        <span className={`badge badge-accent`}>{opp.loss_reason}</span>
      </td>
      <td className="num-col">{formatCurrency(opp.quoted_value)}</td>
      <td className="num-col" style={{ color: 'var(--positive)' }}>
        {formatCurrency((opp.quoted_value - opp.fulfillment_cost) * 0.35)}
      </td>
      <td>
        <span className={`badge ${priorityColors[opp.priority]}`}>{opp.priority}</span>
      </td>
      <td>
        <button className="btn btn-ghost btn-sm">
          <ArrowRight size={14} />
        </button>
      </td>
    </tr>
  );
}

export default function Dashboard() {
  const { kpis, timeSeriesData, lossReasonData, topOpportunities, insights, loading, opportunities } = useApp();
  const { addToast } = useToast();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [drawerOpp, setDrawerOpp] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [chartSeries, setChartSeries] = useState({ lost: true, estimated: true, actual: true });

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const handlePieClick = (entry) => {
    navigate(`/opportunities?reason=${encodeURIComponent(entry.name)}`);
  };

  if (loading) {
    return (
      <div className="page-enter">
        <div className="welcome-section">
          <div><div className="skeleton skeleton-heading" style={{ width: 280 }} /><div className="skeleton skeleton-text" style={{ width: 200 }} /></div>
        </div>
        <div className="grid-cols-5" style={{ marginBottom: 'var(--space-7)' }}>
          {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="dashboard-grid">
          <div className="skeleton" style={{ height: 320, borderRadius: 'var(--radius-lg)' }} />
          <div className="skeleton" style={{ height: 320, borderRadius: 'var(--radius-lg)' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div>
          <h1 className="welcome-greeting">{greeting}, here's your recovery intelligence.</h1>
          <p className="welcome-subtitle">Track lost sales, uncover patterns, and recover revenue.</p>
        </div>
        <div className="welcome-actions">
          <button className="btn btn-secondary" onClick={() => addToast('CSV import is available on the Lost Opportunities page', 'info')}>
            <Upload size={16} /> Import CSV
          </button>
          <button className="btn btn-primary" onClick={() => setAddModalOpen(true)} id="analyze-lost-sale-btn">
            <Plus size={16} /> Analyze Lost Sale
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-cols-5" style={{ marginBottom: 'var(--space-7)' }}>
        <MetricCard
          label="Lost Opportunities"
          value={formatNumber(kpis.totalOpportunities)}
          subtitle="Total recorded lost sales"
          icon={SearchX}
          iconColor="negative"
        />
        <MetricCard
          label="Lost Quoted Value"
          value={formatCurrency(kpis.lostQuotedValue, true)}
          subtitle="Total value of lost quotes"
          icon={DollarSign}
          iconColor="warning"
        />
        <MetricCard
          label="Est. Recoverable Profit"
          value={formatCurrency(kpis.estimatedRecoverableProfit, true)}
          subtitle="Estimated at 35% recovery rate"
          icon={TrendingUp}
          iconColor="accent"
        />
        <MetricCard
          label="Recovered Revenue"
          value={formatCurrency(kpis.actualRecoveredRevenue, true)}
          subtitle="Actual recovered sales"
          icon={Wallet}
          iconColor="positive"
        />
        <MetricCard
          label="Realized Profit"
          value={formatCurrency(kpis.actualRealizedProfit, true)}
          subtitle="Net profit from recoveries"
          icon={PiggyBank}
          iconColor="positive"
        />
      </div>

      {/* Charts Row */}
      <div className="dashboard-grid" style={{ marginBottom: 'var(--space-7)' }}>
        {/* Financial Overview Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Financial Overview</h3>
              <div className="card-subtitle">Lost value, estimates, and actual recoveries over time</div>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              {[
                { key: 'lost', label: 'Lost Value', color: '#D95364' },
                { key: 'estimated', label: 'Est. Recovery', color: '#6558F5' },
                { key: 'actual', label: 'Actual Recovery', color: '#159B72' },
              ].map(s => (
                <button
                  key={s.key}
                  className="btn btn-ghost btn-sm"
                  style={{
                    opacity: chartSeries[s.key] ? 1 : 0.4,
                    fontSize: 'var(--fs-xs)',
                    gap: 4,
                  }}
                  onClick={() => setChartSeries(prev => ({ ...prev, [s.key]: !prev[s.key] }))}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div className="card-body" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradLost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D95364" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#D95364" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradEst" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6558F5" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6558F5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#159B72" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#159B72" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--chart-text)', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--chart-text)', fontSize: 12 }}
                  tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
                />
                <RechartsTooltip content={<CustomChartTooltip />} />
                {chartSeries.lost && (
                  <Area type="monotone" dataKey="lostValue" name="Lost Value" stroke="#D95364" fill="url(#gradLost)" strokeWidth={2} />
                )}
                {chartSeries.estimated && (
                  <Area type="monotone" dataKey="estimatedRecovery" name="Est. Recovery" stroke="#6558F5" fill="url(#gradEst)" strokeWidth={2} strokeDasharray="5 5" />
                )}
                {chartSeries.actual && (
                  <Area type="monotone" dataKey="actualRecovery" name="Actual Recovery" stroke="#159B72" fill="url(#gradActual)" strokeWidth={2} />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Loss Reason Distribution */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Loss Reason Distribution</h3>
              <div className="card-subtitle">Click a segment to filter opportunities</div>
            </div>
          </div>
          <div className="card-body" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={lossReasonData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  onClick={handlePieClick}
                  cursor="pointer"
                  stroke="var(--bg-card)"
                  strokeWidth={2}
                >
                  {lossReasonData.map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-xs)' }}>{value}</span>
                  )}
                />
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0];
                    return (
                      <div style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--space-2) var(--space-3)',
                        boxShadow: 'var(--shadow-lg)',
                        fontSize: 'var(--fs-sm)',
                      }}>
                        <strong>{d.name}</strong>: {d.value} opportunities
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Leaderboard + Intelligence Brief */}
      <div className="dashboard-grid">
        {/* Recovery Opportunity Leaderboard */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Recovery Opportunity Leaderboard</h3>
              <div className="card-subtitle">Top 5 high-priority opportunities by potential profit</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/opportunities')}>
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div style={{ overflow: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Reason</th>
                  <th style={{ textAlign: 'right' }}>Quoted</th>
                  <th style={{ textAlign: 'right' }}>Est. Profit</th>
                  <th>Priority</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {topOpportunities.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-tertiary)' }}>No open opportunities</td></tr>
                ) : (
                  topOpportunities.map(opp => (
                    <OpportunityRow key={opp.id} opp={opp} onClick={() => setDrawerOpp(opp)} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Intelligence Brief */}
        <div className="intel-brief">
          <div className="intel-brief-header">
            <div className="intel-brief-title">
              <Sparkles size={16} /> Intelligence Brief
            </div>
            <span className="ai-label">
              <Brain size={10} /> Deterministic Analysis
            </span>
          </div>
          <div className="intel-brief-body">
            {insights.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--space-6)' }}>
                <p className="empty-state-text">Not enough data for insights yet.</p>
              </div>
            ) : (
              insights.map(insight => {
                const iconMap = { TrendingUp, DollarSign, Clock };
                const InsightIcon = iconMap[insight.icon] || TrendingUp;
                return (
                  <div className="insight-card" key={insight.id}>
                    <div className="insight-card-icon">
                      <InsightIcon size={18} />
                    </div>
                    <div className="insight-card-content">
                      <div className="insight-card-finding">
                        {insight.finding}
                        {insight.isInference && (
                          <span className="ai-label" style={{ marginLeft: 8 }}>Inference</span>
                        )}
                      </div>
                      <div className="insight-card-evidence">
                        {insight.evidence} • Based on {insight.records} record{insight.records !== 1 ? 's' : ''}.
                      </div>
                      <div className="insight-card-action" onClick={() => navigate('/opportunities')}>
                        {insight.action} <ArrowRight size={12} />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Opportunity Detail Drawer */}
      <Drawer
        open={!!drawerOpp}
        onClose={() => setDrawerOpp(null)}
        title={drawerOpp?.product_name || ''}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => { setDrawerOpp(null); navigate(`/time-machine?opp=${drawerOpp?.id}`); }}>
              <Clock size={14} /> Time Machine
            </button>
            <button className="btn btn-primary" onClick={() => { setDrawerOpp(null); navigate('/opportunities'); }}>
              View Details
            </button>
          </>
        }
      >
        {drawerOpp && (
          <div>
            <div className="form-group">
              <div className="form-label">Loss Reason</div>
              <span className="badge badge-accent">{drawerOpp.loss_reason}</span>
            </div>
            <div className="form-group">
              <div className="form-label">Quoted Value</div>
              <div style={{ fontSize: 'var(--fs-xl)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                {formatCurrency(drawerOpp.quoted_value)}
              </div>
            </div>
            <div className="form-group">
              <div className="form-label">Potential Gross Profit</div>
              <div style={{ fontSize: 'var(--fs-lg)', fontWeight: 600, color: 'var(--positive)' }}>
                {formatCurrency(drawerOpp.quoted_value - drawerOpp.fulfillment_cost)}
              </div>
            </div>
            <div className="form-group">
              <div className="form-label">Priority</div>
              <span className={`badge ${drawerOpp.priority === 'high' ? 'badge-negative' : drawerOpp.priority === 'medium' ? 'badge-warning' : 'badge-neutral'}`}>
                {drawerOpp.priority}
              </span>
            </div>
            <div className="form-group">
              <div className="form-label">Status</div>
              <span className="badge badge-accent">{drawerOpp.status.replace(/_/g, ' ')}</span>
            </div>
            <div className="form-group">
              <div className="form-label">Customer Notes</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)', lineHeight: 'var(--lh-relaxed)' }}>
                {drawerOpp.customer_notes || 'No notes recorded.'}
              </p>
            </div>
            <div className="form-group">
              <div className="form-label">Date Recorded</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)' }}>
                {new Date(drawerOpp.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        )}
      </Drawer>

      {/* Add Opportunity Modal */}
      <AddOpportunityModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </div>
  );
}
