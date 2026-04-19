export type InitiativePhase = 'business-case' | 'plan' | 'research' | 'build' | 'deploy' | 'measure';

export interface Initiative {
  id: string;
  title: string;
  summary: string;
  owner: string;
  phase: InitiativePhase;
  createdAt: string;
  updatedAt: string;
}
