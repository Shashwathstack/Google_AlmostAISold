import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/financial';
import { 
  Clock, 
  Check, 
  MessageCircle, 
  Copy, 
  AlertCircle, 
  CheckCircle,
  Play
} from 'lucide-react';
import Drawer from '../ui/Drawer';
import ConfirmDialog from '../ui/ConfirmDialog';

const COLUMNS = [
  { id: 'analyzing', title: 'Ready to Review' },
  { id: 'strategy_selected', title: 'Strategy Selected' },
  { id: 'recovery_attempted', title: 'Recovery Attempted' },
  { id: 'recovered', title: 'Recovered' },
  { id: 'closed', title: 'Closed / Not Pursuing' }
];

export default function RecoveryCenter() {
  const { opportunities, updateOpportunity, recordOutcome } = useApp();
  const { addToast } = useToast();
  
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [messageDraft, setMessageDraft] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Outcome form state
  const [outcomeForm, setOutcomeForm] = useState({
    recovered: true,
    recoveredRevenue: '',
    actualCost: '',
    recoveryExpense: ''
  });

  const columnsData = useMemo(() => {
    const data = {};
    COLUMNS.forEach(c => data[c.id] = []);
    
    opportunities.forEach(opp => {
      if (data[opp.status]) {
        data[opp.status].push(opp);
      } else if (opp.status === 'open') {
        data['analyzing'].push(opp); // Map open to ready to review for this board
      }
    });
    
    return data;
  }, [opportunities]);

  const handleCardClick = (opp) => {
    setSelectedOpp(opp);
    const strategyName = opp.selected_strategy || 'a special offer';
    setMessageDraft(
      `Hi there,\n\nI noticed you were recently interested in our ${opp.product_name}. ` +
      `I wanted to reach out because we have ${strategyName} that might interest you.\n\n` +
      `We'd love the opportunity to help you. Let me know if you'd like to discuss.\n\nBest regards`
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(messageDraft).then(() => {
      setCopied(true);
      addToast('Draft copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleMarkAttempted = () => {
    if (selectedOpp) {
      updateOpportunity(selectedOpp.id, { status: 'recovery_attempted' });
      addToast('Marked as recovery attempted', 'success');
      setSelectedOpp(null);
    }
  };

  const handleRecordOutcome = (e) => {
    e.preventDefault();
    if (selectedOpp) {
      recordOutcome(selectedOpp.id, {
        recovered: outcomeForm.recovered,
        recoveredRevenue: parseFloat(outcomeForm.recoveredRevenue) || 0,
        actualCost: parseFloat(outcomeForm.actualCost) || 0,
        recoveryExpense: parseFloat(outcomeForm.recoveryExpense) || 0
      });
      addToast(`Outcome recorded: ${outcomeForm.recovered ? 'Recovered' : 'Closed'}`, 'success');
      setSelectedOpp(null);
      // Reset form
      setOutcomeForm({ recovered: true, recoveredRevenue: '', actualCost: '', recoveryExpense: '' });
    }
  };

  return (
    <div className="page-enter">
      <div className="section-header">
        <div>
          <h1 className="section-title">Recovery Center</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)', marginTop: 'var(--space-1)' }}>
            Action-oriented pipeline for managing active recovery efforts.
          </p>
        </div>
      </div>

      <div className="pipeline-columns" style={{ overflowX: 'auto', paddingBottom: 'var(--space-4)' }}>
        {COLUMNS.map(col => {
          const columnOpps = columnsData[col.id] || [];
          return (
            <div key={col.id} className="pipeline-column">
              <div className="pipeline-column-header">
                {col.title}
                <span className="pipeline-column-count">{columnOpps.length}</span>
              </div>
              <div className="pipeline-column-body">
                {columnOpps.map(opp => (
                  <div key={opp.id} className="pipeline-card" onClick={() => handleCardClick(opp)}>
                    <div style={{ fontWeight: 500, fontSize: 'var(--fs-sm)', marginBottom: 'var(--space-1)' }}>
                      {opp.product_name}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>
                        {opp.selected_strategy || 'Needs Strategy'}
                      </span>
                      <span style={{ fontWeight: 600, fontSize: 'var(--fs-sm)', color: 'var(--positive)' }}>
                        {formatCurrency(opp.quoted_value - opp.fulfillment_cost)}
                      </span>
                    </div>
                  </div>
                ))}
                {columnOpps.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 'var(--fs-xs)', padding: 'var(--space-4) 0' }}>
                    No opportunities
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Drawer
        open={!!selectedOpp}
        onClose={() => setSelectedOpp(null)}
        title="Recovery Action Panel"
        footer={
          selectedOpp && ['analyzing', 'open', 'strategy_selected'].includes(selectedOpp.status) && (
            <>
              <button className="btn btn-primary" onClick={handleMarkAttempted}>
                <Play size={14} /> Mark as Attempted
              </button>
            </>
          )
        }
      >
        {selectedOpp && (
          <div>
            <div className="form-group">
              <div className="form-label">Product</div>
              <div style={{ fontSize: 'var(--fs-lg)', fontWeight: 600 }}>{selectedOpp.product_name}</div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
              <div>
                <div className="form-label">Loss Reason</div>
                <span className="badge badge-accent">{selectedOpp.loss_reason}</span>
              </div>
              <div>
                <div className="form-label">Selected Strategy</div>
                <span className="badge badge-neutral">{selectedOpp.selected_strategy || 'Not yet selected'}</span>
              </div>
            </div>

            <div className="form-group">
              <div className="form-label">AI Message Draft</div>
              <textarea
                className="form-input form-textarea"
                style={{ height: 160 }}
                value={messageDraft}
                onChange={e => setMessageDraft(e.target.value)}
              />
              <button 
                className="btn btn-secondary btn-sm" 
                style={{ marginTop: 'var(--space-2)' }}
                onClick={handleCopy}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy to Clipboard'}
              </button>
            </div>

            {selectedOpp.status === 'recovery_attempted' && (
              <div style={{ marginTop: 'var(--space-6)', padding: 'var(--space-4)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--fs-md)', fontWeight: 600 }}>Record Outcome</h4>
                <form onSubmit={handleRecordOutcome}>
                  <div className="form-group">
                    <label className="form-label">Was the recovery successful?</label>
                    <select
                      className="form-select"
                      value={outcomeForm.recovered}
                      onChange={e => setOutcomeForm(p => ({ ...p, recovered: e.target.value === 'true' }))}
                    >
                      <option value="true">Yes, Recovered</option>
                      <option value="false">No, Closed Without Recovery</option>
                    </select>
                  </div>
                  
                  {outcomeForm.recovered && (
                    <>
                      <div className="form-group">
                        <label className="form-label">Actual Recovered Revenue</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-input"
                          value={outcomeForm.recoveredRevenue}
                          onChange={e => setOutcomeForm(p => ({ ...p, recoveredRevenue: e.target.value }))}
                          required
                          placeholder={selectedOpp.quoted_value.toString()}
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                        <div className="form-group">
                          <label className="form-label">Actual Cost</label>
                          <input
                            type="number"
                            step="0.01"
                            className="form-input"
                            value={outcomeForm.actualCost}
                            onChange={e => setOutcomeForm(p => ({ ...p, actualCost: e.target.value }))}
                            required
                            placeholder={selectedOpp.fulfillment_cost.toString()}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Recovery Expense</label>
                          <input
                            type="number"
                            step="0.01"
                            className="form-input"
                            value={outcomeForm.recoveryExpense}
                            onChange={e => setOutcomeForm(p => ({ ...p, recoveryExpense: e.target.value }))}
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    </>
                  )}
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 'var(--space-2)' }}>
                    Save Outcome
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
