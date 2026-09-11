import { useState, useMemo } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './components/Toast';
import { useLeads } from './hooks/useLeads';
import { useEvents } from './hooks/useEvents';
import { formatINR } from './lib/format';
import LeadsPage from './pages/LeadsPage';
import PipelinePage from './pages/PipelinePage';
import CalendarPage from './pages/CalendarPage';
import AnalyticsPage from './pages/AnalyticsPage';
import TeamPage from './pages/TeamPage';
import LoginPage from './pages/LoginPage';
import {
  IconLeads, IconPipeline, IconCalendar, IconAnalytics,
  IconTooth, IconSearch, IconTeam, IconLogout,
} from './components/Icons';
import './index.css';

// ── Google OAuth Client ID ────────────────────────────────────────────────
// Replace this with your actual Client ID from console.cloud.google.com
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '999999999999-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com';

// ── Nav tab definitions ───────────────────────────────────────────────────
const TABS = [
  { id: 'leads',     label: 'Leads',     Icon: IconLeads,     adminOnly: false },
  { id: 'pipeline',  label: 'Pipeline',  Icon: IconPipeline,  adminOnly: false },
  { id: 'calendar',  label: 'Calendar',  Icon: IconCalendar,  adminOnly: false },
  { id: 'analytics', label: 'Analytics', Icon: IconAnalytics, adminOnly: false },
  { id: 'team',      label: 'Team',      Icon: IconTeam,      adminOnly: true  },
];

// ── User avatar dropdown ──────────────────────────────────────────────────
function UserMenu({ session, onSignOut }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        className="user-menu-trigger"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        {session.picture ? (
          <img
            src={session.picture}
            alt={session.name}
            className="user-avatar-img"
          />
        ) : (
          <span className="avatar avatar-sm">
            {session.name?.split(' ').map(w => w[0]).join('').slice(0, 2)}
          </span>
        )}
        <div className="user-menu-info">
          <span className="user-menu-name">{session.name?.split(' ')[0]}</span>
          <span className={`badge ${session.role === 'admin' ? 'badge-role-admin' : 'badge-role-user'}`}>
            {session.role}
          </span>
        </div>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 4l4 4 4-4"/></svg>
      </button>

      {open && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 40 }}
            onClick={() => setOpen(false)}
          />
          <div className="user-menu-dropdown" role="menu">
            <div className="user-menu-header">
              {session.picture ? (
                <img src={session.picture} alt={session.name} className="user-avatar-img-lg" />
              ) : (
                <span className="avatar avatar-md">
                  {session.name?.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </span>
              )}
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-ink)' }}>{session.name}</div>
                <div style={{ fontSize: 11, color: 'var(--color-mute)', marginTop: 1 }}>{session.email}</div>
              </div>
            </div>
            <div className="user-menu-divider" />
            <button
              className="user-menu-item user-menu-item-danger"
              role="menuitem"
              onClick={() => { setOpen(false); onSignOut(); }}
            >
              <IconLogout size={13} />
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Main CRM shell (rendered only when logged in) ─────────────────────────
function CRMApp() {
  const toast = useToast();
  const { session, isAdmin, salespersonId, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState('leads');
  const [globalSearch, setGlobalSearch] = useState('');
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);

  // ── Firestore-backed data ───────────────────────────────────────────────
  const {
    leads, leadsReady,
    addLead: fsAddLead, updateLead: fsUpdateLead, deleteLead: fsDeleteLead,
  } = useLeads();

  const { events, addEvent, deleteEvent } = useEvents();

  // ── Scope: non-admins only see their own leads ──────────────────────────
  const visibleLeads = useMemo(() => {
    if (isAdmin) return leads;
    return leads.filter(l => l.salesperson === salespersonId);
  }, [leads, isAdmin, salespersonId]);

  // ── Lead CRUD with RBAC guards ──────────────────────────────────────────
  const addLead = async (lead) => {
    const safeLead = isAdmin ? lead : { ...lead, salesperson: salespersonId };
    try {
      await fsAddLead(safeLead);
      toast(`${safeLead.name} added to leads`);
    } catch (err) {
      console.error(err);
      toast('Failed to save lead', 'error');
    }
  };

  const updateLead = async (updated) => {
    if (!isAdmin) {
      const existing = leads.find(l => l.id === updated.id);
      if (!existing || existing.salesperson !== salespersonId) {
        toast('You can only edit your own leads', 'error');
        return;
      }
      updated = { ...updated, salesperson: salespersonId };
    }
    try {
      await fsUpdateLead(updated);
    } catch (err) {
      console.error(err);
      toast('Failed to update lead', 'error');
    }
  };

  const deleteLead = async (id) => {
    if (!isAdmin) {
      const existing = leads.find(l => l.id === id);
      if (!existing || existing.salesperson !== salespersonId) {
        toast('You can only delete your own leads', 'error');
        return;
      }
    }
    const lead = leads.find(l => l.id === id);
    try {
      await fsDeleteLead(id);
      toast(`${lead?.name} removed`, 'error');
    } catch (err) {
      console.error(err);
      toast('Failed to delete lead', 'error');
    }
  };

  // ── Calendar CRUD ───────────────────────────────────────────────────────
  const handleAddEvent = async (dateKey, event) => {
    try {
      await addEvent(dateKey, event);
      toast(`Event added: ${event.title}`);
    } catch (err) {
      console.error(err);
      toast('Failed to save event', 'error');
    }
  };

  const handleDeleteEvent = async (dateKey, eventId) => {
    try {
      await deleteEvent(dateKey, eventId);
      toast('Event removed', 'error');
    } catch (err) {
      console.error(err);
      toast('Failed to delete event', 'error');
    }
  };

  // ── Nav stats ───────────────────────────────────────────────────────────
  const wonCount      = visibleLeads.filter(l => l.stage === 'won').length;
  const pipelineCount = visibleLeads.filter(l => !['won', 'lost'].includes(l.stage)).length;

  // ── Global search ───────────────────────────────────────────────────────
  const globalResults = globalSearch.length > 1
    ? visibleLeads.filter(l =>
        l.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
        l.email.toLowerCase().includes(globalSearch.toLowerCase()) ||
        l.treatment.toLowerCase().includes(globalSearch.toLowerCase())
      ).slice(0, 6)
    : [];

  const visibleTabs = TABS.filter(t => !t.adminOnly || isAdmin);
  if (activeTab === 'team' && !isAdmin) setActiveTab('leads');

  // Show a subtle loading indicator while Firestore hydrates
  const isLoading = !leadsReady;

  return (
    <div className="app">
      {/* ── Top nav ─────────────────────────────────────────────────── */}
      <nav className="top-nav" aria-label="Main navigation">
        <div className="nav-logo">
          <IconTooth size={20} />
          <span>DentalCRM</span>
        </div>

        <div className="nav-tabs" role="tablist">
          {visibleTabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={activeTab === id}
              className={`nav-tab ${activeTab === id ? 'active' : ''}`}
              onClick={() => setActiveTab(id)}
            >
              <Icon size={15} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="nav-right">
          {/* Global search */}
          <div style={{ position: 'relative' }}>
            <div className="search-wrap">
              <IconSearch />
              <input
                className="search-input"
                style={{ width: 200 }}
                placeholder="Search leads…"
                value={globalSearch}
                onChange={e => setGlobalSearch(e.target.value)}
                onFocus={() => setShowGlobalSearch(true)}
                onBlur={() => setTimeout(() => setShowGlobalSearch(false), 180)}
              />
            </div>
            {showGlobalSearch && globalResults.length > 0 && (
              <div className="global-search-dropdown">
                {globalResults.map(lead => (
                  <button
                    key={lead.id}
                    onMouseDown={() => { setActiveTab('leads'); setGlobalSearch(''); }}
                    className="global-search-item"
                  >
                    <span className="avatar avatar-sm">
                      {lead.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </span>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-ink)' }}>{lead.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-mute)' }}>{lead.treatment}</div>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-mute)' }}>
                      {formatINR(lead.expectedRevenue)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pipeline pills */}
          <div className="nav-pills">
            <span className="nav-pill">{pipelineCount} active</span>
            <span className="nav-pill nav-pill-won">{wonCount} won</span>
          </div>

          {/* User menu */}
          <UserMenu session={session} onSignOut={signOut} />
        </div>
      </nav>

      {/* Thin loading bar while Firestore hydrates */}
      {isLoading && <div className="firestore-loading-bar" />}

      {/* ── Page content ────────────────────────────────────────────── */}
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'leads' && (
          <LeadsPage
            leads={visibleLeads}
            onAddLead={addLead}
            onUpdateLead={updateLead}
            onDeleteLead={deleteLead}
            onToast={toast}
          />
        )}
        {activeTab === 'pipeline' && (
          <PipelinePage
            leads={visibleLeads}
            onAddLead={addLead}
            onUpdateLead={updateLead}
            onDeleteLead={deleteLead}
            onToast={toast}
          />
        )}
        {activeTab === 'calendar' && (
          <CalendarPage
            events={events}
            leads={visibleLeads}
            onAddEvent={handleAddEvent}
            onDeleteEvent={handleDeleteEvent}
            onToast={toast}
          />
        )}
        {activeTab === 'analytics' && (
          <AnalyticsPage leads={visibleLeads} isAdmin={isAdmin} />
        )}
        {activeTab === 'team' && isAdmin && (
          <TeamPage />
        )}
      </main>
    </div>
  );
}

// ── Root — providers + auth gate ──────────────────────────────────────────
function Root() {
  const { isLoggedIn, connecting } = useAuth();

  if (connecting) {
    return (
      <div style={{
        height: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--color-canvas)', gap: 'var(--sp-md)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-sm)', color: 'var(--color-ink)' }}>
          <IconTooth size={24} />
          <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.4px' }}>DentalCRM</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--color-mute)' }}>Connecting…</div>
      </div>
    );
  }

  return isLoggedIn ? <CRMApp /> : <LoginPage />;
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <ToastProvider>
          <Root />
        </ToastProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
