/**
 * CivicLens shared constants.
 * Single source of truth — import everywhere, never inline these strings.
 */

export const PROJECT_CATEGORIES = [
  'Roads',
  'Drainage',
  'Water Supply',
  'Streetlights',
  'Waste Management',
  'Education',
  'Healthcare',
  'Public Buildings',
  'Parks',
  'Other',
];

/** M2 statuses. DELAYED / AT_RISK added in Promise-vs-Reality milestone. */
export const PROJECT_STATUSES = [
  { value: 'PLANNED',    label: 'Planned' },
  { value: 'ONGOING',    label: 'Ongoing' },
  { value: 'COMPLETED',  label: 'Completed' },
  { value: 'ON_HOLD',    label: 'On hold' },
];

/** Canonical status display config — icon name from lucide-react, CSS modifier */
export const STATUS_CONFIG = {
  PLANNED:   { label: 'Planned',   mod: 'planned',   icon: 'Circle' },
  ONGOING:   { label: 'Ongoing',   mod: 'ongoing',   icon: 'Activity' },
  COMPLETED: { label: 'Completed', mod: 'completed', icon: 'CheckCircle2' },
  ON_HOLD:   { label: 'On hold',   mod: 'on_hold',   icon: 'Clock' },
  // Legacy M1 statuses mapped for backward compat
  Ongoing:   { label: 'Ongoing',   mod: 'ongoing',   icon: 'Activity' },
  Completed: { label: 'Completed', mod: 'completed', icon: 'CheckCircle2' },
  Delayed:   { label: 'Delayed — information gap', mod: 'delayed', icon: 'AlertCircle' },
  'At Risk': { label: 'At risk',   mod: 'atrisk',    icon: 'Clock' },
};

/** Trust source label config — used consistently across all screens */
export const TRUST_CONFIG = {
  OFFICIAL:             { label: 'Official Verified', mod: 'official' },
  CONTRACTOR:           { label: 'Contractor submitted', mod: 'contractor' },
  CITIZEN:              { label: 'Citizen observation', mod: 'citizen' },
  UNVERIFIED:           { label: 'Unverified', mod: 'unverified' },
  PENDING_VERIFICATION: { label: 'Pending Verification', mod: 'atrisk' },
  REJECTED:             { label: 'Rejected by Government', mod: 'delayed' },
  CITIZEN_OBSERVATION:  { label: 'Citizen Observation', mod: 'citizen' },
  ACKNOWLEDGED:         { label: 'Acknowledged', mod: 'official' },
  DISMISSED:            { label: 'Dismissed', mod: 'unverified' },
};

export const DEMO_DEPARTMENTS = [
  'BBMP Road Infrastructure',
  'BBMP Stormwater Drain (SWD)',
  'Bangalore Water Supply & Sewerage Board (BWSSB)',
  'BESCOM Electrical Infrastructure',
  'DULT Urban Transport Authority',
  'Municipal Administration',
  'Public Works Department',
  'Health Department',
  'Education Department',
  'Waste Management',
];

export const DEMO_WARDS = [
  'Indiranagar (Ward 112)',
  'Koramangala (Ward 151)',
  'Whitefield (Ward 84)',
  'Jayanagar (Ward 153)',
  'Malleshwaram (Ward 65)',
  'Ward 1',
  'Ward 2',
  'Ward 3',
  'Ward 4',
  'Ward 5',
  'Ward 6',
  'Ward 7',
  'Ward 8',
  'Ward 12',
  'Ward 15',
];

export const BUDGET_YEARS = [
  '2024-2025',
  '2025-2026',
  '2026-2027',
];
