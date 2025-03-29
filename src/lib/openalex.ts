import { calculateRelevanceScore } from "./utils";

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

    const searchParams = new URLSearchParams({
      filter: filters.join(','),
      page: page.toString(),
      per_page: perPage.toString(),
      sort: `${sortBy}:${sortOrder}`,
      search: query,
    });

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

  async searchByHypothesis(hypothesis: string, page = 1): Promise<PaginatedResponse<Work>> {
    try {
      // Get more results per page for better coverage
      const response = await this.searchWorks(hypothesis, {
        page,
        perPage: 25,
        sortBy: 'relevance_score',
        sortOrder: 'desc',
        // Default to papers from the last 20 years
        fromYear: new Date().getFullYear() - 20
      });
      
      // Add our custom relevance scores to the results
      const resultsWithScores = response.results.map(work => ({
        ...work,
        relevance_score: calculateRelevanceScore(work)
      }));

      // Sort by our custom relevance score and return with pagination info
      return {
        results: resultsWithScores.sort((a, b) => 
          (b.relevance_score || 0) - (a.relevance_score || 0)
        ),
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