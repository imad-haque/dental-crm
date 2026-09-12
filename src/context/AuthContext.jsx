/**
 * AuthContext — Firestore-backed team registry
 *
 * Firestore collection: "team"
 * Document ID: emailToKey(email)  — dots→underscore, @→__at__
 *
 * Doc shape:
 *  { email, name, role, salespersonId, addedAt, isOwner }
 *
 * Session lives in sessionStorage — survives page refresh,
 * isolated per browser context (incognito gets its own session).
 */

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, onSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// ── Helpers ───────────────────────────────────────────────────────────────
function decodeJwt(token) {
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(b64));
  } catch { return null; }
}

// Firestore doc ID from email — must be stable and URL-safe
export function emailToKey(email) {
  return email.trim().toLowerCase()
    .replace(/\./g, '_DOT_')
    .replace(/@/g, '_AT_');
}

// ── Session (sessionStorage — per-tab, not shared with incognito) ─────────
const SESSION_KEY = 'crm_session_v2';

function loadSession() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)) ?? null; }
  catch { return null; }
}
function saveSession(s) {
  if (s) sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
  else   sessionStorage.removeItem(SESSION_KEY);
}

// ── Context ───────────────────────────────────────────────────────────────
const AuthContext = createContext(null);
export function useAuth() { return useContext(AuthContext); }

export function AuthProvider({ children }) {
  const [session,     setSession]     = useState(loadSession);
  const [teamMembers, setTeamMembers] = useState([]);
  const [authError,   setAuthError]   = useState(null);
  const [authLoading, setAuthLoading] = useState(false); // spinner during sign-in only
  // Only show full-page "Connecting" if there is NO existing session
  const [connecting,  setConnecting]  = useState(() => loadSession() === null);

  const teamReadyRef = useRef(false); // true once we have a confirmed Firestore snapshot

  // ── Firestore real-time listener ──────────────────────────────────────
  useEffect(() => {
    const timeout = setTimeout(() => {
      // Hard cap: never block login screen longer than 6s
      setConnecting(false);
    }, 6000);

    const unsub = onSnapshot(
      collection(db, 'team'),
      (snap) => {
        clearTimeout(timeout);
        teamReadyRef.current = true;
        const members = snap.docs.map(d => d.data());
        setTeamMembers(members);
        setConnecting(false);

        // Keep session in sync if admin changed this user's role remotely
        setSession(prev => {
          if (!prev) return prev;
          const fresh = members.find(
            m => m.email.toLowerCase() === prev.email.toLowerCase()
          );
          if (!fresh) return prev; // deleted — keep until they act
          const next = { ...prev, role: fresh.role, salespersonId: fresh.salespersonId ?? null };
          saveSession(next);
          return next;
        });
      },
      (err) => {
        clearTimeout(timeout);
        console.error('Firestore listener error:', err);
        setConnecting(false);
      }
    );

    return () => { clearTimeout(timeout); unsub(); };
  }, []);

  // ── Sign-in ───────────────────────────────────────────────────────────
  const handleGoogleSuccess = useCallback(async (credentialResponse) => {
    const payload = decodeJwt(credentialResponse.credential);
    if (!payload) {
      setAuthError('Could not read Google credentials. Please try again.');
      return;
    }

    const { email, name, picture } = payload;
    const emailLower = email.trim().toLowerCase();
    setAuthError(null);
    setAuthLoading(true);

    try {
      // Always look up the specific doc first — never rely on collection emptiness
      const memberRef  = doc(db, 'team', emailToKey(emailLower));
      const memberSnap = await getDoc(memberRef);

      if (memberSnap.exists()) {
        // Known member — sign them in with their stored role
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
        return;
      }

      // Unknown member — check if the team collection has ANY docs
      // (to decide whether this is the bootstrap first-user)
      const teamSnap   = await getDocs(collection(db, 'team'));
      const isFirstUser = teamSnap.empty;

      if (isFirstUser) {
        // Bootstrap: nobody exists yet → this person becomes owner-admin
        const ownerDoc = {
          email:         emailLower,
          name:          name,
          role:          'admin',
          salespersonId: 'sp1',
          addedAt:       new Date().toISOString().slice(0, 10),
          isOwner:       true,
        };
        await setDoc(memberRef, ownerDoc);
        const newSession = { ...ownerDoc, picture };
        saveSession(newSession);
        setSession(newSession);
      } else {
        // Team exists but this email wasn't invited
        setAuthError(
          `${email} hasn't been added to this CRM. Ask your admin to add you from the Team tab.`
        );
      }
    } catch (err) {
      console.error('Sign-in error code:', err.code);
      console.error('Sign-in error message:', err.message);
      console.error('Sign-in error full:', err);
      if (err.code === 'permission-denied') {
        setAuthError('Database permission denied. Check Firestore rules are published (allow read, write: if true).');
      } else if (err.code === 'unavailable' || err.code === 'failed-precondition') {
        setAuthError('Database unavailable. Wait 1–2 minutes for Firestore to finish setting up, then try again.');
      } else {
        setAuthError(`Sign-in error: ${err.code ?? err.message ?? 'unknown'}. Check the browser console for details.`);
      }
    } finally {
      setAuthLoading(false);
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

  // ── Team management (admin only) ──────────────────────────────────────
  const addTeamMember = useCallback(async ({ email, name, role, salespersonId }) => {
    const emailLower = email.trim().toLowerCase();
    const memberDoc  = {
      email:         emailLower,
      name:          name.trim(),
      role,
      salespersonId: salespersonId || null,
      addedAt:       new Date().toISOString().slice(0, 10),
      isOwner:       false,
    };
    await setDoc(doc(db, 'team', emailToKey(emailLower)), memberDoc);
  }, []);

  const updateTeamMember = useCallback(async (email, updates) => {
    await updateDoc(doc(db, 'team', emailToKey(email)), updates);
  }, []);

  const removeTeamMember = useCallback(async (email) => {
    await deleteDoc(doc(db, 'team', emailToKey(email)));
  }, []);

  return (
    <AuthContext.Provider value={{
      // Session
      session,
      isLoggedIn:    !!session,
      isAdmin:       session?.role === 'admin',
      user:          session,
      role:          session?.role ?? null,
      salespersonId: session?.salespersonId ?? null,

      // Auth actions
      handleGoogleSuccess,
      handleGoogleError,
      signOut,
      authError,
      authLoading,
      clearAuthError: () => setAuthError(null),

      // Team
      teamMembers,
      addTeamMember,
      updateTeamMember,
      removeTeamMember,

      // Loading states
      connecting, // full-page "Connecting" screen (no session yet)
    }}>
      {children}
    </AuthContext.Provider>
  );
}
