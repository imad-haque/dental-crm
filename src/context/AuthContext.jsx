/**
 * AuthContext
 *
 * Responsibilities:
 *  1. Decode the Google credential JWT on login
 *  2. Look up the signed-in email against the team member registry
 *  3. Expose { user, role, salespersonId, teamMembers } to the whole app
 *  4. Persist team member registry in localStorage so admin assignments survive reloads
 *
 * Team member registry shape (stored in localStorage key "crm_team"):
 *  [
 *    {
 *      email: "sarah@example.com",
 *      role: "admin" | "user",
 *      salespersonId: "sp1" | "sp2" | "sp3" | "sp4" | null,
 *      name: "Sarah Mitchell",       // editable display name
 *      addedAt: "2026-09-11",
 *    },
 *    ...
 *  ]
 *
 * The very first person to sign in becomes the owner-admin automatically if
 * no registry exists yet (bootstrap flow).
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';

// ── JWT decode (no validation needed — Google already validated it) ─────────
function decodeJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

// ── localStorage helpers ──────────────────────────────────────────────────
const TEAM_KEY = 'crm_team';
const SESSION_KEY = 'crm_session';

function loadTeam() {
  try {
    const raw = localStorage.getItem(TEAM_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTeam(team) {
  localStorage.setItem(TEAM_KEY, JSON.stringify(team));
}

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(session) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
}

// ── Context ───────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [teamMembers, setTeamMembersState] = useState(loadTeam);
  const [session, setSession] = useState(loadSession);   // { email, name, picture, role, salespersonId }
  const [authError, setAuthError] = useState(null);

  // Keep localStorage in sync whenever teamMembers changes
  const setTeamMembers = useCallback((updater) => {
    setTeamMembersState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveTeam(next);
      return next;
    });
  }, []);

  // ── Sign-in handler (called by @react-oauth/google onSuccess) ──────────
  const handleGoogleSuccess = useCallback((credentialResponse) => {
    const payload = decodeJwt(credentialResponse.credential);
    if (!payload) {
      setAuthError('Failed to read Google sign-in response. Please try again.');
      return;
    }

    const { email, name, picture } = payload;
    const team = loadTeam(); // fresh read — team may have changed

    // Bootstrap: if no team exists yet, make this first user the owner-admin
    if (team.length === 0) {
      const bootstrapMember = {
        email,
        name,
        role: 'admin',
        salespersonId: 'sp1',
        addedAt: new Date().toISOString().slice(0, 10),
        isOwner: true,
      };
      const newTeam = [bootstrapMember];
      saveTeam(newTeam);
      setTeamMembersState(newTeam);

      const newSession = { email, name, picture, role: 'admin', salespersonId: 'sp1', isOwner: true };
      saveSession(newSession);
      setSession(newSession);
      setAuthError(null);
      return;
    }

    // Look up this email in the team registry
    const member = team.find(m => m.email.toLowerCase() === email.toLowerCase());
    if (!member) {
      setAuthError(`${email} has not been added to this CRM. Ask your admin to add you.`);
      return;
    }

    const newSession = {
      email: member.email,
      name: member.name || name,
      picture,
      role: member.role,
      salespersonId: member.salespersonId,
      isOwner: !!member.isOwner,
    };
    saveSession(newSession);
    setSession(newSession);
    setAuthError(null);
  }, []);

  const handleGoogleError = useCallback(() => {
    setAuthError('Google sign-in was cancelled or failed. Please try again.');
  }, []);

  const signOut = useCallback(() => {
    saveSession(null);
    setSession(null);
    setAuthError(null);
  }, []);

  // ── Team management (admin only) ──────────────────────────────────────
  const addTeamMember = useCallback(({ email, name, role, salespersonId }) => {
    setTeamMembers(prev => {
      if (prev.find(m => m.email.toLowerCase() === email.toLowerCase())) return prev;
      return [
        ...prev,
        {
          email: email.trim().toLowerCase(),
          name: name.trim(),
          role,
          salespersonId: salespersonId || null,
          addedAt: new Date().toISOString().slice(0, 10),
          isOwner: false,
        },
      ];
    });
  }, [setTeamMembers]);

  const updateTeamMember = useCallback((email, updates) => {
    setTeamMembers(prev =>
      prev.map(m =>
        m.email.toLowerCase() === email.toLowerCase() ? { ...m, ...updates } : m
      )
    );
    // If the currently signed-in user's own record was updated, refresh session
    setSession(prev => {
      if (!prev || prev.email.toLowerCase() !== email.toLowerCase()) return prev;
      const updated = { ...prev, ...updates };
      saveSession(updated);
      return updated;
    });
  }, [setTeamMembers]);

  const removeTeamMember = useCallback((email) => {
    setTeamMembers(prev => prev.filter(m => m.email.toLowerCase() !== email.toLowerCase()));
  }, [setTeamMembers]);

  // ── Derived helpers ──────────────────────────────────────────────────
  const isAdmin = session?.role === 'admin';
  const isLoggedIn = !!session;

  return (
    <AuthContext.Provider value={{
      // Session
      session,
      isLoggedIn,
      isAdmin,
      user: session,                      // alias
      role: session?.role ?? null,
      salespersonId: session?.salespersonId ?? null,

      // Auth actions
      handleGoogleSuccess,
      handleGoogleError,
      signOut,
      authError,
      clearAuthError: () => setAuthError(null),

      // Team management
      teamMembers,
      addTeamMember,
      updateTeamMember,
      removeTeamMember,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
