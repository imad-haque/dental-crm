/**
 * Shared formatting helpers — Indian rupee currency and number formatting
 */

// Indian locale number formatting with ₹ symbol
// e.g. 150000 → "₹1,50,000"
export function formatINR(value) {
  if (value === null || value === undefined || isNaN(value)) return '₹0';
  return '₹' + Number(value).toLocaleString('en-IN');
}

// Compact format for chart axes and KPI cards
// e.g. 1500000 → "₹15L", 100000 → "₹1L", 1000 → "₹1K"
export function formatINRCompact(value) {
  if (!value) return '₹0';
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000)   return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000)     return `₹${(value / 1000).toFixed(0)}K`;
  return `₹${value}`;
}

// Common country dial codes for the phone dropdown
// id is unique per country; code is the actual dial code
export const COUNTRY_CODES = [
  { id: 'IN',  code: '+91',  flag: '🇮🇳', name: 'India' },
  { id: 'US',  code: '+1',   flag: '🇺🇸', name: 'USA' },
  { id: 'CA',  code: '+1',   flag: '🇨🇦', name: 'Canada' },
  { id: 'GB',  code: '+44',  flag: '🇬🇧', name: 'UK' },
  { id: 'AU',  code: '+61',  flag: '🇦🇺', name: 'Australia' },
  { id: 'NZ',  code: '+64',  flag: '🇳🇿', name: 'New Zealand' },
  { id: 'AE',  code: '+971', flag: '🇦🇪', name: 'UAE' },
  { id: 'SA',  code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { id: 'QA',  code: '+974', flag: '🇶🇦', name: 'Qatar' },
  { id: 'OM',  code: '+968', flag: '🇴🇲', name: 'Oman' },
  { id: 'BH',  code: '+973', flag: '🇧🇭', name: 'Bahrain' },
  { id: 'KW',  code: '+965', flag: '🇰🇼', name: 'Kuwait' },
  { id: 'SG',  code: '+65',  flag: '🇸🇬', name: 'Singapore' },
  { id: 'MY',  code: '+60',  flag: '🇲🇾', name: 'Malaysia' },
  { id: 'PK',  code: '+92',  flag: '🇵🇰', name: 'Pakistan' },
  { id: 'BD',  code: '+880', flag: '🇧🇩', name: 'Bangladesh' },
  { id: 'LK',  code: '+94',  flag: '🇱🇰', name: 'Sri Lanka' },
  { id: 'NP',  code: '+977', flag: '🇳🇵', name: 'Nepal' },
  { id: 'DE',  code: '+49',  flag: '🇩🇪', name: 'Germany' },
  { id: 'FR',  code: '+33',  flag: '🇫🇷', name: 'France' },
  { id: 'IT',  code: '+39',  flag: '🇮🇹', name: 'Italy' },
  { id: 'ES',  code: '+34',  flag: '🇪🇸', name: 'Spain' },
  { id: 'NL',  code: '+31',  flag: '🇳🇱', name: 'Netherlands' },
  { id: 'CN',  code: '+86',  flag: '🇨🇳', name: 'China' },
  { id: 'JP',  code: '+81',  flag: '🇯🇵', name: 'Japan' },
  { id: 'KR',  code: '+82',  flag: '🇰🇷', name: 'South Korea' },
  { id: 'ZA',  code: '+27',  flag: '🇿🇦', name: 'South Africa' },
  { id: 'BR',  code: '+55',  flag: '🇧🇷', name: 'Brazil' },
  { id: 'MX',  code: '+52',  flag: '🇲🇽', name: 'Mexico' },
];
