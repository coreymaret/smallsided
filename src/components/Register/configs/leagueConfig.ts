import type { ServiceConfig } from '../types';

export const leagueConfig: ServiceConfig = {
  type: 'league',
  title: 'League Registration',
  subtitle: 'Join Small Sided soccer leagues',
  component: {} as any, // Not used, type selection happens in Register.tsx
};
