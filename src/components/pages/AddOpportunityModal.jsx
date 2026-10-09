import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../ui/Modal';

export default function AddOpportunityModal({ open, onClose }) {
  const { addOpportunity } = useApp();
  const { addToast } = useToast();
  const [form, setForm] = useState({
    product_name: '',
    original_price: '',
    fulfillment_cost: '',
    quoted_value: '',
    loss_reason: 'Price',
    priority: 'medium',
    customer_notes: '',
  });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Auto-sync quoted_value with original_price
    if (field === 'original_price') {
      setForm(prev => ({ ...prev, quoted_value: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.product_name || !form.original_price) {
      addToast('Please fill in required fields', 'warning');
      return;
    }
    addOpportunity({
      product_name: form.product_name,
      original_price: parseFloat(form.original_price) || 0,
      fulfillment_cost: parseFloat(form.fulfillment_cost) || 0,
      quoted_value: parseFloat(form.quoted_value) || parseFloat(form.original_price) || 0,
      loss_reason: form.loss_reason,
      priority: form.priority,
      customer_notes: form.customer_notes,
    });
    addToast('Opportunity added successfully', 'success');
    setForm({
      product_name: '', original_price: '', fulfillment_cost: '',
      quoted_value: '', loss_reason: 'Price', priority: 'medium', customer_notes: '',
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Analyze Lost Sale"
      maxWidth={560}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Add Opportunity</button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Product / Service Name *</label>
          <input
            className="form-input"
            value={form.product_name}
            onChange={e => handleChange('product_name', e.target.value)}
            placeholder="e.g., Samsung 65&quot; QLED TV"
            required
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <div className="form-group">
            <label className="form-label">Quoted Price *</label>
            <input
              className="form-input"
              type="number"
              step="0.01"
              value={form.original_price}
              onChange={e => handleChange('original_price', e.target.value)}
              placeholder="1299.00"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Fulfillment Cost</label>
            <input
              className="form-input"
              type="number"
              step="0.01"
              value={form.fulfillment_cost}
              onChange={e => handleChange('fulfillment_cost', e.target.value)}
              placeholder="620.00"
            />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <div className="form-group">
            <label className="form-label">Loss Reason</label>
            <select
              className="form-select"
              value={form.loss_reason}
              onChange={e => handleChange('loss_reason', e.target.value)}
            >
              {['Price', 'Availability', 'Delivery', 'Confusion', 'Competitor', 'Timing', 'Other'].map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Priority</label>
            <select
              className="form-select"
              value={form.priority}
              onChange={e => handleChange('priority', e.target.value)}
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Customer Notes</label>
          <textarea
            className="form-input form-textarea"
            value={form.customer_notes}
            onChange={e => handleChange('customer_notes', e.target.value)}
            placeholder="What did the customer say? Why was the sale lost?"
            rows={3}
          />
        </div>
      </form>
    </Modal>
  );
}
