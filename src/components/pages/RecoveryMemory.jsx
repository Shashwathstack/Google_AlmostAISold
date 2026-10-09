import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatPercent, formatNumber } from '../../utils/financial';
import { Target, CheckCircle, TrendingUp, DollarSign } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';

export default function RecoveryMemory() {
  const { opportunities, kpis, loading } = useApp();

  const stats = useMemo(() => {
    const attempts = opportunities.filter(o => ['recovery_attempted', 'recovered', 'closed'].includes(o.status));
    const recovered = opportunities.filter(o => o.status === 'recovered');
    
    // Group by strategy
    const strategyStats = {};
    attempts.forEach(opp => {
      const strat = opp.selected_strategy || 'Unknown';
      if (!strategyStats[strat]) {
        strategyStats[strat] = { name: strat, attempts: 0, successes: 0, profit: 0 };
      }
      strategyStats[strat].attempts += 1;
      if (opp.status === 'recovered') {
        strategyStats[strat].successes += 1;
        strategyStats[strat].profit += (opp.recovered_revenue - opp.actual_cost - opp.recovery_expense);
      }
    });

    return {
      totalAttempts: attempts.length,
      successes: recovered.length,
      successRate: attempts.length ? (recovered.length / attempts.length) * 100 : 0,
      strategyStats: Object.values(strategyStats).sort((a, b) => b.profit - a.profit)
    };
  }, [opportunities]);

  if (loading) {
    return (
      <div className="page-enter">
        <div className="section-header"><div className="skeleton skeleton-heading" /></div>
        <div className="grid-cols-4" style={{ marginBottom: 'var(--space-7)' }}><div className="skeleton skeleton-card" /><div className="skeleton skeleton-card" /><div className="skeleton skeleton-card" /><div className="skeleton skeleton-card" /></div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div className="section-header">
        <div>
          <h1 className="section-title">Recovery Memory</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)', marginTop: 'var(--space-1)' }}>
            Analyze recovery performance and compare estimates to reality.
          </p>
        </div>
      </div>

      <div className="grid-cols-4" style={{ marginBottom: 'var(--space-7)' }}>
        <div className="metric-card">
          <div className="metric-card-header">
            <span className="metric-card-label">Total Attempts</span>
            <div className="metric-card-icon bg-elevated"><Target size={18} /></div>
          </div>
          <div className="metric-card-value">{formatNumber(stats.totalAttempts)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-card-header">
            <span className="metric-card-label">Successful Recoveries</span>
            <div className="metric-card-icon positive"><CheckCircle size={18} /></div>
          </div>
          <div className="metric-card-value">{formatNumber(stats.successes)}</div>
          <div className="metric-card-subtitle">{formatPercent(stats.successRate)} win rate</div>
        </div>
        <div className="metric-card">
          <div className="metric-card-header">
            <span className="metric-card-label">Actual Revenue</span>
            <div className="metric-card-icon positive"><TrendingUp size={18} /></div>
          </div>
          <div className="metric-card-value">{formatCurrency(kpis.actualRecoveredRevenue, true)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-card-header">
            <span className="metric-card-label">Realized Profit</span>
            <div className="metric-card-icon accent"><DollarSign size={18} /></div>
          </div>
          <div className="metric-card-value">{formatCurrency(kpis.actualRealizedProfit, true)}</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Strategy Performance</h3>
          </div>
          <div className="card-body" style={{ height: 350 }}>
            {stats.strategyStats.length === 0 ? (
               <div className="empty-state">
                 <p className="empty-state-text">No data to display. Record some recovery outcomes first.</p>
               </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.strategyStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <RechartsTooltip 
                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="attempts" name="Total Attempts" fill="var(--bg-hover)" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="left" dataKey="successes" name="Successes" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="profit" name="Profit Generated" fill="var(--positive)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Strategy Details</h3>
          </div>
          <div style={{ overflow: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Strategy</th>
                  <th style={{ textAlign: 'right' }}>Attempts</th>
                  <th style={{ textAlign: 'right' }}>Successes</th>
                  <th style={{ textAlign: 'right' }}>Win Rate</th>
                  <th style={{ textAlign: 'right' }}>Profit</th>
                  <th style={{ textAlign: 'right' }}>Avg. Profit</th>
                </tr>
              </thead>
              <tbody>
                {stats.strategyStats.map(s => (
                  <tr key={s.name}>
                    <td style={{ fontWeight: 500 }}>{s.name}</td>
                    <td className="num-col">{s.attempts}</td>
                    <td className="num-col" style={{ color: 'var(--positive)' }}>{s.successes}</td>
                    <td className="num-col">{formatPercent((s.successes / s.attempts) * 100)}</td>
                    <td className="num-col">{formatCurrency(s.profit)}</td>
                    <td className="num-col">{formatCurrency(s.successes ? s.profit / s.successes : 0)}</td>
                  </tr>
                ))}
                {stats.strategyStats.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-tertiary)' }}>
                      No recovery data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
