export const API_URL = 'http://localhost:3001';

export const EMPLOYEES = [
  { id: 'EMP001', name: 'Maria Garcia', department: 'Engineering' },
  { id: 'EMP002', name: 'Carlos Lopez', department: 'Marketing' },
  { id: 'EMP003', name: 'Ana Martinez', department: 'Product' },
] as const;

export const SUGGESTION_CHIPS = [
  'How many vacation days do I have left?',
  'I want to request time off',
  "What's the PTO policy?",
  "Who's out on my team next week?",
] as const;
