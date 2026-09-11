/**
 * useLeads — Firestore-backed leads store
 *
 * Collection: "leads"
 * Doc ID: lead.id  (e.g. "lead-1", "lead-1748293847362")
 *
 * On first load, if the collection is empty, seeds it with the mock data
 * so the app looks populated out of the box.
 *
 * Real-time onSnapshot keeps every browser tab in sync automatically.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  collection, doc, setDoc, updateDoc, deleteDoc,
  onSnapshot, writeBatch, getDocs,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { initialLeads } from '../data/mockData';

export function useLeads() {
  const [leads,       setLeads]       = useState([]);
  const [leadsReady,  setLeadsReady]  = useState(false); // true once first snapshot arrives

  // ── Real-time listener ──────────────────────────────────────────────
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'leads'),
      async (snap) => {
        if (snap.empty && !leadsReady) {
          // Seed Firestore with mock data on first run
          try {
            const batch = writeBatch(db);
            initialLeads.forEach(lead => {
              batch.set(doc(db, 'leads', lead.id), lead);
            });
            await batch.commit();
            // The snapshot listener will fire again with the seeded data
          } catch (err) {
            console.error('Failed to seed leads:', err);
            // Fall back to local mock data so the UI isn't empty
            setLeads(initialLeads);
            setLeadsReady(true);
          }
          return;
        }

        const freshLeads = snap.docs.map(d => d.data());
        // Sort by createdAt descending so newest leads appear first
        freshLeads.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
        setLeads(freshLeads);
        setLeadsReady(true);
      },
      (err) => {
        console.error('Leads listener error:', err);
        // Fall back gracefully — show mock data rather than blank screen
        setLeads(initialLeads);
        setLeadsReady(true);
      }
    );

    return unsub;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── CRUD ────────────────────────────────────────────────────────────
  const addLead = useCallback(async (lead) => {
    await setDoc(doc(db, 'leads', lead.id), lead);
  }, []);

  const updateLead = useCallback(async (updated) => {
    await updateDoc(doc(db, 'leads', updated.id), updated);
  }, []);

  const deleteLead = useCallback(async (id) => {
    await deleteDoc(doc(db, 'leads', id));
  }, []);

  return { leads, leadsReady, addLead, updateLead, deleteLead };
}
