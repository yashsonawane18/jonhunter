import discoveryFiltersConfig from './discoveryFilters.json';

/**
 * Centralised feature flags.
 * - JOB_DISCOVERY: read from Vite env (VITE_FEATURE_JOB_DISCOVERY=true|false)
 * - SHOW_SENIORITY_FILTER: read from src/config/discoveryFilters.json
 * - SHOW_ROLE_FILTERS_MATRIX: read from src/config/discoveryFilters.json
 */
export const FEATURES = {
  JOB_DISCOVERY: import.meta.env.VITE_FEATURE_JOB_DISCOVERY !== 'false',
  SHOW_SENIORITY_FILTER: Boolean(discoveryFiltersConfig.showSeniorityFilter),
  SHOW_ROLE_FILTERS_MATRIX: Boolean(discoveryFiltersConfig.showRoleFiltersMatrix),
};

export { discoveryFiltersConfig };
