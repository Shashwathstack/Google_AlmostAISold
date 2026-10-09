import { useState } from 'react';
import { importLostSales } from '../../utils/importCsv';
import { Upload } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ImportCsv({ businessId }) {
  const { addOpportunities } = useApp();
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleImport() {
    if (!file) {
      setMessage('Choose a CSV file first.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const records = await importLostSales(file, businessId);
      addOpportunities(records);
      setMessage(`Imported ${records.length} opportunities.`);
    } catch (error) {
      setMessage(error.message || 'Import failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="form-input"
        style={{ padding: '4px', maxWidth: '220px' }}
      />
      <button className="btn btn-secondary btn-sm" onClick={handleImport} disabled={loading}>
        <Upload size={14} />
        {loading ? 'Importing...' : 'Import CSV'}
      </button>
      {message && <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>{message}</span>}
    </div>
  );
}
