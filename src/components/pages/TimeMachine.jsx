import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import {
  formatCurrency,
  formatPercent,
  STRATEGIES,
  calculateScenario,
  generateStrategyExplanation,
  grossProfit,
  grossMargin,
} from '../../utils/financial';
import {
  Percent,
  Package,
  RefreshCw,
  CreditCard,
  MessageCircle,
  XCircle,
  Save,
  Send,
  FileText,
  Ban,
  Brain,
  ArrowRight,
  ChevronDown,
  Copy,
  Check,
  Lightbulb,
  AlertTriangle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Cell,
} from 'recharts';

const STRATEGY_ICONS = { Percent, Package, RefreshCw, CreditCard, MessageCircle, XCircle };

export default function TimeMachine() {
  const { opportunities, saveScenario, getScenarios, updateOpportunity, addRecoveryAttempt } = useApp();
  const { addToast } = useToast();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Selected opportunity
  const oppId = searchParams.get('opp');
  const [selectedOppId, setSelectedOppId] = useState(oppId || '');
  const opp = opportunities.find(o => o.id === selectedOppId);

  useEffect(() => {
    if (oppId) setSelectedOppId(oppId);
  }, [oppId]);

  // Strategy state
  const [activeStrategy, setActiveStrategy] = useState('discount');
  const [discountPercent, setDiscountPercent] = useState(10);
  const [priceReduction, setPriceReduction] = useState(25);
  const [newPrice, setNewPrice] = useState('');
  const [newCost, setNewCost] = useState('');
  const [recoveryExpense, setRecoveryExpense] = useState(15);
  const [conversionProb, setConversionProb] = useState(30);

  // Saved scenarios for comparison
  const savedScenarios = opp ? getScenarios(opp.id) : [];
  const [showComparison, setShowComparison] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  // Calculate scenario
  const scenario = useMemo(() => {
    if (!opp) return null;
    return calculateScenario({
      originalPrice: opp.original_price,
      fulfillmentCost: opp.fulfillment_cost,
      strategy: activeStrategy,
      discountPercent,
      priceReduction,
      newPrice: parseFloat(newPrice) || opp.original_price,
      newCost: parseFloat(newCost) || opp.fulfillment_cost,
      recoveryExpense,
      conversionProbability: conversionProb / 100,
    });
  }, [opp, activeStrategy, discountPercent, priceReduction, newPrice, newCost, recoveryExpense, conversionProb]);

  const explanation = useMemo(() => {
    if (!opp || !scenario) return null;
    return generateStrategyExplanation(opp, activeStrategy, scenario);
  }, [opp, activeStrategy, scenario]);

  // Baseline (original)
  const baseline = opp ? {
    grossProfit: grossProfit(opp.original_price, opp.fulfillment_cost),
    grossMargin: grossMargin(opp.original_price, opp.fulfillment_cost),
  } : null;

  // Waterfall chart data
  const waterfallData = scenario ? [
    { name: 'Selling Price', value: scenario.sellingPrice, fill: 'var(--accent)' },
    { name: 'Fulfillment Cost', value: -scenario.fulfillmentCost, fill: 'var(--negative)' },
    { name: 'Recovery Expense', value: -scenario.recoveryExpense, fill: 'var(--warning)' },
    { name: 'Expected Profit', value: scenario.expectedProfit, fill: 'var(--positive)' },
  ] : [];

  const handleSaveScenario = () => {
    if (!opp || !scenario) return;
    saveScenario(opp.id, {
      strategy: activeStrategy,
      ...scenario,
    });
    addToast('Scenario saved successfully', 'success');
  };

  const handleRecordAttempt = () => {
    if (!opp) return;
    updateOpportunity(opp.id, {
      status: 'recovery_attempted',
      selected_strategy: STRATEGIES.find(s => s.id === activeStrategy)?.name,
    });
    addRecoveryAttempt({
      opportunity_id: opp.id,
      strategy: activeStrategy,
      scenario,
    });
    addToast('Recovery attempt recorded', 'success');
  };

  const handleMarkNotPursuing = () => {
    if (!opp) return;
    updateOpportunity(opp.id, { status: 'closed', selected_strategy: 'Do Not Pursue' });
    addToast('Opportunity marked as not worth pursuing', 'info');
    navigate('/opportunities');
  };

  const handleCopyMessage = () => {
    const strategyName = STRATEGIES.find(s => s.id === activeStrategy)?.name || activeStrategy;
    const message = `Hi there,\n\nI noticed you were recently interested in our ${opp.product_name}. I wanted to reach out because we have a special offer that might interest you.\n\nStrategy: ${strategyName}\n${scenario.sellingPrice !== opp.original_price ? `Special price: ${formatCurrency(scenario.sellingPrice)} (was ${formatCurrency(opp.original_price)})` : `Price: ${formatCurrency(scenario.sellingPrice)}`}\n\nWe'd love the opportunity to help you. Let me know if you'd like to discuss.\n\nBest regards`;

    navigator.clipboard.writeText(message).then(() => {
      setCopiedMessage(true);
      addToast('Recovery message copied to clipboard', 'success');
      setTimeout(() => setCopiedMessage(false), 2000);
    }).catch(() => {
      addToast('Failed to copy to clipboard', 'error');
    });
  };

  // Select opportunity if none
  if (!opp) {
    return (
      <div className="page-enter">
        <div className="section-header">
          <h1 className="section-title">Lost Sale Time Machine</h1>
        </div>
        <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
          <div className="card-body">
            <div className="empty-state">
              <div className="empty-state-title">Select an Opportunity</div>
              <div className="empty-state-text">
                Choose a lost opportunity to simulate recovery strategies and calculate potential outcomes.
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Select Opportunity</label>
              <select
                className="form-select"
                value={selectedOppId}
                onChange={e => setSelectedOppId(e.target.value)}
              >
                <option value="">Choose an opportunity...</option>
                {opportunities
                  .filter(o => ['open', 'analyzing', 'strategy_selected'].includes(o.status))
                  .map(o => (
                    <option key={o.id} value={o.id}>
                      {o.product_name} — {formatCurrency(o.quoted_value)} — {o.loss_reason}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div className="section-header">
        <div>
          <h1 className="section-title">Lost Sale Time Machine</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)', marginTop: 'var(--space-1)' }}>
            Simulate recovery strategies for <strong>{opp.product_name}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <select
            className="form-select"
            value={selectedOppId}
            onChange={e => setSelectedOppId(e.target.value)}
            style={{ width: 'auto', maxWidth: 250 }}
          >
            {opportunities
              .filter(o => ['open', 'analyzing', 'strategy_selected', 'recovery_attempted'].includes(o.status))
              .map(o => (
                <option key={o.id} value={o.id}>
                  {o.product_name} — {formatCurrency(o.quoted_value)}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Three-column layout */}
      <div className="tm-layout">
        {/* Left: Original Opportunity */}
        <div className="tm-panel">
          <div className="tm-panel-header">Original Opportunity</div>
          <div className="tm-panel-body">
            <div className="tm-field">
              <span className="tm-field-label">Product</span>
              <span className="tm-field-value" style={{ fontSize: 'var(--fs-sm)' }}>{opp.product_name}</span>
            </div>
            <div className="tm-field">
              <span className="tm-field-label">Original Price</span>
              <span className="tm-field-value">{formatCurrency(opp.original_price)}</span>
            </div>
            <div className="tm-field">
              <span className="tm-field-label">Fulfillment Cost</span>
              <span className="tm-field-value">{formatCurrency(opp.fulfillment_cost)}</span>
            </div>
            <div className="tm-field">
              <span className="tm-field-label">Gross Profit</span>
              <span className="tm-field-value positive">{formatCurrency(baseline.grossProfit)}</span>
            </div>
            <div className="tm-field">
              <span className="tm-field-label">Gross Margin</span>
              <span className="tm-field-value">{formatPercent(baseline.grossMargin)}</span>
            </div>
            <div className="tm-field">
              <span className="tm-field-label">Loss Reason</span>
              <span className="badge badge-accent">{opp.loss_reason}</span>
            </div>
            <div className="tm-field">
              <span className="tm-field-label">Status</span>
              <span className="badge badge-neutral">{opp.status.replace(/_/g, ' ')}</span>
            </div>

            {opp.customer_notes && (
              <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-1)' }}>Customer Notes</div>
                <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--lh-relaxed)' }}>
                  {opp.customer_notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Center: Recovery Strategy Builder */}
        <div>
          <div className="tm-panel" style={{ marginBottom: 'var(--space-5)' }}>
            <div className="tm-panel-header">Recovery Strategy Builder</div>
            <div className="tm-panel-body">
              {/* Strategy selection cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
                {STRATEGIES.map(strategy => {
                  const Icon = STRATEGY_ICONS[strategy.icon] || MessageCircle;
                  return (
                    <div
                      key={strategy.id}
                      className={`strategy-card ${activeStrategy === strategy.id ? 'selected' : ''}`}
                      onClick={() => setActiveStrategy(strategy.id)}
                    >
                      <div className="strategy-card-icon">
                        <Icon size={18} />
                      </div>
                      <div className="strategy-card-name">{strategy.name}</div>
                      <div className="strategy-card-desc">{strategy.description}</div>
                    </div>
                  );
                })}
              </div>

              {/* Strategy-specific inputs */}
              {activeStrategy === 'discount' && (
                <div className="form-group">
                  <label className="form-label">Discount: {discountPercent}%</label>
                  <input
                    type="range"
                    className="range-slider"
                    min="1"
                    max="50"
                    value={discountPercent}
                    onChange={e => setDiscountPercent(parseInt(e.target.value))}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-1)' }}>
                    <span>1%</span><span>50%</span>
                  </div>
                </div>
              )}

              {activeStrategy === 'smaller_package' && (
                <div className="form-group">
                  <label className="form-label">Price Reduction: {priceReduction}%</label>
                  <input
                    type="range"
                    className="range-slider"
                    min="5"
                    max="60"
                    value={priceReduction}
                    onChange={e => setPriceReduction(parseInt(e.target.value))}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-1)' }}>
                    <span>5%</span><span>60%</span>
                  </div>
                </div>
              )}

              {activeStrategy === 'alternative_product' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                  <div className="form-group">
                    <label className="form-label">New Price</label>
                    <input
                      className="form-input"
                      type="number"
                      step="0.01"
                      value={newPrice}
                      onChange={e => setNewPrice(e.target.value)}
                      placeholder={opp.original_price.toString()}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">New Cost</label>
                    <input
                      className="form-input"
                      type="number"
                      step="0.01"
                      value={newCost}
                      onChange={e => setNewCost(e.target.value)}
                      placeholder={opp.fulfillment_cost.toString()}
                    />
                  </div>
                </div>
              )}

              {/* Common controls */}
              {activeStrategy !== 'do_not_pursue' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Recovery Expense: {formatCurrency(recoveryExpense)}</label>
                    <input
                      type="range"
                      className="range-slider"
                      min="0"
                      max="200"
                      value={recoveryExpense}
                      onChange={e => setRecoveryExpense(parseInt(e.target.value))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Assumed Conversion Probability: {conversionProb}%
                      <span className="ai-label" style={{ marginLeft: 8 }}>Estimate</span>
                    </label>
                    <input
                      type="range"
                      className="range-slider"
                      min="5"
                      max="90"
                      value={conversionProb}
                      onChange={e => setConversionProb(parseInt(e.target.value))}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-1)' }}>
                      <span>5% (unlikely)</span><span>90% (very likely)</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Financial Waterfall */}
          {scenario && activeStrategy !== 'do_not_pursue' && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Financial Breakdown</h3>
              </div>
              <div className="card-body" style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={waterfallData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: 'var(--chart-text)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'var(--chart-text)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div style={{
                            background: 'var(--bg-card)', border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)', padding: 'var(--space-2) var(--space-3)',
                            boxShadow: 'var(--shadow-lg)', fontSize: 'var(--fs-sm)',
                          }}>
                            <strong>{payload[0].payload.name}</strong>: {formatCurrency(Math.abs(payload[0].value))}
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {waterfallData.map((entry, index) => (
                        <Cell key={index} fill={entry.value >= 0 ? (index === 3 ? '#159B72' : '#6558F5') : '#D95364'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Right: Financial Impact */}
        <div>
          <div className="tm-panel" style={{ marginBottom: 'var(--space-5)' }}>
            <div className="tm-panel-header">Financial Impact</div>
            <div className="tm-panel-body">
              {scenario && activeStrategy !== 'do_not_pursue' ? (
                <>
                  <div className="tm-field">
                    <span className="tm-field-label">Selling Price</span>
                    <span className="tm-field-value">{formatCurrency(scenario.sellingPrice)}</span>
                  </div>
                  <div className="tm-field">
                    <span className="tm-field-label">Fulfillment Cost</span>
                    <span className="tm-field-value">{formatCurrency(scenario.fulfillmentCost)}</span>
                  </div>
                  <div className="tm-field">
                    <span className="tm-field-label">Gross Profit</span>
                    <span className={`tm-field-value ${scenario.grossProfit >= 0 ? 'positive' : 'negative'}`}>
                      {formatCurrency(scenario.grossProfit)}
                    </span>
                  </div>
                  <div className="tm-field">
                    <span className="tm-field-label">Gross Margin</span>
                    <span className="tm-field-value">{formatPercent(scenario.grossMargin)}</span>
                  </div>
                  <div style={{ height: 1, background: 'var(--border)', margin: 'var(--space-3) 0' }} />
                  <div className="tm-field">
                    <span className="tm-field-label">Recovery Expense</span>
                    <span className="tm-field-value negative">-{formatCurrency(scenario.recoveryExpense)}</span>
                  </div>
                  <div className="tm-field">
                    <span className="tm-field-label">Conversion Prob.</span>
                    <span className="tm-field-value accent">
                      {formatPercent(scenario.conversionProbability * 100)}
                      <span className="ai-label" style={{ marginLeft: 4, fontSize: 'var(--fs-xs)' }}>Est.</span>
                    </span>
                  </div>
                  <div style={{ height: 1, background: 'var(--border)', margin: 'var(--space-3) 0' }} />
                  <div className="tm-field" style={{ padding: 'var(--space-3) 0' }}>
                    <span className="tm-field-label" style={{ fontWeight: 600 }}>Expected Revenue</span>
                    <span className="tm-field-value accent" style={{ fontSize: 'var(--fs-lg)' }}>
                      {formatCurrency(scenario.expectedRevenue)}
                    </span>
                  </div>
                  <div className="tm-field" style={{ padding: 'var(--space-3) 0' }}>
                    <span className="tm-field-label" style={{ fontWeight: 600 }}>Expected Profit</span>
                    <span className={`tm-field-value ${scenario.expectedProfit >= 0 ? 'positive' : 'negative'}`} style={{ fontSize: 'var(--fs-lg)' }}>
                      {formatCurrency(scenario.expectedProfit)}
                    </span>
                  </div>
                  <div style={{ marginTop: 'var(--space-2)', padding: 'var(--space-2) var(--space-3)', background: 'var(--accent-subtle)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>
                    vs. original: {scenario.grossProfit >= baseline.grossProfit
                      ? <span style={{ color: 'var(--positive)' }}>No margin loss</span>
                      : <span style={{ color: 'var(--negative)' }}>-{formatCurrency(baseline.grossProfit - scenario.grossProfit)} margin reduction</span>
                    }
                  </div>
                </>
              ) : (
                <div className="empty-state" style={{ padding: 'var(--space-4)' }}>
                  <p className="empty-state-text">This opportunity will not be pursued.</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Explanation */}
          {explanation && activeStrategy !== 'do_not_pursue' && (
            <div className="intel-brief">
              <div className="intel-brief-header">
                <div className="intel-brief-title">
                  <Lightbulb size={14} /> Why this strategy?
                </div>
                <span className="ai-label"><Brain size={10} /> Rule-Based</span>
              </div>
              <div className="intel-brief-body" style={{ fontSize: 'var(--fs-sm)' }}>
                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <div style={{ fontWeight: 600, marginBottom: 'var(--space-1)', fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>CUSTOMER OBJECTION</div>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 'var(--lh-relaxed)' }}>{explanation.objection}</p>
                </div>
                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <div style={{ fontWeight: 600, marginBottom: 'var(--space-1)', fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>EVIDENCE</div>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 'var(--lh-relaxed)' }}>{explanation.evidence}</p>
                </div>
                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <div style={{ fontWeight: 600, marginBottom: 'var(--space-1)', fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>RATIONALE</div>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 'var(--lh-relaxed)' }}>{explanation.rationale}</p>
                </div>
                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <div style={{ fontWeight: 600, marginBottom: 'var(--space-1)', fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>FINANCIAL TRADE-OFF</div>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 'var(--lh-relaxed)' }}>{explanation.tradeoff}</p>
                </div>
                <div style={{
                  padding: 'var(--space-2) var(--space-3)',
                  background: 'var(--warning-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--space-2)',
                }}>
                  <AlertTriangle size={14} style={{ color: 'var(--warning)', minWidth: 14, marginTop: 2 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--fs-xs)', color: 'var(--warning)' }}>UNCERTAINTY</div>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 'var(--lh-relaxed)' }}>{explanation.uncertainty}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
            <button className="btn btn-primary" onClick={handleSaveScenario} style={{ width: '100%' }}>
              <Save size={14} /> Save Scenario
            </button>
            <button className="btn btn-secondary" onClick={handleCopyMessage} style={{ width: '100%' }}>
              {copiedMessage ? <Check size={14} /> : <Copy size={14} />}
              {copiedMessage ? 'Copied!' : 'Generate Recovery Message'}
            </button>
            <button className="btn btn-secondary" onClick={handleRecordAttempt} style={{ width: '100%' }}>
              <Send size={14} /> Record Recovery Attempt
            </button>
            <button className="btn btn-ghost" onClick={handleMarkNotPursuing} style={{ width: '100%', color: 'var(--text-tertiary)' }}>
              <Ban size={14} /> Mark as Not Worth Pursuing
            </button>
          </div>
        </div>
      </div>

      {/* Scenario Comparison */}
      {savedScenarios.length > 0 && (
        <div className="card" style={{ marginTop: 'var(--space-7)' }}>
          <div className="card-header">
            <h3 className="card-title">Saved Scenarios Comparison</h3>
            <span className="badge badge-neutral">{savedScenarios.length} saved</span>
          </div>
          <div style={{ overflow: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Strategy</th>
                  <th style={{ textAlign: 'right' }}>Selling Price</th>
                  <th style={{ textAlign: 'right' }}>Cost</th>
                  <th style={{ textAlign: 'right' }}>Gross Profit</th>
                  <th style={{ textAlign: 'right' }}>Margin</th>
                  <th style={{ textAlign: 'right' }}>Conv. Prob.</th>
                  <th style={{ textAlign: 'right' }}>Expected Profit</th>
                </tr>
              </thead>
              <tbody>
                {savedScenarios.map((scn, i) => {
                  const isBest = savedScenarios.every(s => s.expectedProfit <= scn.expectedProfit);
                  return (
                    <tr key={scn.id || i} style={isBest ? { background: 'var(--positive-subtle)' } : {}}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          {scn.strategy}
                          {isBest && <span className="badge badge-positive">Best</span>}
                        </div>
                      </td>
                      <td className="num-col">{formatCurrency(scn.sellingPrice)}</td>
                      <td className="num-col">{formatCurrency(scn.fulfillmentCost)}</td>
                      <td className="num-col">{formatCurrency(scn.grossProfit)}</td>
                      <td className="num-col">{formatPercent(scn.grossMargin)}</td>
                      <td className="num-col">{formatPercent(scn.conversionProbability * 100)}</td>
                      <td className="num-col" style={{ fontWeight: 600, color: scn.expectedProfit >= 0 ? 'var(--positive)' : 'var(--negative)' }}>
                        {formatCurrency(scn.expectedProfit)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
