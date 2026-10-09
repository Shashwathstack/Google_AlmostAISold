import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import ToastContainer from './components/ui/ToastContainer';

// Pages
import Dashboard from './components/pages/Dashboard';
import LostOpportunities from './components/pages/LostOpportunities';
import TimeMachine from './components/pages/TimeMachine';
import LostSaleDNA from './components/pages/LostSaleDNA';
import RecoveryCenter from './components/pages/RecoveryCenter';
import RecoveryMemory from './components/pages/RecoveryMemory';
import Settings from './components/pages/Settings';
import Help from './components/pages/Help';

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">
        <TopBar />
        <div className="app-content">
          {children}
        </div>
      </main>
      <ToastContainer />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppProvider>
          <BrowserRouter>
            <AppLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/opportunities" element={<LostOpportunities />} />
                <Route path="/dna" element={<LostSaleDNA />} />
                <Route path="/time-machine" element={<TimeMachine />} />
                <Route path="/recovery" element={<RecoveryCenter />} />
                <Route path="/memory" element={<RecoveryMemory />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/help" element={<Help />} />
              </Routes>
            </AppLayout>
          </BrowserRouter>
        </AppProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
