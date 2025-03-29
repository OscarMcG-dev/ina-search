import { OpenAlexClient } from './openalex';
import { SemanticScholarClient } from './semanticscholar';
import type { Work, PaginatedResponse } from './openalex';

export type ResearchAPI = 'openalex' | 'semanticscholar';

export interface ResearchClient {
  searchByHypothesis(hypothesis: string, page?: number): Promise<PaginatedResponse<Work>>;
}

export function createResearchClient(api: ResearchAPI, email?: string): ResearchClient {
  if (!email) throw new Error('Email is required for API identification');
  
  switch (api) {
    case 'openalex':
      return new OpenAlexClient(email);
    case 'semanticscholar':
      return new SemanticScholarClient(email);
    default:
      throw new Error(`Unsupported API: ${api}`);
  }
} 