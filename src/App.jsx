import { useState } from 'react';
import { initialLeads, initialCalendarEvents } from './data/mockData';
import LeadsPage from './pages/LeadsPage';
import PipelinePage from './pages/PipelinePage';
import CalendarPage from './pages/CalendarPage';
import AnalyticsPage from './pages/AnalyticsPage';
import { IconLeads, IconPipeline, IconCalendar, IconAnalytics, IconTooth } from './components/Icons';
import './index.css';

const TABS = [
  { id: 'leads',    label: 'Leads',    Icon: IconLeads },
  { id: 'pipeline', label: 'Pipeline', Icon: IconPipeline },
  { id: 'calendar', label: 'Calendar', Icon: IconCalendar },
  { id: 'analytics',label: 'Analytics',Icon: IconAnalytics },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('leads');
  const [leads, setLeads] = useState(initialLeads);
  const [events, setEvents] = useState(initialCalendarEvents);

  // Lead CRUD
  const addLead = (lead) => setLeads(prev => [lead, ...prev]);
  const updateLead = (updated) => setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
  const deleteLead = (id) => setLeads(prev => prev.filter(l => l.id !== id));

  // Calendar CRUD
  const addEvent = (dateKey, event) => setEvents(prev => ({
    ...prev,
    [dateKey]: [...(prev[dateKey] || []), event],
  }));
  const deleteEvent = (dateKey, eventId) => setEvents(prev => ({
    ...prev,
    [dateKey]: (prev[dateKey] || []).filter(e => e.id !== eventId),
  }));

  const wonCount = leads.filter(l => l.stage === 'won').length;
  const pipelineCount = leads.filter(l => !['won', 'lost'].includes(l.stage)).length;

  return (
    <div className="app">
      {/* Top nav */}
      <nav className="top-nav" aria-label="Main navigation">
        <div className="nav-logo">
          <IconTooth size={20} />
          <span>DentalCRM</span>
        </div>

        <div className="nav-tabs" role="tablist">
          {TABS.map(({ id, label, Icon }) => (
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-mute)' }}>
            <span style={{ background: 'var(--color-hairline-soft)', borderRadius: 'var(--r-full)', padding: '2px 8px' }}>
              {pipelineCount} active
            </span>
            <span style={{ background: '#dcfce7', color: '#15803d', borderRadius: 'var(--r-full)', padding: '2px 8px', fontWeight: 500 }}>
              {wonCount} won
            </span>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'leads' && (
          <LeadsPage leads={leads} onAddLead={addLead} onUpdateLead={updateLead} onDeleteLead={deleteLead} />
        )}
        {activeTab === 'pipeline' && (
          <PipelinePage leads={leads} onAddLead={addLead} onUpdateLead={updateLead} onDeleteLead={deleteLead} />
        )}
        {activeTab === 'calendar' && (
          <CalendarPage events={events} onAddEvent={addEvent} onDeleteEvent={deleteEvent} />
        )}
        {activeTab === 'analytics' && (
          <AnalyticsPage leads={leads} />
        )}
      </main>
    </div>
  );
}
