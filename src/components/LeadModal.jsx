import { useState, useMemo } from 'react';
import { PIPELINE_STAGES, LEAD_SOURCES, TREATMENTS } from '../data/mockData';
import { COUNTRY_CODES } from '../lib/format';
import { useAuth } from '../context/AuthContext';
import { IconX } from './Icons';

export default function LeadModal({ lead, onSave, onClose }) {
  const { isAdmin, salespersonId, session, teamMembers } = useAuth();
  const isEdit = !!lead;

  // Parse stored phone into countryId + number parts
  function parsePhone(stored) {
    if (!stored) return { countryId: 'IN', number: '' };
    const match = COUNTRY_CODES.find(c => stored.startsWith(c.code));
    if (match) return { countryId: match.id, number: stored.slice(match.code.length).trim() };
    return { countryId: 'IN', number: stored };
  }

  const parsedPhone = parsePhone(lead?.phone);

  // Build salesperson options from real team members who have a salespersonId assigned
  // Each entry: { id: "sp1" (or email), name: "Sarah", initials: "SM" }
  const salespersonOptions = useMemo(() => {
    if (!teamMembers?.length) return [];
    return teamMembers
      .filter(m => m.salespersonId)
      .map(m => ({
        id:       m.salespersonId,   // the sp1/sp2 slot or email used as key
        email:    m.email,
        name:     m.name,
        initials: m.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      }));
  }, [teamMembers]);

  // Default salesperson: for admins use first option, for users use their own
  const defaultSalesperson = isAdmin
    ? (salespersonOptions[0]?.id ?? '')
    : (salespersonId ?? '');

  const [form, setForm] = useState(() => ({
    name:            '',
    email:           '',
    phone:           '',
    treatment:       TREATMENTS[0],
    expectedRevenue: '',
    stage:           'new',
    salesperson:     lead?.salesperson ?? defaultSalesperson,
    source:          LEAD_SOURCES[0],
    notes:           '',
    priority:        'medium',
    ...(lead ?? {}),
  }));

  // Phone is stored as combined string e.g. "+91 98765 43210"
  const [countryId,   setCountryId]   = useState(parsedPhone.countryId);
  const [phoneNumber, setPhoneNumber] = useState(parsedPhone.number);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    // Combine dial code + number into single phone string
    const selectedCountry = COUNTRY_CODES.find(c => c.id === countryId);
    const combinedPhone = phoneNumber ? `${selectedCountry?.code ?? '+91'} ${phoneNumber}` : '';
    onSave({
      ...form,
      phone:           combinedPhone,
      salesperson:     isAdmin ? form.salesperson : (salespersonId ?? form.salesperson),
      id:              lead?.id ?? `lead-${Date.now()}`,
      createdAt:       lead?.createdAt ?? new Date().toISOString().slice(0, 10),
      expectedRevenue: Number(form.expectedRevenue) || 0,
    });
  };

  // Find current user's display name for the locked field
  const myMember = teamMembers?.find(m => m.email === session?.email);
  const myDisplayName = myMember?.name ?? session?.name ?? salespersonId ?? 'You';
  const myInitials = myDisplayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="lead-modal-title">
        <div className="modal-header">
          <h2 className="modal-title" id="lead-modal-title">
            {isEdit ? 'Edit lead' : 'Add new lead'}
          </h2>
          <button className="btn-icon" onClick={onClose} aria-label="Close"><IconX /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* ── Name + Email ─────────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-md)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="lead-name">Full name *</label>
                <input id="lead-name" className="text-input" value={form.name}
                  onChange={e => set('name', e.target.value)} placeholder="Emma Thompson" required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="lead-email">Email *</label>
                <input id="lead-email" className="text-input" type="email" value={form.email}
                  onChange={e => set('email', e.target.value)} placeholder="emma@example.com" required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="lead-phone">Phone</label>
                <div className="phone-field">
                  {/* Custom phone prefix — shows flag+code, full name in dropdown */}
                  <div className="phone-prefix-wrap">
                    <select
                      className="phone-prefix-select"
                      value={countryId}
                      onChange={e => setCountryId(e.target.value)}
                      aria-label="Country code"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.flag} {c.code} {c.name}
                        </option>
                      ))}
                    </select>
                    {/* Visible label — shown on top of the select */}
                    <div className="phone-prefix-label" aria-hidden="true">
                      {COUNTRY_CODES.find(c => c.id === countryId)?.flag ?? '🇮🇳'}
                      {' '}
                      {COUNTRY_CODES.find(c => c.id === countryId)?.code ?? '+91'}
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ marginLeft: 2, flexShrink: 0 }}><path d="M2 4l3 3 3-3"/></svg>
                    </div>
                  </div>
                  <input
                    id="lead-phone"
                    className="text-input phone-number-input"
                    type="tel"
                    value={phoneNumber}
                    onChange={e => {
                      const val = e.target.value.replace(/[^\d\s\-]/g, '');
                      setPhoneNumber(val);
                    }}
                    placeholder="98765 43210"
                    inputMode="numeric"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="lead-revenue">Expected revenue (₹)</label>
                <input
                  id="lead-revenue"
                  className="text-input"
                  type="text"
                  inputMode="numeric"
                  value={form.expectedRevenue}
                  onChange={e => {
                    // Only allow digits
                    const val = e.target.value.replace(/\D/g, '');
                    set('expectedRevenue', val);
                  }}
                  placeholder="e.g. 50000"
                />
              </div>
            </div>

            {/* ── Treatment ────────────────────────────────────────── */}
            <div className="form-group">
              <label className="form-label" htmlFor="lead-treatment">Treatment interest</label>
              <select id="lead-treatment" className="select" style={{ width: '100%' }}
                value={form.treatment} onChange={e => set('treatment', e.target.value)}>
                {TREATMENTS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            {/* ── Stage / Salesperson / Priority ───────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--sp-md)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="lead-stage">Stage</label>
                <select id="lead-stage" className="select" style={{ width: '100%' }}
                  value={form.stage} onChange={e => set('stage', e.target.value)}>
                  {PIPELINE_STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="lead-sp">
                  Salesperson
                  {!isAdmin && <span className="form-locked-badge">locked</span>}
                </label>

                {isAdmin ? (
                  // Admin: full dropdown of all team members who have a salesperson slot
                  salespersonOptions.length > 0 ? (
                    <select id="lead-sp" className="select" style={{ width: '100%' }}
                      value={form.salesperson} onChange={e => set('salesperson', e.target.value)}>
                      {salespersonOptions.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  ) : (
                    <div style={{ fontSize: 12, color: 'var(--color-mute)', padding: '6px 0' }}>
                      No team members with a salesperson profile yet. Add them in the Team tab.
                    </div>
                  )
                ) : (
                  // Non-admin: locked to their own name
                  <div className="locked-field">
                    <span className="avatar avatar-sm">{myInitials}</span>
                    <span>{myDisplayName}</span>
                    <input type="hidden" name="salesperson" value={salespersonId ?? ''} />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="lead-priority">Priority</label>
                <select id="lead-priority" className="select" style={{ width: '100%' }}
                  value={form.priority} onChange={e => set('priority', e.target.value)}>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            {/* ── Source ───────────────────────────────────────────── */}
            <div className="form-group">
              <label className="form-label" htmlFor="lead-source">Lead source</label>
              <select id="lead-source" className="select" style={{ width: '100%' }}
                value={form.source} onChange={e => set('source', e.target.value)}>
                {LEAD_SOURCES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            {/* ── Notes ────────────────────────────────────────────── */}
            <div className="form-group">
              <label className="form-label" htmlFor="lead-notes">Notes</label>
              <textarea id="lead-notes" className="text-input" value={form.notes}
                onChange={e => set('notes', e.target.value)}
                placeholder="Add any notes about this lead…" />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {isEdit ? 'Save changes' : 'Add lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
