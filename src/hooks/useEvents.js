/**
 * useEvents — Firestore-backed calendar events
 *
 * Collection: "events"
 * Doc ID: dateKey  (e.g. "2026-09-11")
 * Doc shape: { dateKey: "2026-09-11", events: [ { id, title, type, time }, ... ] }
 *
 * Each day is one document containing an array of events.
 * Seeds with mock calendar data on first run.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  collection, doc, setDoc, updateDoc, onSnapshot,
  writeBatch, getDocs, arrayUnion, arrayRemove,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { initialCalendarEvents } from '../data/mockData';

export function useEvents() {
  const [events,      setEvents]      = useState({});
  const [eventsReady, setEventsReady] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'events'),
      async (snap) => {
        if (snap.empty && !eventsReady) {
          // Seed with mock calendar data
          try {
            const batch = writeBatch(db);
            Object.entries(initialCalendarEvents).forEach(([dateKey, evList]) => {
              batch.set(doc(db, 'events', dateKey), { dateKey, events: evList });
            });
            await batch.commit();
          } catch (err) {
            console.error('Failed to seed events:', err);
            setEvents(initialCalendarEvents);
            setEventsReady(true);
          }
          return;
        }

        // Rebuild the { dateKey: eventsArray } shape the UI expects
        const map = {};
        snap.docs.forEach(d => {
          const data = d.data();
          map[data.dateKey] = data.events ?? [];
        });
        setEvents(map);
        setEventsReady(true);
      },
      (err) => {
        console.error('Events listener error:', err);
        setEvents(initialCalendarEvents);
        setEventsReady(true);
      }
    );

    return unsub;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const addEvent = useCallback(async (dateKey, event) => {
    const ref = doc(db, 'events', dateKey);
    try {
      await updateDoc(ref, { events: arrayUnion(event) });
    } catch {
      // Doc doesn't exist yet — create it
      await setDoc(ref, { dateKey, events: [event] });
    }
  }, []);

  const deleteEvent = useCallback(async (dateKey, eventId) => {
    const currentEvents = events[dateKey] ?? [];
    const target = currentEvents.find(e => e.id === eventId);
    if (!target) return;
    await updateDoc(doc(db, 'events', dateKey), { events: arrayRemove(target) });
  }, [events]);

  return { events, eventsReady, addEvent, deleteEvent };
}
