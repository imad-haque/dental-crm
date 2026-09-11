// Minimal inline SVG icons — no external icon library needed

export const IconLeads = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="5" r="2.5"/>
    <path d="M1 14c0-2.76 2.24-5 5-5s5 2.24 5 5"/>
    <circle cx="12" cy="5" r="1.5"/>
    <path d="M14 14c0-1.66-.9-3.12-2.24-3.9"/>
  </svg>
);

export const IconPipeline = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="3" height="10" rx="1"/>
    <rect x="6.5" y="1" width="3" height="14" rx="1"/>
    <rect x="12" y="5" width="3" height="8" rx="1"/>
  </svg>
);

export const IconCalendar = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1.5" y="2.5" width="13" height="12" rx="2"/>
    <path d="M5 1v3M11 1v3M1.5 6.5h13"/>
  </svg>
);

export const IconAnalytics = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1,12 5,7 9,9 15,3"/>
    <polyline points="11,3 15,3 15,7"/>
  </svg>
);

export const IconPlus = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
    <path d="M7 2v10M2 7h10"/>
  </svg>
);

export const IconX = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
    <path d="M2 2l10 10M12 2L2 12"/>
  </svg>
);

export const IconSearch = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="6" r="4"/>
    <path d="M12 12l-2.5-2.5"/>
  </svg>
);

export const IconChevronLeft = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 12L6 8l4-4"/>
  </svg>
);

export const IconChevronRight = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 4l4 4-4 4"/>
  </svg>
);

export const IconKanban = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="1" width="3.5" height="12" rx="1"/>
    <rect x="5.25" y="1" width="3.5" height="8" rx="1"/>
    <rect x="9.5" y="1" width="3.5" height="5" rx="1"/>
  </svg>
);

export const IconList = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M3 3h8M3 7h8M3 11h8"/>
    <circle cx="1" cy="3" r="0.75" fill="currentColor" stroke="none"/>
    <circle cx="1" cy="7" r="0.75" fill="currentColor" stroke="none"/>
    <circle cx="1" cy="11" r="0.75" fill="currentColor" stroke="none"/>
  </svg>
);

export const IconMail = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="12" height="8" rx="1.5"/>
    <path d="M1 3.5l6 4 6-4"/>
  </svg>
);

export const IconPhone = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 2.5c0 5.8 4.7 10.5 10.5 10.5l1-2.5-2.5-1-1.5 1.5C8 9.5 5.5 7 4 5.5L5.5 4 4.5 1.5 2 2.5z"/>
  </svg>
);

export const IconDollar = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M7 1v12M4.5 3.5C4.5 2.67 5.17 2 6 2h2.5C9.33 2 10 2.67 10 3.5S9.33 5 8.5 5H5.5C4.67 5 4 5.67 4 6.5S4.67 8 5.5 8h3C9.33 8 10 8.67 10 9.5S9.33 11 8.5 11H5.5C4.67 11 4 10.33 4 9.5"/>
  </svg>
);

export const IconSend = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.5 1.5l-11 4 4.5 2.5 2.5 4.5 4-11z"/>
    <path d="M6 8l2.5-2.5"/>
  </svg>
);

export const IconFilter = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M1 2h12l-5 6v4l-2-1V8L1 2z"/>
  </svg>
);

export const IconEdit = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2.5l2 2-7 7H2.5v-2l7-7z"/>
  </svg>
);

export const IconTrash = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3.5h10M5 3.5V2h4v1.5M5.5 6v4.5M8.5 6v4.5"/>
    <rect x="3" y="3.5" width="8" height="9" rx="1"/>
  </svg>
);

export const IconTooth = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 2C5 2 2 4 2 7c0 2 1 3 1 5 0 2 1 4 2 5s1-1 2-3 2-3 3-3 2 1 3 3 1 4 2 3 2-3 2-5c0-2 1-3 1-5 0-3-3-5-5-5-1 0-2 .5-3 1C9 2.5 8 2 7 2z"/>
  </svg>
);
