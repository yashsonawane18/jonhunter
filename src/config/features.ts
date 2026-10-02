/**
 * Centralised feature flags.
 * Each flag is read from the Vite env at build time.
 * Toggle by editing .env: VITE_FEATURE_JOB_DISCOVERY=true|false
 */
export const FEATURES = {
  JOB_DISCOVERY: import.meta.env.VITE_FEATURE_JOB_DISCOVERY !== 'false',
};
