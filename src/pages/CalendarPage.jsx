import { useState } from 'react';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths
} from 'date-fns';
import { IconChevronLeft, IconChevronRight, IconPlus, IconX } from '../components/Icons';

const EVENT_TYPES = ['call', 'meeting', 'appointment', 'task'];

function EventTypebadge({ type }) {
  return <span className={`badge badge-event-${type}`} style={{ textTransform: 'capitalize' }}>{type}</span>;
}

function AddEventModal({ date, onSave, onClose }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('call');
  const [time, setTime] = useState('09:00');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ id: `ev-${Date.now()}`, title: title.trim(), type, time });
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="ev-modal-title">
        <div className="modal-header">
          <h2 className="modal-title" id="ev-modal-title">Add event — {format(date, 'EEEE, d MMMM')}</h2>
          <button className="btn-icon" onClick={onClose} aria-label="Close"><IconX /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="ev-title">Event title *</label>
              <input id="ev-title" className="text-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Call Emma Thompson" autoFocus required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-md)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="ev-type">Type</label>
                <select id="ev-type" className="select" style={{ width: '100%' }} value={type} onChange={e => setType(e.target.value)}>
                  {EVENT_TYPES.map(t => <option key={t} value={t} style={{ textTransform: 'capitalize' }}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="ev-time">Time</label>
                <input id="ev-time" className="text-input" type="time" value={time} onChange={e => setTime(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Add event</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CalendarPage({ events, onAddEvent, onDeleteEvent }) {
  const today = new Date(2026, 8, 11); // Sept 11 2026 — matches app date
  const [currentMonth, setCurrentMonth] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);
  const [showModal, setShowModal] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const dateKey = (d) => format(d, 'yyyy-MM-dd');
  const selectedKey = dateKey(selectedDate);
  const selectedEvents = (events[selectedKey] || []).slice().sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Calendar</div>
          <div className="page-subtitle">Track follow-ups, appointments, and team tasks</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <IconPlus /> Add event
        </button>
      </div>

      <div className="page-body">
        <div className="calendar-layout">
          {/* Calendar grid */}
          <div className="calendar-grid-wrap">
            {/* Month nav */}
            <div className="calendar-nav">
              <button className="btn-icon" onClick={() => setCurrentMonth(m => subMonths(m, 1))} aria-label="Previous month">
                <IconChevronLeft />
              </button>
              <span className="calendar-month-title">{format(currentMonth, 'MMMM yyyy')}</span>
              <button className="btn-icon" onClick={() => setCurrentMonth(m => addMonths(m, 1))} aria-label="Next month">
                <IconChevronRight />
              </button>
            </div>

            {/* Weekday headers */}
            <div className="calendar-weekdays">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                <div key={d} className="calendar-weekday">{d}</div>
              ))}
            </div>

            {/* Day cells */}
            <div className="calendar-days">
              {days.map(day => {
                const key = dateKey(day);
                const dayEvents = events[key] || [];
                const isToday = isSameDay(day, today);
                const isSelected = isSameDay(day, selectedDate);
                const isOtherMonth = !isSameMonth(day, currentMonth);

                return (
                  <div
                    key={key}
                    className={`calendar-day ${isOtherMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isSelected && !isToday ? 'selected' : ''}`}
                    onClick={() => setSelectedDate(day)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedDate(day)}
                    aria-label={`${format(day, 'EEEE d MMMM')}${dayEvents.length ? `, ${dayEvents.length} event${dayEvents.length !== 1 ? 's' : ''}` : ''}`}
                  >
                    <div className="cal-date">{format(day, 'd')}</div>
                    <div className="cal-events">
                      {dayEvents.slice(0, 2).map(ev => (
                        <div key={ev.id} className="cal-event-dot" title={ev.title}>{ev.title}</div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="cal-event-dot" style={{ color: 'var(--color-mute)' }}>+{dayEvents.length - 2} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Event sidebar */}
          <div className="event-sidebar">
            <div className="event-sidebar-header">
              <div className="event-sidebar-date">{format(selectedDate, 'EEEE, d MMMM')}</div>
              <div style={{ fontSize: 12, color: 'var(--color-mute)', marginTop: 2 }}>
                {selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="event-sidebar-body">
              {selectedEvents.length === 0 ? (
                <div className="empty-events">
                  <div style={{ fontSize: 24, marginBottom: 'var(--sp-xs)' }}>📅</div>
                  <div>No events on this day.</div>
                  <div>Click below to add one.</div>
                </div>
              ) : (
                selectedEvents.map(ev => (
                  <div key={ev.id} className="event-item">
                    <div className="event-item-title">{ev.title}</div>
                    <div className="event-item-meta">
                      <span>{ev.time}</span>
                      <EventTypebadge type={ev.type} />
                      <button
                        style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-faint)', padding: 0, display: 'flex', alignItems: 'center' }}
                        onClick={() => onDeleteEvent(selectedKey, ev.id)}
                        aria-label={`Delete event: ${ev.title}`}
                      >
                        <IconX size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="event-sidebar-footer">
              <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', height: 36 }} onClick={() => setShowModal(true)}>
                <IconPlus size={12} /> Add event for {format(selectedDate, 'd MMM')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <AddEventModal
          date={selectedDate}
          onSave={(ev) => {
            onAddEvent(selectedKey, ev);
            setShowModal(false);
          }}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
