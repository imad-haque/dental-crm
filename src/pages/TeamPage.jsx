import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SALESPERSONS } from '../data/mockData';
import { IconPlus, IconX, IconEdit, IconTrash } from '../components/Icons';
import { useToast } from '../components/Toast';

const ROLES = [
  { value: 'admin', label: 'Admin', description: 'Full access — add/remove team, edit all leads' },
  { value: 'user',  label: 'User',  description: 'Can only view and edit their own assigned leads' },
];

function RoleBadge({ role }) {
  return (
    <span className={`badge ${role === 'admin' ? 'badge-role-admin' : 'badge-role-user'}`}>
      {role === 'admin' ? 'Admin' : 'User'}
    </span>
  );
}

function AddMemberModal({ onSave, onClose, existing }) {
  const [email, setEmail]             = useState('');
  const [name, setName]               = useState('');
  const [role, setRole]               = useState('user');
  const [salespersonId, setSalesperson] = useState('');
  const [error, setError]             = useState('');

  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateEmail(email)) { setError('Enter a valid email address.'); return; }
    if (!name.trim()) { setError('Enter the team member\'s name.'); return; }
    if (existing.find(m => m.email.toLowerCase() === email.trim().toLowerCase())) {
      setError('That email is already in the team.'); return;
    }
    setError('');
    onSave({ email: email.trim().toLowerCase(), name: name.trim(), role, salespersonId: salespersonId || null });
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="add-member-title">
        <div className="modal-header">
          <h2 className="modal-title" id="add-member-title">Add team member</h2>
          <button className="btn-icon" onClick={onClose} aria-label="Close"><IconX /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="form-error" role="alert">{error}</div>
            )}
            <div className="form-group">
              <label className="form-label" htmlFor="tm-name">Full name *</label>
              <input id="tm-name" className="text-input" value={name} onChange={e => setName(e.target.value)} placeholder="Sarah Mitchell" required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="tm-email">Gmail address *</label>
              <input id="tm-email" className="text-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="sarah@gmail.com" required />
              <span className="form-hint">They must sign in with exactly this Gmail account.</span>
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <div className="role-options">
                {ROLES.map(r => (
                  <label key={r.value} className={`role-option ${role === r.value ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="role"
                      value={r.value}
                      checked={role === r.value}
                      onChange={() => setRole(r.value)}
                      style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                    />
                    <div className="role-option-top">
                      <span className="role-option-label">{r.label}</span>
                      <RoleBadge role={r.value} />
                    </div>
                    <div className="role-option-desc">{r.description}</div>
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="tm-sp">Assign salesperson profile</label>
              <select id="tm-sp" className="select" style={{ width: '100%' }} value={salespersonId} onChange={e => setSalesperson(e.target.value)}>
                <option value="">— None (admin/no pipeline access) —</option>
                {SALESPERSONS.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                ))}
              </select>
              <span className="form-hint">
                Links this person's login to a salesperson slot so their leads appear correctly.
              </span>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Add member</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditMemberModal({ member, onSave, onClose }) {
  const [name, setName]               = useState(member.name);
  const [role, setRole]               = useState(member.role);
  const [salespersonId, setSalesperson] = useState(member.salespersonId || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name: name.trim(), role, salespersonId: salespersonId || null });
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="edit-member-title">
        <div className="modal-header">
          <h2 className="modal-title" id="edit-member-title">Edit {member.name}</h2>
          <button className="btn-icon" onClick={onClose} aria-label="Close"><IconX /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="edit-tm-name">Display name</label>
              <input id="edit-tm-name" className="text-input" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div style={{ padding: 'var(--sp-xs) var(--sp-sm)', background: 'var(--color-canvas)', borderRadius: 'var(--r-sm)', border: '1px solid var(--color-hairline)', fontSize: 13, color: 'var(--color-mute)' }}>
              Gmail: <span style={{ color: 'var(--color-ink)', fontWeight: 500 }}>{member.email}</span>
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <div className="role-options">
                {ROLES.map(r => (
                  <label key={r.value} className={`role-option ${role === r.value ? 'selected' : ''}`}>
                    <input type="radio" name="edit-role" value={r.value} checked={role === r.value} onChange={() => setRole(r.value)} style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }} />
                    <div className="role-option-top">
                      <span className="role-option-label">{r.label}</span>
                      <RoleBadge role={r.value} />
                    </div>
                    <div className="role-option-desc">{r.description}</div>
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="edit-tm-sp">Salesperson profile</label>
              <select id="edit-tm-sp" className="select" style={{ width: '100%' }} value={salespersonId} onChange={e => setSalesperson(e.target.value)}>
                <option value="">— None —</option>
                {SALESPERSONS.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TeamPage() {
  const toast = useToast();
  const { teamMembers, addTeamMember, updateTeamMember, removeTeamMember, session } = useAuth();
  const [showAdd, setShowAdd]   = useState(false);
  const [editing, setEditing]   = useState(null);

  const handleAdd = (data) => {
    addTeamMember(data);
    setShowAdd(false);
    toast(`${data.name} added to team`);
  };

  const handleEdit = (data) => {
    updateTeamMember(editing.email, data);
    setEditing(null);
    toast(`${data.name} updated`);
  };

  const handleRemove = (member) => {
    if (member.isOwner) {
      toast('The owner account cannot be removed', 'error');
      return;
    }
    if (member.email === session?.email) {
      toast('You cannot remove yourself', 'error');
      return;
    }
    if (window.confirm(`Remove ${member.name} (${member.email}) from the team? They will lose access immediately.`)) {
      removeTeamMember(member.email);
      toast(`${member.name} removed from team`, 'error');
    }
  };

  const spName = (id) => id ? (SALESPERSONS.find(s => s.id === id)?.name ?? id) : '—';
  const initials = (name) => name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? '?';

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Team</div>
          <div className="page-subtitle">{teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''} · Manage access and roles</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <IconPlus /> Add member
        </button>
      </div>

      <div className="page-body">
        {/* Access level explainer */}
        <div className="team-explainer">
          <div className="team-explainer-row">
            <span className="badge badge-role-admin">Admin</span>
            <span>Full access — view and edit all leads, manage team members, see all analytics</span>
          </div>
          <div className="team-explainer-row">
            <span className="badge badge-role-user">User</span>
            <span>Restricted — can only view, add, and edit leads assigned to their own salesperson profile</span>
          </div>
        </div>

        {/* Members table */}
        <div className="table-wrap" style={{ marginTop: 'var(--sp-lg)' }}>
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Gmail</th>
                <th>Role</th>
                <th>Salesperson profile</th>
                <th>Added</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.map(member => (
                <tr key={member.email}>
                  <td>
                    <div className="flex items-center gap-xs">
                      <span className="avatar avatar-sm">{initials(member.name)}</span>
                      <div>
                        <div className="td-name">
                          {member.name}
                          {member.email === session?.email && (
                            <span style={{ fontSize: 11, color: 'var(--color-mute)', marginLeft: 6, fontWeight: 400 }}>you</span>
                          )}
                          {member.isOwner && (
                            <span style={{ fontSize: 11, color: 'var(--color-mute)', marginLeft: 6, fontWeight: 400 }}>owner</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td><span className="td-email">{member.email}</span></td>
                  <td><RoleBadge role={member.role} /></td>
                  <td>
                    {member.salespersonId ? (
                      <div className="flex items-center gap-xs">
                        <span className="avatar avatar-sm">
                          {SALESPERSONS.find(s => s.id === member.salespersonId)?.avatar ?? '?'}
                        </span>
                        <span style={{ fontSize: 13 }}>{spName(member.salespersonId)}</span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--color-faint)', fontSize: 13 }}>—</span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: 12, color: 'var(--color-mute)' }}>
                      {member.addedAt ? new Date(member.addedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-xs" style={{ justifyContent: 'flex-end' }}>
                      <button
                        className="btn-icon"
                        title="Edit member"
                        onClick={() => setEditing(member)}
                        aria-label={`Edit ${member.name}`}
                      >
                        <IconEdit size={13} />
                      </button>
                      <button
                        className="btn-icon"
                        title="Remove member"
                        onClick={() => handleRemove(member)}
                        aria-label={`Remove ${member.name}`}
                        disabled={member.isOwner || member.email === session?.email}
                        style={{ opacity: (member.isOwner || member.email === session?.email) ? 0.35 : 1 }}
                      >
                        <IconTrash size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <AddMemberModal
          existing={teamMembers}
          onSave={handleAdd}
          onClose={() => setShowAdd(false)}
        />
      )}

      {editing && (
        <EditMemberModal
          member={editing}
          onSave={handleEdit}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
