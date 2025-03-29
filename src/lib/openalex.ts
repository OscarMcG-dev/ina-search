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

export class OpenAlexClient {
  private baseUrl = 'https://api.openalex.org';
  private email: string;

  constructor(email: string) {
    this.email = email;
  }

  private async fetchWithEmail(url: string): Promise<Response> {
    const finalUrl = new URL(url);
    finalUrl.searchParams.append('mailto', this.email);
    return fetch(finalUrl.toString());
  }

  async searchWorks(query: string, page = 1, perPage = 10): Promise<OpenAlexResponse> {
    const searchParams = new URLSearchParams({
      filter: 'has_abstract:true',
      page: page.toString(),
      per_page: perPage.toString(),
      sort: 'relevance_score:desc',
      search: query,
    });

    const response = await this.fetchWithEmail(
      `${this.baseUrl}/works?${searchParams.toString()}`
    );

    if (!response.ok) {
      throw new Error(`OpenAlex API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getWorkById(id: string): Promise<Work> {
    const response = await this.fetchWithEmail(`${this.baseUrl}/works/${id}`);

    if (!response.ok) {
      throw new Error(`OpenAlex API error: ${response.statusText}`);
    }

    return response.json();
  }

  async searchByHypothesis(hypothesis: string): Promise<Work[]> {
    try {
      // First, get initial results
      const response = await this.searchWorks(hypothesis);
      
      // Add relevance scores to the results
      const resultsWithScores = response.results.map(work => ({
        ...work,
        relevance_score: calculateRelevanceScore(work)
      }));

      // Sort by our custom relevance score
      return resultsWithScores.sort((a, b) => 
        (b.relevance_score || 0) - (a.relevance_score || 0)
      );
    } catch (error) {
      console.error('Error searching OpenAlex:', error);
      throw error;
    }
  }
} 