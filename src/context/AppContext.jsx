import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { 
  generateDemoOpportunities, 
  DEMO_BUSINESSES, 
  generateTimeSeriesData, 
  getLossReasonDistribution, 
  computeKPIs, 
  getTopOpportunities,
  generateInsights 
} from '../data/demoData';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [currentBusiness, setCurrentBusiness] = useState(DEMO_BUSINESSES[0]);
  const [opportunities, setOpportunities] = useState([]);
  const [scenarios, setScenarios] = useState({});
  const [recoveryAttempts, setRecoveryAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load demo data on mount / business change
  useEffect(() => {
    setLoading(true);
    // Simulate a brief load to show skeleton states
    const timer = setTimeout(() => {
      const data = generateDemoOpportunities(currentBusiness.id, 42);
      setOpportunities(data);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [currentBusiness.id]);

  // Derived data
  const kpis = computeKPIs(opportunities);
  const timeSeriesData = generateTimeSeriesData(opportunities);
  const lossReasonData = getLossReasonDistribution(opportunities);
  const topOpportunities = getTopOpportunities(opportunities);
  const insights = generateInsights(opportunities);

  // CRUD operations
  const addOpportunity = useCallback((opp) => {
    const newOpp = {
      ...opp,
      id: 'opp-' + Math.random().toString(36).substring(2, 11),
      business_id: currentBusiness.id,
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      recovered_revenue: 0,
      actual_cost: 0,
      recovery_expense: 0,
      selected_strategy: null,
      ai_analysis: null,
      scenarios: [],
    };
    setOpportunities(prev => [newOpp, ...prev]);
    setOpportunities(prev => [newOpp, ...prev]);
    return newOpp;
  }, [currentBusiness.id]);

  const addOpportunities = useCallback((newOpps) => {
    const formattedOpps = newOpps.map(opp => ({
      ...opp,
      id: 'opp-' + Math.random().toString(36).substring(2, 11),
      business_id: currentBusiness.id,
      status: opp.status || 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      recovered_revenue: 0,
      actual_cost: 0,
      recovery_expense: 0,
      selected_strategy: null,
      ai_analysis: null,
      scenarios: [],
    }));
    setOpportunities(prev => [...formattedOpps, ...prev]);
    return formattedOpps;
  }, [currentBusiness.id]);

  const updateOpportunity = useCallback((id, updates) => {
    setOpportunities(prev => prev.map(o => 
      o.id === id ? { ...o, ...updates, updated_at: new Date().toISOString() } : o
    ));
  }, []);

  const deleteOpportunity = useCallback((id) => {
    setOpportunities(prev => prev.filter(o => o.id !== id));
  }, []);

  const saveScenario = useCallback((opportunityId, scenario) => {
    const scn = {
      ...scenario,
      id: 'scn-' + Math.random().toString(36).substring(2, 9),
      opportunity_id: opportunityId,
      created_at: new Date().toISOString(),
    };
    setScenarios(prev => ({
      ...prev,
      [opportunityId]: [...(prev[opportunityId] || []), scn],
    }));
    return scn;
  }, []);

  const getScenarios = useCallback((opportunityId) => {
    return scenarios[opportunityId] || [];
  }, [scenarios]);

  const addRecoveryAttempt = useCallback((attempt) => {
    const newAttempt = {
      ...attempt,
      id: 'rec-' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
    };
    setRecoveryAttempts(prev => [newAttempt, ...prev]);
    return newAttempt;
  }, []);

  const recordOutcome = useCallback((opportunityId, outcome) => {
    updateOpportunity(opportunityId, {
      status: outcome.recovered ? 'recovered' : 'closed',
      recovered_revenue: outcome.recoveredRevenue || 0,
      actual_cost: outcome.actualCost || 0,
      recovery_expense: outcome.recoveryExpense || 0,
    });
  }, [updateOpportunity]);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  return (
    <AppContext.Provider value={{
      // Business
      currentBusiness,
      setCurrentBusiness,
      businesses: DEMO_BUSINESSES,
      // Data
      opportunities,
      kpis,
      timeSeriesData,
      lossReasonData,
      topOpportunities,
      insights,
      loading,
      // CRUD
      addOpportunity,
      addOpportunities,
      updateOpportunity,
      deleteOpportunity,
      // Scenarios
      saveScenario,
      getScenarios,
      scenarios,
      // Recovery
      recoveryAttempts,
      addRecoveryAttempt,
      recordOutcome,
      // UI state
      sidebarCollapsed,
      toggleSidebar,
      mobileMenuOpen,
      toggleMobileMenu,
      setMobileMenuOpen,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
