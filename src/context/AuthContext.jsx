/**
 * AuthContext — Firestore-backed team registry
 *
 * Team members are stored in Firestore collection "team", one doc per member,
 * keyed by sanitised email (dots replaced with underscores so Firestore accepts it).
 *
 * Doc shape:
 *  {
 *    email:         "sarah@gmail.com",
 *    name:          "Sarah Mitchell",
 *    role:          "admin" | "user",
 *    salespersonId: "sp1" | "sp2" | "sp3" | "sp4" | null,
 *    addedAt:       "2026-09-11",
 *    isOwner:       true | false,
 *  }
 *
 * Session (who is currently logged in) is kept in sessionStorage so it
 * survives page refreshes but NOT incognito isolation — which is exactly
 * what we want: each browser context signs in independently.
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, onSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// ── JWT decode ────────────────────────────────────────────────────────────
function decodeJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

// ── Firestore key: sanitise email for use as doc ID ───────────────────────
function emailToKey(email) {
  return email.trim().toLowerCase().replace(/\./g, '_').replace(/@/g, '__at__');
}

// ── Session stored in sessionStorage (survives refresh, not incognito) ────
const SESSION_KEY = 'crm_session';

function loadSession() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)); } catch { return null; }
}
function saveSession(s) {
  if (s) sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
  else sessionStorage.removeItem(SESSION_KEY);
}

// ── Context ───────────────────────────────────────────────────────────────
const AuthContext = createContext(null);
export function useAuth() { return useContext(AuthContext); }

export function AuthProvider({ children }) {
  const [session, setSession]         = useState(loadSession);
  const [teamMembers, setTeamMembers] = useState([]);
  const [authError, setAuthError]     = useState(null);
  const [loading, setLoading]         = useState(true); // waiting for Firestore

  // ── Real-time team listener ───────────────────────────────────────────
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'team'), (snap) => {
      const members = snap.docs.map(d => d.data());
      setTeamMembers(members);
      setLoading(false);

      // If the signed-in user's record was updated remotely, refresh session
      setSession(prev => {
        if (!prev) return prev;
        const updated = members.find(m => m.email.toLowerCase() === prev.email.toLowerCase());
        if (!updated) return prev; // member was deleted — keep session until next action
        const next = { ...prev, role: updated.role, salespersonId: updated.salesperson ?? updated.salespersonId ?? null };
        saveSession(next);
        return next;
      });
    }, (err) => {
      console.error('Firestore team listener error:', err);
      setLoading(false);
    });
    return unsub;
  }, []);

  // ── Sign-in ───────────────────────────────────────────────────────────
  const handleGoogleSuccess = useCallback(async (credentialResponse) => {
    const payload = decodeJwt(credentialResponse.credential);
    if (!payload) { setAuthError('Failed to read Google sign-in. Please try again.'); return; }

    const { email, name, picture } = payload;
    setAuthError(null);

    try {
      const teamSnap = await getDocs(collection(db, 'team'));
      const isFirstUser = teamSnap.empty;

      if (isFirstUser) {
        // Bootstrap: first sign-in becomes owner-admin
        const ownerDoc = {
          email: email.toLowerCase(),
          name,
          role: 'admin',
          salespersonId: 'sp1',
          addedAt: new Date().toISOString().slice(0, 10),
          isOwner: true,
        };
        await setDoc(doc(db, 'team', emailToKey(email)), ownerDoc);
        const newSession = { email: email.toLowerCase(), name, picture, role: 'admin', salespersonId: 'sp1', isOwner: true };
        saveSession(newSession);
        setSession(newSession);
        return;
      }

      // Look up this email in Firestore
      const memberSnap = await getDoc(doc(db, 'team', emailToKey(email)));
      if (!memberSnap.exists()) {
        setAuthError(`${email} has not been added to this CRM. Ask your admin to add you.`);
        return;
      }

      const member = memberSnap.data();
      const newSession = {
        email:         member.email,
        name:          member.name || name,
        picture,
        role:          member.role,
        salespersonId: member.salespersonId ?? null,
        isOwner:       !!member.isOwner,
      };
      saveSession(newSession);
      setSession(newSession);
    } catch (err) {
      console.error('Sign-in error:', err);
      setAuthError('Sign-in failed. Check your connection and try again.');
    }
  }, []);

  const handleGoogleError = useCallback(() => {
    setAuthError('Google sign-in was cancelled or failed. Please try again.');
  }, []);

  const signOut = useCallback(() => {
    saveSession(null);
    setSession(null);
    setAuthError(null);
  }, []);

  // ── Team management ───────────────────────────────────────────────────
  const addTeamMember = useCallback(async ({ email, name, role, salespersonId }) => {
    const memberDoc = {
      email:         email.trim().toLowerCase(),
      name:          name.trim(),
      role,
      salespersonId: salespersonId || null,
      addedAt:       new Date().toISOString().slice(0, 10),
      isOwner:       false,
    };
    await setDoc(doc(db, 'team', emailToKey(email)), memberDoc);
  }, []);

  const updateTeamMember = useCallback(async (email, updates) => {
    await updateDoc(doc(db, 'team', emailToKey(email)), updates);
  }, []);

  const removeTeamMember = useCallback(async (email) => {
    await deleteDoc(doc(db, 'team', emailToKey(email)));
  }, []);

  return (
    <AuthContext.Provider value={{
      session,
      isLoggedIn:    !!session,
      isAdmin:       session?.role === 'admin',
      user:          session,
      role:          session?.role ?? null,
      salespersonId: session?.salespersonId ?? null,

      handleGoogleSuccess,
      handleGoogleError,
      signOut,
      authError,
      clearAuthError: () => setAuthError(null),

      teamMembers,
      addTeamMember,
      updateTeamMember,
      removeTeamMember,

      loading, // true while initial Firestore fetch is in flight
    }}>
      {children}
    </AuthContext.Provider>
  );
}
