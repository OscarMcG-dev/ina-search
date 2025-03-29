import { calculateRelevanceScore } from "./utils";
import type { Work } from './openalex';
import type { PaginatedResponse } from './openalex';
import { SearchOptions as ApiSearchOptions } from './research-api';

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

  private async fetchWithRetry(endpoint: string, params: Record<string, any>, retries = 3): Promise<Response> {
    // Create a payload object with endpoint and parameters
    const payload = {
      endpoint,
      ...params
    };
    
    const url = this.baseUrl;
    console.log('Making request to Semantic Scholar API:', url, 'with payload:', payload);

    for (let i = 0; i < retries; i++) {
      try {
        console.log(`Attempt ${i + 1} of ${retries}`);
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        
        console.log('Response status:', response.status);
        
        if (response.status === 429) {
          console.log('Rate limited, waiting before retry');
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
          continue;
        }

        if (!response.ok) {
          let errorMessage;
          try {
            const errorData = await response.json();
            console.error('API error response:', errorData);
            errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
          } catch (e) {
            // If the error response is not JSON, try to get text
            const errorText = await response.text();
            console.error('API error non-JSON response:', errorText);
            errorMessage = errorText || `HTTP error! status: ${response.status}`;
          }
          throw new Error(errorMessage);
        }

        return response;
      } catch (error: any) {
        console.error(`Attempt ${i + 1} failed:`, error);
        if (i === retries - 1) {
          if (endpoint.includes('paper/search')) {
            console.error('Search parameters that failed:', JSON.stringify(params, null, 2));
          }
          throw new Error(`Failed to fetch from ${endpoint}: ${error.message || 'Unknown error'}`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    throw new Error('Failed after multiple retries');
  }

  async searchPapers(
    query: string, 
    page = 0, 
    options?: {
      yearMin?: number;
      yearMax?: number;
      minCitations?: number;
      openAccessOnly?: boolean;
    }
  ): Promise<SemanticScholarResponse> {
    console.log('Searching papers with query:', query, 'page:', page, 'options:', options);
    const offset = page * this.resultsPerPage;

    // Format the query to handle special characters and improve search results
    // We're removing advanced filters from the basic query to improve search quality
    const basicQuery = query
      .replace(/['"]/g, '') // Remove quotes as the API handles them differently
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    // Prepare parameters according to the Semantic Scholar API documentation
    // Using the basic query only, without filters in the query string
    const params = {
      query: basicQuery,
      offset: offset,
      limit: this.resultsPerPage,
      fields: this.fields,
      // Add API-specific filters as query parameters instead of in the query string
      // This provides better search results than adding them to the query
      year: options?.yearMin && options?.yearMax 
        ? `${options.yearMin}-${options.yearMax}`
        : options?.yearMin 
          ? `${options.yearMin}-` 
          : options?.yearMax 
            ? `-${options.yearMax}`
            : undefined,
      minCitationCount: options?.minCitations,
      openAccessPdf: options?.openAccessOnly ? 'true' : undefined
    };

    const response = await this.fetchWithRetry('paper/search', params);
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    return data;
  }

  async getPaperById(id: string): Promise<SemanticScholarPaper> {
    const params = {
      fields: this.fields,
    };

    const response = await this.fetchWithRetry(`paper/${id}`, params);
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
      doi: paper.url?.includes('doi.org/') ? paper.url.split('doi.org/')[1] : undefined,
      authorships: paper.authors.map(author => ({
        author: {
          id: author.authorId,
          display_name: author.name,
        },
        institutions: [],
      })),
    };
  }

  async searchByHypothesis(
    hypothesis: string, 
    page = 1,
    options?: ApiSearchOptions
  ): Promise<PaginatedResponse<Work>> {
    try {
      console.log('Searching by hypothesis:', hypothesis, 'page:', page, 'options:', options);
      
      // Format the hypothesis into keywords for better search results
      const searchTerms = hypothesis
        .split(/\s+/)
        .filter(term => term.length > 2) // Remove very short words
        .join(' ');
      
      console.log('Search terms:', searchTerms);
      
      const searchOptions = {
        yearMin: options?.fromYear,
        yearMax: options?.toYear,
        minCitations: options?.minCitations !== undefined ? options.minCitations : 5, // Default to minimum 5 citations
        openAccessOnly: options?.openAccess
      };
      
      const response = await this.searchPapers(searchTerms, page - 1, searchOptions);
      console.log('Search response:', JSON.stringify(response, null, 2));
      
      // Filter out results that don't match publication types if specified
      let filteredData = response.data;
      if (options?.publicationTypes && options.publicationTypes.length > 0) {
        filteredData = response.data.filter(paper => {
          if (!paper.publicationTypes || paper.publicationTypes.length === 0) {
            return false;
          }
          return paper.publicationTypes.some(type => 
            options.publicationTypes?.includes(type.toLowerCase())
          );
        });
      }
      
      const works = filteredData.map(paper => ({
        ...this.convertToWork(paper),
        relevance_score: calculateRelevanceScore(this.convertToWork(paper))
      }));

      // Sort works based on sortBy option if provided
      const sortedWorks = works.sort((a, b) => {
        if (options?.sortBy) {
          switch (options.sortBy) {
            case 'citations':
              return (b.cited_by_count || 0) - (a.cited_by_count || 0);
            case 'year':
              return (b.publication_year || 0) - (a.publication_year || 0);
            case 'title':
              return (a.title || '').localeCompare(b.title || '');
          }
        }
        // Default sort by relevance score
        return (b.relevance_score || 0) - (a.relevance_score || 0);
      });

      return {
        results: sortedWorks,
        total: works.length > 0 ? response.total : 0,
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