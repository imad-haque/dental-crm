import { useState } from 'react';
import { PIPELINE_STAGES } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { IconX, IconMail, IconSend, IconEdit, IconTrash, IconPhone } from './Icons';

export default function LeadDetailPanel({ lead, onClose, onStageChange, onEdit, onDelete, onEmailSent, onToast }) {
  const { isAdmin, salespersonId, teamMembers } = useAuth();
  const canEdit = isAdmin || lead.salesperson === salespersonId;

  const [showEmailCompose, setShowEmailCompose] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // Resolve salesperson from real team members instead of hardcoded list
  const sp         = teamMembers?.find(m => m.salespersonId === lead.salesperson);
  const spName     = sp?.name ?? lead.salesperson ?? '—';
  const spInitials = spName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const handleSend = () => {
    if (!emailSubject.trim() || !emailBody.trim()) {
      onToast?.('Add a subject and message before sending', 'error');
      return;
    }
    setShowEmailCompose(false);
    setEmailSubject('');
    setEmailBody('');
    onEmailSent?.({ to: lead.email, subject: emailSubject, body: emailBody });
    onToast?.(`Email sent to ${lead.name}`);
  };

  const handleStageChange = (id, stage) => {
    if (!canEdit) { onToast?.('You can only change stage on your own leads', 'error'); return; }
    const label = PIPELINE_STAGES.find(s => s.id === stage)?.label;
    onStageChange(id, stage);
    onToast?.(`Moved to ${label}`);
  };

  return (
    <div
      className="detail-panel-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="detail-panel"
        role="dialog"
        aria-modal="true"
        aria-label={`Lead: ${lead.name}`}
      >
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="detail-panel-header">
          <div>
            <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--color-ink)', letterSpacing: '-0.3px' }}>
              {lead.name}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-mute)', marginTop: 2 }}>
              {lead.treatment}
            </div>
          </div>
          <div className="flex gap-xs items-center">
            {canEdit && (
              <button
                className="btn btn-secondary"
                style={{ height: 28, fontSize: 13 }}
                onClick={() => onEdit(lead)}
              >
                <IconEdit /> Edit
              </button>
            )}
            <button className="btn-icon" onClick={onClose} aria-label="Close panel">
              <IconX />
            </button>
          </div>
        </div>

        <div className="detail-panel-body">
          {/* ── Ownership notice for non-admins ──────────────────── */}
          {!canEdit && (
            <div className="readonly-notice">
              <span>👁</span>
              <span>This lead belongs to {spName}. You can view it but not edit it.</span>
            </div>
          )}

          {/* ── Stage selector ────────────────────────────────────── */}
          <div>
            <div className="detail-section-title">Pipeline stage</div>
            <div className={`stage-selector ${!canEdit ? 'stage-selector-disabled' : ''}`}>
              {PIPELINE_STAGES.map(s => (
                <button
                  key={s.id}
                  className={`stage-btn ${lead.stage === s.id ? 'active' : ''}`}
                  onClick={() => handleStageChange(lead.id, s.id)}
                  disabled={!canEdit}
                  aria-disabled={!canEdit}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Contact ───────────────────────────────────────────── */}
          <div>
            <div className="detail-section-title">Contact</div>
            <div className="detail-row">
              <div className="detail-row-label">Email</div>
              <a
                href={`mailto:${lead.email}`}
                className="detail-row-value"
                style={{ color: 'var(--color-link)' }}
              >
                {lead.email}
              </a>
            </div>
            {lead.phone && (
              <div className="detail-row">
                <div className="detail-row-label">Phone</div>
                <a
                  href={`tel:${lead.phone}`}
                  className="detail-row-value"
                  style={{ color: 'var(--color-link)', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <IconPhone size={12} /> {lead.phone}
                </a>
              </div>
            )}
          </div>

          {/* ── Deal details ──────────────────────────────────────── */}
          <div>
            <div className="detail-section-title">Deal details</div>
            <div className="detail-row">
              <div className="detail-row-label">Expected revenue</div>
              <div className="detail-row-value" style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: 16 }}>
                £{lead.expectedRevenue.toLocaleString()}
              </div>
            </div>
            <div className="detail-row">
              <div className="detail-row-label">Salesperson</div>
              <div className="detail-row-value flex items-center gap-xs">
                <span className="avatar avatar-sm">{spInitials}</span>
                {spName}
              </div>
            </div>
            <div className="detail-row">
              <div className="detail-row-label">Lead source</div>
              <div className="detail-row-value">{lead.source}</div>
            </div>
            <div className="detail-row">
              <div className="detail-row-label">Priority</div>
              <span className={`badge badge-priority-${lead.priority}`} style={{ textTransform: 'capitalize' }}>
                {lead.priority}
              </span>
            </div>
            <div className="detail-row">
              <div className="detail-row-label">Created</div>
              <div className="detail-row-value">
                {new Date(lead.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* ── Notes ─────────────────────────────────────────────── */}
          {lead.notes && (
            <div>
              <div className="detail-section-title">Notes</div>
              <div style={{
                fontSize: 13, color: 'var(--color-body)', lineHeight: 1.6,
                background: 'var(--color-canvas)', border: '1px solid var(--color-hairline)',
                borderRadius: 'var(--r-sm)', padding: 'var(--sp-sm)',
              }}>
                {lead.notes}
              </div>
            </div>
          )}

          {/* ── Email composer ────────────────────────────────────── */}
          <div>
            <div className="detail-section-title" style={{ marginBottom: 'var(--sp-sm)' }}>
              Quick email
            </div>
            {!showEmailCompose ? (
              <button
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'center', height: 36 }}
                onClick={() => {
                  setShowEmailCompose(true);
                  setEmailSubject(`Following up — ${lead.treatment}`);
                  setEmailBody(`Hi ${lead.name.split(' ')[0]},\n\nI wanted to follow up regarding your interest in ${lead.treatment}.\n\nWould you like to book a consultation?\n\nBest regards`);
                }}
              >
                <IconMail /> Compose email to {lead.name.split(' ')[0]}
              </button>
            ) : (
              <div className="email-composer">
                <div style={{ fontSize: 12, color: 'var(--color-mute)', padding: '4px 0' }}>
                  To: <span style={{ color: 'var(--color-ink)' }}>{lead.email}</span>
                </div>
                <input
                  className="text-input"
                  placeholder="Subject"
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                  style={{ fontSize: 13 }}
                />
                <textarea
                  className="text-input"
                  placeholder="Write your message…"
                  value={emailBody}
                  onChange={e => setEmailBody(e.target.value)}
                  style={{ fontSize: 13, minHeight: 110 }}
                />
                <div className="flex gap-xs" style={{ justifyContent: 'flex-end' }}>
                  <button
                    className="btn btn-secondary"
                    style={{ height: 28, fontSize: 12 }}
                    onClick={() => setShowEmailCompose(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    style={{ height: 28, fontSize: 12 }}
                    onClick={handleSend}
                  >
                    <IconSend size={12} /> Send email
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Delete (own leads only) ───────────────────────────── */}
          {canEdit && (
            <div style={{ borderTop: '1px solid var(--color-hairline)', paddingTop: 'var(--sp-lg)', marginTop: 'auto' }}>
              <button
                className="btn btn-danger"
                style={{ width: '100%', justifyContent: 'center', height: 36 }}
                onClick={() => {
                  if (window.confirm(`Delete ${lead.name}? This cannot be undone.`)) {
                    onDelete(lead.id);
                    onClose();
                  }
                }}
              >
                <IconTrash /> Delete lead
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
