import { calculateRelevanceScore } from "./utils";
import type { Work } from './openalex';
import type { PaginatedResponse } from './openalex';

export interface SemanticScholarPaper {
  paperId: string;
  title: string;
  abstract?: string;
  year?: number;
  referenceCount?: number;
  citationCount: number;
  isOpenAccess?: boolean;
  openAccessPdf?: { 
    url: string;
    status: string;
  };
  authors: Array<{
    authorId: string;
    name: string;
  }>;
  venue?: string;
  url?: string;
  publicationTypes?: string[];
  publicationDate?: string;
}

interface SemanticScholarResponse {
  total: number;
  offset: number;
  next?: string;
  data: SemanticScholarPaper[];
}

export class SemanticScholarClient {
  private baseUrl = '/api/semanticscholar';
  private fields = [
    'paperId',
    'title',
    'abstract',
    'year',
    'referenceCount',
    'citationCount',
    'isOpenAccess',
    'openAccessPdf',
    'authors',
    'venue',
    'url',
    'publicationTypes',
    'publicationDate'
  ].join(',');
  private resultsPerPage = 25;
  private contactEmail: string;

  constructor(contactEmail?: string) {
    this.contactEmail = contactEmail || process.env.NEXT_PUBLIC_CONTACT_EMAIL || '';
    if (!this.contactEmail) {
      throw new Error('Contact email is required for Semantic Scholar API');
    }
    console.log('SemanticScholarClient initialized with email:', this.contactEmail);
  }

  private async fetchWithRetry(endpoint: string, params: URLSearchParams, retries = 3): Promise<Response> {
    // Add the endpoint to the params
    params.set('endpoint', endpoint);
    
    const url = `${this.baseUrl}?${params.toString()}`;
    console.log('Making request to Semantic Scholar API:', url);

    for (let i = 0; i < retries; i++) {
      try {
        console.log(`Attempt ${i + 1} of ${retries}`);
        const response = await fetch(url);
        
        console.log('Response status:', response.status);
        
        if (response.status === 429) {
          console.log('Rate limited, waiting before retry');
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
          continue;
        }

        if (!response.ok) {
          const errorData = await response.json();
          console.error('API error response:', errorData);
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        return response;
      } catch (error) {
        console.error(`Attempt ${i + 1} failed:`, error);
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    throw new Error('Failed after multiple retries');
  }

  async searchPapers(query: string, page = 0): Promise<SemanticScholarResponse> {
    console.log('Searching papers with query:', query, 'page:', page);
    const offset = page * this.resultsPerPage;

    // Format the query to handle special characters and improve search results
    const formattedQuery = query
      .replace(/['"]/g, '') // Remove quotes as the API handles them differently
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    const searchParams = new URLSearchParams({
      query: formattedQuery,
      offset: offset.toString(),
      limit: this.resultsPerPage.toString(),
      fields: this.fields,
      year: '2000-', // Limit to papers from 2000 onwards for better relevance
    });

    const response = await this.fetchWithRetry('paper/search', searchParams);
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    return data;
  }

  async getPaperById(id: string): Promise<SemanticScholarPaper> {
    const searchParams = new URLSearchParams({
      fields: this.fields,
    });

    const response = await this.fetchWithRetry(`paper/${id}`, searchParams);
    return response.json();
  }

  private convertToWork(paper: SemanticScholarPaper): Work {
    return {
      id: paper.paperId,
      title: paper.title,
      abstract: paper.abstract,
      publication_year: paper.year || 0,
      type: paper.publicationTypes?.[0] || 'paper',
      cited_by_count: paper.citationCount,
      is_open_access: paper.isOpenAccess || false,
      open_access_url: paper.openAccessPdf?.url,
      authorships: paper.authors.map(author => ({
        author: {
          id: author.authorId,
          display_name: author.name,
        },
        institutions: [],
      })),
    };
  }

  async searchByHypothesis(hypothesis: string, page = 1): Promise<PaginatedResponse<Work>> {
    try {
      console.log('Searching by hypothesis:', hypothesis, 'page:', page);
      
      // Format the hypothesis into keywords for better search results
      const searchTerms = hypothesis
        .split(/\s+/)
        .filter(term => term.length > 2) // Remove very short words
        .join(' ');
      
      console.log('Search terms:', searchTerms);
      
      const response = await this.searchPapers(searchTerms, page - 1);
      console.log('Search response:', JSON.stringify(response, null, 2));
      
      const works = response.data.map(paper => ({
        ...this.convertToWork(paper),
        relevance_score: calculateRelevanceScore(this.convertToWork(paper))
      }));

      return {
        results: works.sort((a, b) => 
          (b.relevance_score || 0) - (a.relevance_score || 0)
        ),
        total: response.total,
        page,
        totalPages: Math.ceil(response.total / this.resultsPerPage)
      };
    } catch (error) {
      console.error('Error in searchByHypothesis:', error);
      throw error;
    }
  }
}

export type { Work } from './openalex'; 