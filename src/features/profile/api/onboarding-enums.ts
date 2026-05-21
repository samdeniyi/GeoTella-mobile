// Inferred backend enum values for onboarding selections.
// Each map is { humanLabel: BACKEND_ENUM } so the chip UI stays readable
// while the API payload uses the upper-snake-case enums.
//
// If the backend rejects any of these, swap the right-hand value below — no
// other code has to change.

export const APP_FUNCTIONAL_ROLES = {
  Investor: 'INVESTOR',
  'Fund Manager': 'FUND_MANAGER',
  'VC/PE Analyst': 'VC_PE_ANALYST',
  Entrepreneur: 'ENTREPRENEUR',
  Consultant: 'CONSULTANT',
  Researcher: 'RESEARCHER',
  Other: 'OTHER',
} as const;

export const FOCUS_SECTORS = {
  Fintech: 'FINTECH',
  'Real Estate': 'REAL_ESTATE',
  Tech: 'TECH',
  Agriculture: 'AGRICULTURE',
  Energy: 'ENERGY',
  Manufacturing: 'MANUFACTURING',
  Healthcare: 'HEALTHCARE',
  'Trade & Logistics': 'TRADE_LOGISTICS',
} as const;

export const DEAL_SIZES = {
  '<$50K': '<$50K',
  '$50K-$500K': '$50K-$500K',
  '$500K-$5M': '$500K-$5M',
  '$5M+': '$5M+',
} as const;

export const AREAS_OF_EXPERTISE = {
  Culture: 'CULTURE',
  Infrastructure: 'INFRASTRUCTURE',
  Trade: 'TRADE',
  Climate: 'CLIMATE',
  Politics: 'POLITICS',
  Tech: 'TECH',
  Housing: 'HOUSING',
  Agriculture: 'AGRICULTURE',
  Finance: 'FINANCE',
  Health: 'HEALTH',
} as const;

export const EXPLORATION_REASONS = {
  Research: 'RESEARCH',
  'Travel blogging': 'TRAVEL_BLOGGING',
  Journalism: 'JOURNALISM',
  'Development work': 'DEVELOPMENT_WORK',
  'Personal interest': 'PERSONAL_INTEREST',
} as const;

export const LANGUAGES = {
  English: 'ENGLISH',
  French: 'FRENCH',
  Arabic: 'ARABIC',
  Swahili: 'SWAHILI',
  Portuguese: 'PORTUGUESE',
  Spanish: 'SPANISH',
  Hausa: 'HAUSA',
  Other: 'OTHER',
} as const;

export const CONTRIBUTION_TYPES = {
  'On-ground reports': 'ON_GROUND_REPORTS',
  'Market data': 'MARKET_DATA',
  'Photos / Media': 'PHOTOS_MEDIA',
  'Research notes': 'RESEARCH_NOTES',
  'News links': 'NEWS_LINKS',
} as const;

type EnumMap = Record<string, string>;

// Map an array of UI labels to their backend enum values, silently dropping unknowns.
export const toEnums = <T extends EnumMap>(map: T, labels: string[]): T[keyof T][] =>
  labels
    .map((label) => (map as EnumMap)[label])
    .filter((v): v is T[keyof T] => typeof v === 'string');

// Single-value mapper (used for `dealSize`, which only allows one selection in the UI).
export const toEnum = <T extends EnumMap>(map: T, label: string): T[keyof T] | undefined =>
  (map as EnumMap)[label] as T[keyof T] | undefined;
