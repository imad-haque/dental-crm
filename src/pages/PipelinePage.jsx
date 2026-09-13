import { useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { PIPELINE_STAGES } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../lib/format';
import LeadModal from '../components/LeadModal';
import LeadDetailPanel from '../components/LeadDetailPanel';
import { IconPlus, IconKanban, IconList, IconSearch } from '../components/Icons';

function stageBadgeClass(stage) {
  return `badge badge-stage-${stage}`;
}

// ── Kanban view ──────────────────────────────
function KanbanView({ leads, onDragEnd, onCardClick, spMap }) {
  const grouped = PIPELINE_STAGES.reduce((acc, s) => {
    acc[s.id] = leads.filter(l => l.stage === s.id);
    return acc;
  }, {});

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="kanban-board">
        {PIPELINE_STAGES.map(stage => (
          <div key={stage.id} className="kanban-col">
            <div className="kanban-col-header">
              <span className="kanban-col-label">{stage.label}</span>
              <div className="flex items-center gap-xs">
                {grouped[stage.id].length > 0 && (
                  <span style={{ fontSize: 11, color: 'var(--color-mute)', fontFamily: 'var(--font-mono)' }}>
                    {formatINR(grouped[stage.id].reduce((s, l) => s + l.expectedRevenue, 0))}
                  </span>
                )}
                <span className="kanban-col-count">{grouped[stage.id].length}</span>
              </div>
            </div>
            <Droppable droppableId={stage.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`kanban-col-body kanban-drop-zone ${snapshot.isDraggingOver ? 'is-dragging-over' : ''}`}
                >
                  {grouped[stage.id].map((lead, index) => {
                    return (
                      <Draggable key={lead.id} draggableId={lead.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`kanban-card ${snapshot.isDragging ? 'is-dragging' : ''}`}
                            onClick={() => onCardClick(lead)}
                          >
                            <div className="kanban-card-name">{lead.name}</div>
                            <div className="kanban-card-treatment">{lead.treatment}</div>
                            <div className="kanban-card-footer">
                              <span className="kanban-revenue">{formatINR(lead.expectedRevenue)}</span>
                              <div className="flex items-center gap-xs">
                                <span className={`badge badge-priority-${lead.priority}`} style={{ textTransform: 'capitalize', fontSize: 10 }}>{lead.priority}</span>
                                <span className="avatar avatar-sm">
                                  {spMap?.[lead.salesperson]?.name?.split(' ').map(w=>w[0]).join('').slice(0,2) ?? '?'}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                  {grouped[stage.id].length === 0 && !snapshot.isDraggingOver && (
                    <div style={{ fontSize: 12, color: 'var(--color-faint)', textAlign: 'center', padding: 'var(--sp-lg) var(--sp-md)' }}>
                      No leads
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}

// ── List view ────────────────────────────────
function ListView({ leads, onRowClick, spMap }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Contact</th>
            <th>Email</th>
            <th>Treatment</th>
            <th>Revenue</th>
            <th>Stage</th>
            <th>Salesperson</th>
          </tr>
        </thead>
        <tbody>
          {leads.map(lead => {
            const spMember = spMap?.[lead.salesperson];
            const spInitials = spMember?.name?.split(' ').map(w=>w[0]).join('').slice(0,2) ?? '?';
            return (
              <tr key={lead.id} onClick={() => onRowClick(lead)}>
                <td>
                  <div className="flex items-center gap-xs">
                    <span className="avatar avatar-sm">{lead.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</span>
                    <span className="td-name">{lead.name}</span>
                  </div>
                </td>
                <td><span className="td-email">{lead.email}</span></td>
                <td>{lead.treatment}</td>
                <td><span className="td-mono">{formatINR(lead.expectedRevenue)}</span></td>
                <td><span className={stageBadgeClass(lead.stage)}>{PIPELINE_STAGES.find(s => s.id === lead.stage)?.label}</span></td>
                <td>
                  <div className="flex items-center gap-xs">
                    <span className="avatar avatar-sm">{spInitials}</span>
                    <span style={{ fontSize: 13 }}>{spMember?.name ?? lead.salesperson}</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Main ─────────────────────────────────────
export default function PipelinePage({ leads, onAddLead, onUpdateLead, onDeleteLead, onToast }) {
  const { teamMembers } = useAuth();
  const [view, setView] = useState('kanban');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);

  const spMap = useMemo(() => {
    const map = {};
    (teamMembers ?? []).forEach(m => { if (m.salespersonId) map[m.salespersonId] = m; });
    return map;
  }, [teamMembers]);

  const filtered = search
    ? leads.filter(l =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.treatment.toLowerCase().includes(search.toLowerCase())
      )
    : leads;

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const lead = leads.find(l => l.id === draggableId);
    if (!lead || lead.stage === destination.droppableId) return;
    onUpdateLead({ ...lead, stage: destination.droppableId });
  };

  const totalPipeline = leads
    .filter(l => !['won', 'lost'].includes(l.stage))
    .reduce((sum, l) => sum + l.expectedRevenue, 0);
  const totalWon = leads.filter(l => l.stage === 'won').reduce((sum, l) => sum + l.expectedRevenue, 0);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Pipeline</div>
          <div className="page-subtitle">{formatINR(totalPipeline)} active · {formatINR(totalWon)} won</div>
        </div>
        <div className="flex items-center gap-xs">
          <div className="subtabs">
            <button className={`subtab ${view === 'kanban' ? 'active' : ''}`} onClick={() => setView('kanban')}>
              <IconKanban /> Kanban
            </button>
            <button className={`subtab ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>
              <IconList /> List
            </button>
          </div>
          <button className="btn btn-primary" onClick={() => { setEditLead(null); setShowModal(true); }}>
            <IconPlus /> Add lead
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-sm)', padding: 'var(--sp-md) var(--sp-xl)', borderBottom: '1px solid var(--color-hairline)', background: 'var(--color-elevated)', flexShrink: 0 }}>
        <div className="search-wrap">
          <IconSearch />
          <input className="search-input" placeholder="Search pipeline…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <span style={{ fontSize: 12, color: 'var(--color-mute)', marginLeft: 'var(--sp-xs)' }}>{filtered.length} leads</span>
      </div>

      <div className="page-body">
        {view === 'kanban'
          ? <KanbanView leads={filtered} onDragEnd={handleDragEnd} onCardClick={setSelectedLead} spMap={spMap} />
          : <ListView leads={filtered} onRowClick={setSelectedLead} spMap={spMap} />
        }
      </div>

      {showModal && (
        <LeadModal
          lead={editLead}
          onSave={(data) => {
            if (editLead) onUpdateLead(data);
            else onAddLead(data);
            setShowModal(false);
            setEditLead(null);
          }}
          onClose={() => { setShowModal(false); setEditLead(null); }}
        />
      )}

      {selectedLead && (
        <LeadDetailPanel
          lead={leads.find(l => l.id === selectedLead.id) || selectedLead}
          onClose={() => setSelectedLead(null)}
          onStageChange={(id, stage) => {
            const lead = leads.find(l => l.id === id);
            if (lead) onUpdateLead({ ...lead, stage });
          }}
          onEdit={(lead) => { setEditLead(lead); setShowModal(true); setSelectedLead(null); }}
          onDelete={onDeleteLead}
          onEmailSent={(e) => {
  emailjs.send(
    "service_csef9jc",
    "template_z36xlpt",
    {
      to_email: e.to,
      subject: e.subject,
      message: e.body
    },
    "tPZ98lzHf44f2WVBA"
  )
    .then(() => {
      // Success toast is already handled by LeadDetailPanel
    })
    .catch((err) => {
      console.error('EmailJS error:', err);
    });
}}
          onToast={onToast}
        />
      )}
    </div>
  );
}
