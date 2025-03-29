import { OpenAlexClient } from './openalex';
import { SemanticScholarClient } from './semanticscholar';
import type { Work, PaginatedResponse } from './openalex';

export type ResearchAPI = 'openalex' | 'semanticscholar';

export interface SearchOptions {
  page?: number;
  fromYear?: number;
  toYear?: number;
  minCitations?: number;
  maxCitations?: number;
  publicationTypes?: string[];
  openAccess?: boolean;
  sortBy?: 'relevance' | 'citations' | 'year' | 'title';
}

export interface ResearchClient {
  searchByHypothesis(
    hypothesis: string, 
    page?: number,
    options?: SearchOptions
  ): Promise<PaginatedResponse<Work>>;
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