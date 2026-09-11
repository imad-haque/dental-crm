import { useState } from 'react';
import { SALESPERSONS, PIPELINE_STAGES, LEAD_SOURCES, TREATMENTS } from '../data/mockData';
import { IconX } from './Icons';

export default function LeadModal({ lead, onSave, onClose }) {
  const isEdit = !!lead;
  const [form, setForm] = useState(
    lead || {
      name: '',
      email: '',
      phone: '',
      treatment: TREATMENTS[0],
      expectedRevenue: '',
      stage: 'new',
      salesperson: 'sp1',
      source: LEAD_SOURCES[0],
      notes: '',
      priority: 'medium',
    }
  );

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    onSave({
      ...form,
      id: lead?.id || `lead-${Date.now()}`,
      createdAt: lead?.createdAt || new Date().toISOString().slice(0, 10),
      expectedRevenue: Number(form.expectedRevenue) || 0,
    });
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <h2 className="modal-title" id="modal-title">{isEdit ? 'Edit lead' : 'Add new lead'}</h2>
          <button className="btn-icon" onClick={onClose} aria-label="Close"><IconX /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-md)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="lead-name">Full name *</label>
                <input id="lead-name" className="text-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Emma Thompson" required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="lead-email">Email *</label>
                <input id="lead-email" className="text-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="emma@example.com" required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="lead-phone">Phone</label>
                <input id="lead-phone" className="text-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+44 7700 000000" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="lead-revenue">Expected revenue (£)</label>
                <input id="lead-revenue" className="text-input" type="number" min="0" value={form.expectedRevenue} onChange={e => set('expectedRevenue', e.target.value)} placeholder="0" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="lead-treatment">Treatment interest</label>
              <select id="lead-treatment" className="select" style={{ width: '100%' }} value={form.treatment} onChange={e => set('treatment', e.target.value)}>
                {TREATMENTS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--sp-md)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="lead-stage">Stage</label>
                <select id="lead-stage" className="select" style={{ width: '100%' }} value={form.stage} onChange={e => set('stage', e.target.value)}>
                  {PIPELINE_STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="lead-sp">Salesperson</label>
                <select id="lead-sp" className="select" style={{ width: '100%' }} value={form.salesperson} onChange={e => set('salesperson', e.target.value)}>
                  {SALESPERSONS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="lead-priority">Priority</label>
                <select id="lead-priority" className="select" style={{ width: '100%' }} value={form.priority} onChange={e => set('priority', e.target.value)}>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="lead-source">Lead source</label>
              <select id="lead-source" className="select" style={{ width: '100%' }} value={form.source} onChange={e => set('source', e.target.value)}>
                {LEAD_SOURCES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="lead-notes">Notes</label>
              <textarea id="lead-notes" className="text-input" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Add any notes about this lead…" />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{isEdit ? 'Save changes' : 'Add lead'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
