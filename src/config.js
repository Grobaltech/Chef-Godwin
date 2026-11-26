// Replace placeholders with Chef Godwin's real details.
export const BRAND = {
  name: 'Chef Godwin Foods and Kitchen',
  short: 'Chef Godwin',
  tagline: "Omufumbi W'okomikolo",
  location: 'Kampala, Uganda'
};

export const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '256700000000';
export const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';
// Empty on the web (same origin). Absolute URL for the Android APK build.
export const API_BASE = import.meta.env.VITE_API_BASE || '';

export function waLink(text) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export const EVENT_TYPES = [
  'Traditional introduction (Kwanjula)',
  'Wedding',
  'Private party',
  'Corporate event',
  'Other'
];

// Placeholder list. Later this comes from the Supabase `courses` table.
export const COURSES = [
  'Ugandan traditional cuisine',
  'Event and large-batch cooking',
  'Baking and pastry'
];
