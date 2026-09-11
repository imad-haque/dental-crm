import { useState } from 'react';
import { SALESPERSONS, PIPELINE_STAGES } from '../data/mockData';
import { IconX, IconMail, IconPhone, IconDollar, IconSend, IconEdit, IconTrash } from './Icons';

function stageBadgeClass(stage) {
  return `badge badge-stage-${stage}`;
}

export default function LeadDetailPanel({ lead, onClose, onStageChange, onEdit, onDelete, onEmailSent }) {
  const [showEmailCompose, setShowEmailCompose] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const sp = SALESPERSONS.find(s => s.id === lead.salesperson);

  const handleSend = () => {
    if (!emailSubject || !emailBody) return;
    setEmailSent(true);
    setShowEmailCompose(false);
    setEmailSubject('');
    setEmailBody('');
    onEmailSent?.({ to: lead.email, subject: emailSubject, body: emailBody });
    setTimeout(() => setEmailSent(false), 3000);
  };

  return (
    <div className="detail-panel-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="detail-panel" role="dialog" aria-modal="true" aria-label={`Lead: ${lead.name}`}>
        <div className="detail-panel-header">
          <div>
            <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--color-ink)', letterSpacing: '-0.3px' }}>{lead.name}</div>
            <div style={{ fontSize: 12, color: 'var(--color-mute)', marginTop: 2 }}>{lead.treatment}</div>
          </div>
          <div className="flex gap-xs items-center">
            <button className="btn btn-secondary" style={{ height: 28, fontSize: 13 }} onClick={() => onEdit(lead)}>
              <IconEdit /> Edit
            </button>
            <button className="btn-icon" onClick={onClose} aria-label="Close panel"><IconX /></button>
          </div>
        </div>

        <div className="detail-panel-body">
          {/* Stage selector */}
          <div>
            <div className="detail-section-title">Pipeline stage</div>
            <div className="stage-selector">
              {PIPELINE_STAGES.map(s => (
                <button
                  key={s.id}
                  className={`stage-btn ${lead.stage === s.id ? 'active' : ''}`}
                  onClick={() => onStageChange(lead.id, s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contact info */}
          <div>
            <div className="detail-section-title">Contact</div>
            <div className="detail-row">
              <div className="detail-row-label">Email</div>
              <a href={`mailto:${lead.email}`} className="detail-row-value" style={{ color: 'var(--color-link)' }}>{lead.email}</a>
            </div>
            <div className="detail-row">
              <div className="detail-row-label">Phone</div>
              <div className="detail-row-value">{lead.phone || '—'}</div>
            </div>
          </div>

          {/* Deal info */}
          <div>
            <div className="detail-section-title">Deal details</div>
            <div className="detail-row">
              <div className="detail-row-label">Expected revenue</div>
              <div className="detail-row-value" style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                £{lead.expectedRevenue.toLocaleString()}
              </div>
            </div>
            <div className="detail-row">
              <div className="detail-row-label">Salesperson</div>
              <div className="detail-row-value flex items-center gap-xs">
                <span className="avatar avatar-sm">{sp?.avatar}</span>
                {sp?.name}
              </div>
            </div>
            <div className="detail-row">
              <div className="detail-row-label">Lead source</div>
              <div className="detail-row-value">{lead.source}</div>
            </div>
            <div className="detail-row">
              <div className="detail-row-label">Priority</div>
              <span className={`badge badge-priority-${lead.priority}`} style={{ textTransform: 'capitalize' }}>{lead.priority}</span>
            </div>
            <div className="detail-row">
              <div className="detail-row-label">Created</div>
              <div className="detail-row-value">{new Date(lead.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>
          </div>

          {/* Notes */}
          {lead.notes && (
            <div>
              <div className="detail-section-title">Notes</div>
              <div style={{ fontSize: 13, color: 'var(--color-body)', lineHeight: 1.6, background: 'var(--color-canvas)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--r-sm)', padding: 'var(--sp-sm)' }}>
                {lead.notes}
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <div className="flex items-center justify-between" style={{ marginBottom: 'var(--sp-sm)' }}>
              <div className="detail-section-title" style={{ marginBottom: 0 }}>Quick email</div>
              {emailSent && <span style={{ fontSize: 12, color: 'var(--color-success)' }}>✓ Sent</span>}
            </div>
            {!showEmailCompose ? (
              <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', height: 36 }} onClick={() => { setShowEmailCompose(true); setEmailSubject(`Following up — ${lead.treatment}`); }}>
                <IconMail /> Compose email to {lead.name.split(' ')[0]}
              </button>
            ) : (
              <div className="email-composer">
                <div style={{ fontSize: 12, color: 'var(--color-mute)' }}>To: <span style={{ color: 'var(--color-ink)' }}>{lead.email}</span></div>
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
                  style={{ fontSize: 13, minHeight: 90 }}
                />
                <div className="flex gap-xs" style={{ justifyContent: 'flex-end' }}>
                  <button className="btn btn-secondary" style={{ height: 28, fontSize: 12 }} onClick={() => setShowEmailCompose(false)}>Cancel</button>
                  <button className="btn btn-primary" style={{ height: 28, fontSize: 12 }} onClick={handleSend}>
                    <IconSend size={12} /> Send
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Danger zone */}
          <div style={{ borderTop: '1px solid var(--color-hairline)', paddingTop: 'var(--sp-lg)', marginTop: 'auto' }}>
            <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center', height: 36 }} onClick={() => { if (window.confirm(`Delete ${lead.name}?`)) { onDelete(lead.id); onClose(); } }}>
              <IconTrash /> Delete lead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
