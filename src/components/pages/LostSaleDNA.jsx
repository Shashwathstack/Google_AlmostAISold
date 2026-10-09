import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { formatNumber } from '../../utils/financial';
import {
  Dna,
  Brain,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  FileText,
  Clock,
  Play
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Cell
} from 'recharts';
import Drawer from '../ui/Drawer';

export default function LostSaleDNA() {
  const { opportunities, loading, lossReasonData, updateOpportunity } = useApp();
  const { addToast } = useToast();
  
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedNode, setSelectedNode] = useState(null);

  const stats = useMemo(() => {
    const total = opportunities.length;
    let mostCommonReason = { name: 'None', count: 0 };
    
    lossReasonData.forEach(d => {
      if (d.value > mostCommonReason.count) {
        mostCommonReason = { name: d.name, count: d.value };
      }
    });

    return {
      total,
      mostCommonReason: mostCommonReason.name,
      frequentTheme: 'Price Sensitivity & Timing', // Mock inferred theme
      insufficientEvidence: Math.floor(total * 0.15)
    };
  }, [opportunities, lossReasonData]);

  // Mock Root Cause Map Data
  const nodes = [
    { id: 'n1', label: 'Price higher than competitors', type: 'observed', count: 18, x: 50, y: 50 },
    { id: 'n2', label: 'Uncertain delivery promise', type: 'observed', count: 12, x: 50, y: 150 },
    { id: 'n3', label: 'Perceived low value', type: 'inferred', count: 14, x: 250, y: 50 },
    { id: 'n4', label: 'Customer abandons purchase', type: 'outcome', count: 30, x: 450, y: 100 }
  ];

  const handleAnalyze = () => {
    setAnalyzing(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setAnalyzing(false);
          addToast('Analysis completed successfully', 'success');
          return 100;
        }
        return p + 10;
      });
    }, 300);
  };

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
          <h1 className="section-title">Lost Sale DNA</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)', marginTop: 'var(--space-1)' }}>
            Visual root-cause intelligence and pattern recognition
          </p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={handleAnalyze} 
          disabled={analyzing}
        >
          {analyzing ? (
            <>
              <Brain size={16} className="spin" /> Analyzing ({progress}%)
            </>
          ) : (
            <>
              <Play size={16} /> Analyze Lost Sales
            </>
          )}
        </button>
      </div>

      {/* Top Section */}
      <div className="grid-cols-4" style={{ marginBottom: 'var(--space-7)' }}>
        <div className="metric-card">
          <div className="metric-card-label">Records Analyzed</div>
          <div className="metric-card-value">{formatNumber(stats.total)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-card-label">Most Common Reason</div>
          <div className="metric-card-value" style={{ fontSize: 'var(--fs-xl)' }}>{stats.mostCommonReason}</div>
        </div>
        <div className="metric-card">
          <div className="metric-card-label">Frequent AI Theme</div>
          <div className="metric-card-value" style={{ fontSize: 'var(--fs-lg)', marginTop: 4 }}>{stats.frequentTheme}</div>
        </div>
        <div className="metric-card">
          <div className="metric-card-label">Insufficient Evidence</div>
          <div className="metric-card-value" style={{ color: 'var(--warning)' }}>{formatNumber(stats.insufficientEvidence)}</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Loss Reason Distribution (Bar) */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Theme Frequency</h3>
          </div>
          <div className="card-body" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lossReasonData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} width={80} />
                <RechartsTooltip 
                  cursor={{ fill: 'var(--bg-hover)' }}
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                />
                <Bar dataKey="value" fill="var(--accent)" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recommended Interventions</h3>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {[
              { title: 'Revise Pricing Tiers', impact: 'High', effort: 'Medium', desc: 'Address frequent price objections by introducing a lighter tier.' },
              { title: 'Clarify Delivery Windows', impact: 'Medium', effort: 'Low', desc: 'Update website copy to set better delivery expectations upfront.' },
              { title: 'Competitor Comparison Guide', impact: 'High', effort: 'Low', desc: 'Equip sales team with a clear value comparison against top competitors.' }
            ].map((rec, i) => (
              <div key={i} style={{ padding: 'var(--space-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                  <div style={{ fontWeight: 600 }}>{rec.title}</div>
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <span className={`badge ${rec.impact === 'High' ? 'badge-positive' : 'badge-warning'}`}>Impact: {rec.impact}</span>
                    <span className="badge badge-neutral">Effort: {rec.effort}</span>
                  </div>
                </div>
                <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)' }}>{rec.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Root-Cause Map */}
      <div className="card" style={{ marginTop: 'var(--space-7)' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Root-Cause Relationship Map</h3>
            <div className="card-subtitle">Click nodes to investigate underlying records</div>
          </div>
        </div>
        <div className="card-body" style={{ height: 400, position: 'relative', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          {/* Simple SVG for drawing lines between nodes */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <line x1="150" y1="75" x2="250" y2="75" stroke="var(--border-strong)" strokeWidth="2" strokeDasharray="5,5" />
            <line x1="150" y1="175" x2="450" y2="125" stroke="var(--border-strong)" strokeWidth="2" />
            <line x1="350" y1="75" x2="450" y2="125" stroke="var(--border-strong)" strokeWidth="2" />
          </svg>

          {nodes.map(node => (
            <div
              key={node.id}
              onClick={() => setSelectedNode(node)}
              style={{
                position: 'absolute',
                left: node.x,
                top: node.y,
                background: 'var(--bg-card)',
                border: `2px solid ${node.type === 'outcome' ? 'var(--negative)' : node.type === 'inferred' ? 'var(--accent)' : 'var(--border-strong)'}`,
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3)',
                width: 180,
                cursor: 'pointer',
                boxShadow: 'var(--shadow-md)',
                transition: 'all 0.2s ease',
                zIndex: 10
              }}
              className="hover:scale-105"
            >
              <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, marginBottom: 'var(--space-1)' }}>{node.label}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>{node.type.toUpperCase()}</span>
                <span className="badge badge-neutral">{node.count} records</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Drawer
        open={!!selectedNode}
        onClose={() => setSelectedNode(null)}
        title="Node Investigation"
      >
        {selectedNode && (
          <div>
            <div className="form-group">
              <div className="form-label">Theme / Finding</div>
              <div style={{ fontSize: 'var(--fs-lg)', fontWeight: 600 }}>{selectedNode.label}</div>
            </div>
            <div className="form-group">
              <div className="form-label">Classification</div>
              <span className={`badge ${selectedNode.type === 'inferred' ? 'badge-accent' : 'badge-neutral'}`}>
                {selectedNode.type === 'inferred' ? 'AI Inferred' : 'Directly Observed'}
              </span>
            </div>
            <div className="form-group">
              <div className="form-label">Confidence / Uncertainty</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)' }}>
                {selectedNode.type === 'inferred' 
                  ? 'Moderate confidence. Correlation observed across 14 records, but direct causality is not explicitly stated in customer notes.'
                  : 'High confidence. Directly extracted from customer loss reasons.'}
              </p>
            </div>
            
            <div style={{ marginTop: 'var(--space-6)' }}>
              <div className="form-label">Supporting Records ({selectedNode.count})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ padding: 'var(--space-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                      <span style={{ fontWeight: 500, fontSize: 'var(--fs-sm)' }}>OPP-00{i}</span>
                      <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--fs-xs)' }}>Oct {i+10}</span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-xs)' }}>
                      "Customer mentioned that the price was a bit steep compared to alternative options they found online..."
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>
      
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .hover\\:scale-105:hover { transform: scale(1.05); }
      `}</style>
    </div>
  );
}
