import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { User, Bell, Shield, Database, Save, Download, Trash2, Moon, Sun } from 'lucide-react';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Form States
  const [profile, setProfile] = useState({
    name: 'Shashwath',
    email: 'shashwath@almostsold.ai',
    role: 'Admin'
  });
  
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    weeklyReport: true,
    aiSuggestions: true,
    marketing: false
  });

  const handleSaveProfile = (e) => {
    e.preventDefault();
    addToast('Profile updated successfully!', 'success');
  };

  const handleToggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    addToast('Notification preferences updated.', 'info');
  };

  const handleExportData = () => {
    addToast('Initiating data export. You will receive an email shortly.', 'success');
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all your cached data? This cannot be undone.')) {
      addToast('Data cache cleared successfully.', 'success');
    }
  };

  return (
    <div className="page-enter">
      <div className="section-header">
        <div>
          <h1 className="section-title">Settings</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)', marginTop: 'var(--space-1)' }}>
            Manage your account, preferences, and data.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: 'var(--space-6)', alignItems: 'start' }}>
        {/* Settings Navigation */}
        <div className="card" style={{ padding: 'var(--space-2)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            <button 
              className={`btn ${activeTab === 'profile' ? 'btn-secondary' : 'btn-ghost'}`}
              style={{ justifyContent: 'flex-start', width: '100%' }}
              onClick={() => setActiveTab('profile')}
            >
              <User size={16} style={{ marginRight: 'var(--space-2)' }}/> Profile
            </button>
            <button 
              className={`btn ${activeTab === 'preferences' ? 'btn-secondary' : 'btn-ghost'}`}
              style={{ justifyContent: 'flex-start', width: '100%' }}
              onClick={() => setActiveTab('preferences')}
            >
              <Bell size={16} style={{ marginRight: 'var(--space-2)' }}/> Preferences
            </button>
            <button 
              className={`btn ${activeTab === 'security' ? 'btn-secondary' : 'btn-ghost'}`}
              style={{ justifyContent: 'flex-start', width: '100%' }}
              onClick={() => setActiveTab('security')}
            >
              <Shield size={16} style={{ marginRight: 'var(--space-2)' }}/> Security
            </button>
            <button 
              className={`btn ${activeTab === 'data' ? 'btn-secondary' : 'btn-ghost'}`}
              style={{ justifyContent: 'flex-start', width: '100%' }}
              onClick={() => setActiveTab('data')}
            >
              <Database size={16} style={{ marginRight: 'var(--space-2)' }}/> Data Management
            </button>
          </div>
        </div>

        {/* Settings Content */}
        <div className="card">
          <div className="card-body">
            
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="fade-in">
                <h3 className="card-title" style={{ marginBottom: 'var(--space-5)' }}>Profile Details</h3>
                <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', maxWidth: 400 }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input 
                      className="form-input" 
                      value={profile.name} 
                      onChange={e => setProfile({...profile, name: e.target.value})} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input 
                      className="form-input" 
                      type="email"
                      value={profile.email} 
                      onChange={e => setProfile({...profile, email: e.target.value})} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <input className="form-input" value={profile.role} disabled />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: 'max-content', marginTop: 'var(--space-2)' }}>
                    <Save size={14} /> Save Changes
                  </button>
                </form>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="fade-in">
                <h3 className="card-title" style={{ marginBottom: 'var(--space-5)' }}>Application Preferences</h3>
                
                <div style={{ marginBottom: 'var(--space-6)' }}>
                  <div className="form-label" style={{ fontSize: 'var(--fs-md)', marginBottom: 'var(--space-3)' }}>Appearance</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <span>Current Theme: <strong>{theme === 'light' ? 'Light' : 'Dark'}</strong></span>
                    <button className="btn btn-secondary btn-sm" onClick={toggleTheme}>
                      {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />} 
                      Toggle Theme
                    </button>
                  </div>
                </div>

                <div>
                  <div className="form-label" style={{ fontSize: 'var(--fs-md)', marginBottom: 'var(--space-3)' }}>Notifications</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {[
                      { key: 'emailAlerts', label: 'Email Alerts for New Opportunities' },
                      { key: 'weeklyReport', label: 'Weekly Summary Report' },
                      { key: 'aiSuggestions', label: 'AI Strategy Suggestions' },
                      { key: 'marketing', label: 'Product Updates & Marketing' },
                    ].map(opt => (
                      <label key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={notifications[opt.key]} 
                          onChange={() => handleToggleNotification(opt.key)}
                          style={{ accentColor: 'var(--accent)', width: 16, height: 16 }}
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="fade-in">
                <h3 className="card-title" style={{ marginBottom: 'var(--space-5)' }}>Security</h3>
                <div style={{ maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <div className="form-group">
                    <label className="form-label">Change Password</label>
                    <input className="form-input" type="password" placeholder="Current Password" style={{ marginBottom: 'var(--space-2)' }} />
                    <input className="form-input" type="password" placeholder="New Password" style={{ marginBottom: 'var(--space-2)' }} />
                    <input className="form-input" type="password" placeholder="Confirm New Password" />
                  </div>
                  <button className="btn btn-primary" style={{ width: 'max-content' }} onClick={(e) => { e.preventDefault(); addToast('Password changed successfully.', 'success'); }}>
                    Update Password
                  </button>
                </div>
              </div>
            )}

            {/* Data Management Tab */}
            {activeTab === 'data' && (
              <div className="fade-in">
                <h3 className="card-title" style={{ marginBottom: 'var(--space-5)' }}>Data Management</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
                  Manage your workspace data, export reports, or reset your local cache.
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', maxWidth: 400 }}>
                  <div style={{ padding: 'var(--space-4)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                    <h4 style={{ margin: '0 0 var(--space-2) 0' }}>Export Workspace</h4>
                    <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                      Download all your lost opportunities and recovery scenarios as a CSV.
                    </p>
                    <button className="btn btn-secondary" onClick={handleExportData}>
                      <Download size={14} /> Export Data
                    </button>
                  </div>

                  <div style={{ padding: 'var(--space-4)', border: '1px solid var(--negative)', borderRadius: 'var(--radius-md)', background: 'var(--negative-subtle)' }}>
                    <h4 style={{ margin: '0 0 var(--space-2) 0', color: 'var(--negative)' }}>Clear Local Cache</h4>
                    <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                      Remove all locally cached application data. This will not delete data stored in Supabase.
                    </p>
                    <button className="btn" style={{ background: 'var(--negative)', color: 'white' }} onClick={handleClearData}>
                      <Trash2 size={14} /> Clear Cache
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
      <style>{`
        .fade-in { animation: fadeIn 0.2s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
