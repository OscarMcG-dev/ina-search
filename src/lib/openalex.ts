import { calculateRelevanceScore } from "./utils";
import { SearchOptions as ApiSearchOptions } from './research-api';

export interface Author {
  id: string;
  display_name: string;
  orcid?: string;
}

export interface Work {
  id: string;
  doi?: string;
  title: string;
  abstract?: string;
  publication_year: number;
  publication_date?: string;
  type: string;
  cited_by_count: number;
  is_open_access: boolean;
  open_access_url?: string;
  authorships: {
    author: Author;
    institutions: Array<{
      display_name: string;
    }>;
  }[];
  relevance_score?: number;
}

interface OpenAlexResponse {
  meta: {
    count: number;
    page: number;
    per_page: number;
  };
  results: Work[];
}

interface SearchOptions {
  page?: number;
  perPage?: number;
  fromYear?: number;
  toYear?: number;
  minCitations?: number;
  maxCitations?: number;
  publicationTypes?: string[];
  openAccess?: boolean;
  sortBy?: 'relevance_score' | 'cited_by_count' | 'publication_date';
  sortOrder?: 'desc' | 'asc';
}

export interface PaginatedResponse<T> {
  results: T[];
  total: number;
  page: number;
  totalPages: number;
}

export class OpenAlexClient {
  private baseUrl = 'https://api.openalex.org';
  private email: string;

  constructor(email: string) {
    if (!email) throw new Error('Email is required for OpenAlex API');
    this.email = email;
  }

  private async fetchWithEmail(url: string): Promise<Response> {
    const finalUrl = new URL(url);
    finalUrl.searchParams.append('mailto', this.email);
    
    const response = await fetch(finalUrl.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAlex API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    return response;
  }

  async searchWorks(query: string, options: SearchOptions = {}): Promise<OpenAlexResponse> {
    const {
      page = 1,
      perPage = 25,
      fromYear,
      toYear,
      minCitations,
      maxCitations,
      publicationTypes,
      openAccess,
      sortBy = 'relevance_score',
      sortOrder = 'desc'
    } = options;

    const filters = ['has_abstract:true'];
    
    // Add year filter if specified
    if (fromYear && toYear) {
      filters.push(`publication_year:${fromYear}-${toYear}`);
    } else if (fromYear) {
      filters.push(`publication_year:>${fromYear}`);
    } else if (toYear) {
      filters.push(`publication_year:<${toYear}`);
    }
    
    // Add citation filter if specified
    if (minCitations !== undefined || maxCitations !== undefined) {
      let citationFilter = 'cited_by_count:';
      if (minCitations !== undefined && maxCitations !== undefined) {
        citationFilter += `${minCitations}-${maxCitations}`;
      } else if (minCitations !== undefined) {
        citationFilter += `${minCitations}-`;
      } else if (maxCitations !== undefined) {
        citationFilter += `-${maxCitations}`;
      }
      filters.push(citationFilter);
    }
    
    // Add publication type filter if specified
    if (publicationTypes && publicationTypes.length > 0) {
      filters.push(`type:${publicationTypes.join('|')}`);
    }
    
    // Add open access filter if specified
    if (openAccess) {
      filters.push('is_oa:true');
    }

    const searchParams = new URLSearchParams({
      filter: filters.join(','),
      page: page.toString(),
      per_page: perPage.toString(),
      sort: `${sortBy}:${sortOrder}`,
      search: query,
    });

    console.log('OpenAlex search URL params:', searchParams.toString());

    try {
      const response = await this.fetchWithEmail(
        `${this.baseUrl}/works?${searchParams.toString()}`
      );
      return response.json();
    } catch (error) {
      console.error('Error searching OpenAlex works:', error);
      throw error;
    }
  }

  async getWorkById(id: string): Promise<Work> {
    try {
      const response = await this.fetchWithEmail(`${this.baseUrl}/works/${id}`);
      return response.json();
    } catch (error) {
      console.error('Error fetching work from OpenAlex:', error);
      throw error;
    }
  }

  async searchByHypothesis(
    hypothesis: string, 
    page = 1,
    options?: ApiSearchOptions
  ): Promise<PaginatedResponse<Work>> {
    try {
      // Map our generic sort options to OpenAlex-specific sort options
      let openAlexSortBy: 'relevance_score' | 'cited_by_count' | 'publication_date' = 'relevance_score';
      if (options?.sortBy) {
        switch (options.sortBy) {
          case 'citations':
            openAlexSortBy = 'cited_by_count';
            break;
          case 'year':
            openAlexSortBy = 'publication_date';
            break;
          case 'relevance':
          default:
            openAlexSortBy = 'relevance_score';
            break;
        }
      }
      
      // Apply the search options
      const searchOptions: SearchOptions = {
        page,
        perPage: 25,
        sortBy: openAlexSortBy,
        sortOrder: 'desc',
        // Default to papers from the last 20 years
        fromYear: options?.fromYear || new Date().getFullYear() - 20,
        toYear: options?.toYear,
        minCitations: options?.minCitations !== undefined ? options.minCitations : 5, // Default to 5 citations minimum
        maxCitations: options?.maxCitations,
        publicationTypes: options?.publicationTypes,
        openAccess: options?.openAccess
      };
      
      console.log('OpenAlex search options:', searchOptions);
      
      // Get results with the specified options
      const response = await this.searchWorks(hypothesis, searchOptions);
      
      // Add our custom relevance scores to the results
      const resultsWithScores = response.results.map(work => ({
        ...work,
        relevance_score: calculateRelevanceScore(work)
      }));

      // Sort by title if requested (not supported directly by the API)
      let sortedResults = resultsWithScores;
      if (options?.sortBy === 'title') {
        sortedResults = resultsWithScores.sort((a, b) => 
          (a.title || '').localeCompare(b.title || '')
        );
      } else if (options?.sortBy === 'relevance' || !options?.sortBy) {
        // Always apply our custom relevance scoring for 'relevance' sort
        sortedResults = resultsWithScores.sort((a, b) => 
          (b.relevance_score || 0) - (a.relevance_score || 0)
        );
      }

      return {
        results: sortedResults,
        total: response.meta.count,
        page: response.meta.page,
        totalPages: Math.ceil(response.meta.count / response.meta.per_page)
      };
    } catch (error) {
      console.error('Error searching OpenAlex:', error);
      throw error;
    }
  }
} 