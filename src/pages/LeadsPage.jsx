import { useState, useMemo } from 'react';
import { PIPELINE_STAGES } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../lib/format';
import LeadModal from '../components/LeadModal';
import LeadDetailPanel from '../components/LeadDetailPanel';
import { IconPlus, IconSearch, IconFilter } from '../components/Icons';

function stageBadgeClass(stage) {
  return `badge badge-stage-${stage}`;
}

export default function LeadsPage({ leads, onAddLead, onUpdateLead, onDeleteLead, onToast }) {
  const { teamMembers } = useAuth();

  // Build salesperson lookup from real team members
  const spMap = useMemo(() => {
    const map = {};
    (teamMembers ?? []).forEach(m => {
      if (m.salespersonId) map[m.salespersonId] = m;
    });
    return map;
  }, [teamMembers]);

  const spList = useMemo(() =>
    (teamMembers ?? []).filter(m => m.salespersonId),
  [teamMembers]);
  const [search, setSearch] = useState('');
  const [filterStage, setFilterStage] = useState('all');
  const [filterSP, setFilterSP] = useState('all');
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [showModal, setShowModal] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);

  const filtered = useMemo(() => {
    let result = [...leads];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.treatment.toLowerCase().includes(q)
      );
    }
    if (filterStage !== 'all') result = result.filter(l => l.stage === filterStage);
    if (filterSP !== 'all') result = result.filter(l => l.salesperson === filterSP);
    result.sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey];
      if (sortKey === 'expectedRevenue') { av = Number(av); bv = Number(bv); }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [leads, search, filterStage, filterSP, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sortIndicator = (key) => {
    if (sortKey !== key) return null;
    return <span style={{ marginLeft: 3, fontSize: 10 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  const totalRevenue = filtered.reduce((sum, l) => sum + l.expectedRevenue, 0);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Leads</div>
          <div className="page-subtitle">{filtered.length} lead{filtered.length !== 1 ? 's' : ''} · {formatINR(totalRevenue)} pipeline value</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditLead(null); setShowModal(true); }}>
          <IconPlus /> Add lead
        </button>
      </div>

            {/* Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--sp-sm)', padding: 'var(--sp-md) var(--sp-xl)', borderBottom: '1px solid var(--color-hairline)', background: 'var(--color-elevated)', flexShrink: 0 }}>
        <div className="search-wrap">
          <IconSearch />
          <input
            className="search-input"
            placeholder="Search leads…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-sm)', flex: '1 1 auto', minWidth: 0 }}>
          <IconFilter size={14} style={{ color: 'var(--color-faint)', flexShrink: 0 }} />
          <select className="select" value={filterStage} onChange={e => setFilterStage(e.target.value)} style={{ flex: '1 1 120px', minWidth: '100px' }}>
            <option value="all">All stages</option>
            {PIPELINE_STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <select className="select" value={filterSP} onChange={e => setFilterSP(e.target.value)} style={{ flex: '1 1 140px', minWidth: '120px' }}>
            <option value="all">All salespersons</option>
            {spList.map(m => <option key={m.salespersonId} value={m.salespersonId}>{m.name}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="page-body" style={{ padding: 'var(--sp-xl)' }}>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-title">No leads found</div>
            <div className="empty-state-sub">Adjust your filters or add a new lead.</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('name')}>Contact {sortIndicator('name')}</th>
                  <th>Email</th>
                  <th>Treatment</th>
                  <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('expectedRevenue')}>Revenue {sortIndicator('expectedRevenue')}</th>
                  <th>Stage</th>
                  <th>Salesperson</th>
                  <th>Priority</th>
                  <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('createdAt')}>Created {sortIndicator('createdAt')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(lead => {
                  return (
                    <tr key={lead.id} onClick={() => setSelectedLead(lead)}>
                      <td>
                        <div className="flex items-center gap-xs">
                          <span className="avatar avatar-sm">{lead.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</span>
                          <span className="td-name">{lead.name}</span>
                        </div>
                      </td>
                      <td><span className="td-email">{lead.email}</span></td>
                      <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.treatment}</td>
                      <td><span className="td-mono">{formatINR(lead.expectedRevenue)}</span></td>
                      <td><span className={stageBadgeClass(lead.stage)}>{PIPELINE_STAGES.find(s => s.id === lead.stage)?.label}</span></td>
                      <td>
                        <div className="flex items-center gap-xs">
                          <span className="avatar avatar-sm">{spMap[lead.salesperson]?.name?.split(' ').map(w=>w[0]).join('').slice(0,2) ?? '?'}</span>
                          <span style={{ fontSize: 13 }}>{spMap[lead.salesperson]?.name?.split(' ')[0] ?? lead.salesperson}</span>
                        </div>
                      </td>
                      <td><span className={`badge badge-priority-${lead.priority}`} style={{ textTransform: 'capitalize' }}>{lead.priority}</span></td>
                      <td><span style={{ fontSize: 12, color: 'var(--color-mute)' }}>{new Date(lead.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
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
          onStageChange={(id, stage) => onUpdateLead({ ...leads.find(l => l.id === id), stage })}
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
