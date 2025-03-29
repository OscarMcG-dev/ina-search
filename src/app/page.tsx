'use client';

import { useState } from 'react';
import type { Work } from '@/lib/openalex';
import type { ResearchAPI } from '@/lib/research-api';
import { createResearchClient } from '@/lib/research-api';
import { ResearchSearch } from '@/components/ResearchSearch';
import { ResearchPaperGrid } from '@/components/ResearchResults';
import { Button } from '@/components/ui/button';
import { FilterSidebar, FilterOptions } from '@/components/FilterSidebar';
import { Pagination } from '@/components/Pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Define available sort options
type SortOption = 'relevance' | 'citations' | 'year' | 'title';

export default function Home() {
  const currentYear = new Date().getFullYear();
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Work[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedApi, setSelectedApi] = useState<ResearchAPI>('openalex');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [currentQuery, setCurrentQuery] = useState('');
  const [resultsPerPage, setResultsPerPage] = useState(25);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  
  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    yearRange: [1950, currentYear],
    selectedYearRange: [1990, currentYear],
    citationCount: {
      min: 0,
      max: 1000
    },
    selectedCitationRange: [5, 1000],
    publicationTypes: ['journal-article', 'conference-paper', 'book-chapter', 'preprint'],
    selectedPublicationTypes: [],
    openAccessOnly: false
  });

  const handleSearch = async (hypothesis: string, api: ResearchAPI, searchFilters: FilterOptions, page = 1) => {
    console.log('Starting search with:', { hypothesis, api, page, searchFilters, sortBy });
    setIsSearching(true);
    setError(null);
    setSelectedApi(api);
    setCurrentQuery(hypothesis);
    // Update the filters state with the ones used for search
    setFilters(searchFilters);

    try {
      if (!process.env.NEXT_PUBLIC_CONTACT_EMAIL) {
        throw new Error('Contact email is not configured. Please check your environment variables.');
      }

      console.log('Creating research client with email:', process.env.NEXT_PUBLIC_CONTACT_EMAIL);
      const client = createResearchClient(api, process.env.NEXT_PUBLIC_CONTACT_EMAIL);
      
      // Apply filters to the search
      const searchOptions = {
        page,
        fromYear: searchFilters.selectedYearRange[0],
        toYear: searchFilters.selectedYearRange[1],
        minCitations: searchFilters.selectedCitationRange[0],
        maxCitations: searchFilters.selectedCitationRange[1],
        publicationTypes: searchFilters.selectedPublicationTypes.length > 0 
          ? searchFilters.selectedPublicationTypes 
          : undefined,
        openAccess: searchFilters.openAccessOnly,
        sortBy
      };
      
      console.log('Searching with options:', searchOptions);
      
      // Debug log to see how filters are being applied
      if (api === 'semanticscholar') {
        console.log('Semantic Scholar search with params:', {
          query: hypothesis,
          year: `${searchOptions.fromYear}-${searchOptions.toYear}`,
          minCitationCount: searchOptions.minCitations,
          openAccessPdf: searchOptions.openAccess ? 'true' : undefined
        });
      }
      
      const response = await client.searchByHypothesis(hypothesis, page, searchOptions);
      console.log('Search response:', response);
      
      if (!response || !response.results) {
        throw new Error('Invalid response format from API');
      }
      
      setResults(response.results);
      setTotalResults(response.total);
      setCurrentPage(page);
    } catch (err) {
      console.error('Search error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      const apiName = api === 'semanticscholar' ? 'Semantic Scholar' : 'OpenAlex';
      setError(`Failed to search for papers using ${apiName}: ${errorMessage}. Please check the console for more details.`);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (currentQuery) {
      handleSearch(currentQuery, selectedApi, filters, newPage);
    }
  };

  // Handle sort change
  const handleSortChange = (value: SortOption) => {
    setSortBy(value);
    
    // If we have an active search, reapply it with the new sort option
    if (currentQuery) {
      handleSearch(currentQuery, selectedApi, filters, currentPage);
    }
  };

  const totalPages = Math.ceil(totalResults / resultsPerPage);

  return (
    <div className="min-h-screen antialiased flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-[rgba(255,255,255,0.1)]">
        <div className="container mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Research Hypothesis Checker
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 flex-grow">
        {/* Search Form */}
        <div className="max-w-3xl mx-auto mb-8">
          <ResearchSearch 
            onSearch={handleSearch}
            initialFilters={filters}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-3xl mx-auto mb-8">
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-destructive" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-destructive font-medium">{error}</p>
                  {!process.env.NEXT_PUBLIC_CONTACT_EMAIL && (
                    <p className="text-xs text-destructive/80 mt-1">
                      Tip: Make sure NEXT_PUBLIC_CONTACT_EMAIL is set in your .env file
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        {(results.length > 0 || isSearching) && (
          <div className="mt-6">
            {results.length > 0 && (
              <div className="bg-card rounded-lg border border-[rgba(255,255,255,0.1)] p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-lg font-medium flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary"></span>
                  <span>{totalResults} publications found</span>
                  <span className="text-sm text-muted-foreground font-normal">via {selectedApi === 'semanticscholar' ? 'Semantic Scholar' : 'OpenAlex'}</span>
                </h2>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Sort by:</span>
                  <Select value={sortBy} onValueChange={(value) => handleSortChange(value as SortOption)}>
                    <SelectTrigger className="w-[180px] h-9 bg-background/40">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="citations">Citations</SelectItem>
                      <SelectItem value="year">Recent First</SelectItem>
                      <SelectItem value="title">Title (A-Z)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-12 gap-6">
              {/* Filters - Hidden on mobile, visible on md+ */}
              <div className="hidden md:block md:col-span-3 lg:col-span-3">
                <FilterSidebar 
                  filters={filters}
                  onFilterChange={(newFilters) => {
                    // Just update the filter state, but don't trigger a search
                    setFilters(prev => ({
                      ...prev,
                      ...newFilters
                    }));
                  }}
                />
              </div>
              
              {/* Results */}
              <div className="col-span-12 md:col-span-9 lg:col-span-9">
                {isSearching ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
                    <p className="text-muted-foreground">Searching academic databases...</p>
                  </div>
                ) : (
                  <>
                    <ResearchPaperGrid papers={results} />
                    
                    {totalPages > 1 && (
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalResults={totalResults}
                        resultsPerPage={resultsPerPage}
                        onPageChange={handlePageChange}
                      />
                    )}
                  </>
                )}
              </div>
              
              {/* Mobile filter button - only visible on small screens */}
              <div className="md:hidden fixed bottom-4 right-4 z-10">
                <Button 
                  className="rounded-full shadow-lg h-14 w-14 p-0 bg-primary hover:bg-primary/90"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                    <path fillRule="evenodd" d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 0 1 .628.74v2.288a2.25 2.25 0 0 1-.659 1.59l-4.682 4.683a2.25 2.25 0 0 0-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 0 1 8 18.25v-5.757a2.25 2.25 0 0 0-.659-1.59L2.659 6.22A2.25 2.25 0 0 1 2 4.629V2.34a.75.75 0 0 1 .628-.74z" clipRule="evenodd" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Empty state - Show when no search has been performed yet */}
        {!isSearching && results.length === 0 && !error && (
          <div className="text-center py-16 px-4 max-w-2xl mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-muted-foreground/60 mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
            
            <h2 className="text-xl font-medium mb-2">Start Your Research</h2>
            <p className="text-muted-foreground mb-6">
              Enter your research hypothesis above and configure filters to search for relevant papers.
            </p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground max-w-md mx-auto">
              <div className="flex items-start gap-2 bg-muted/30 p-3 rounded-md text-left">
                <span className="font-medium">Tip:</span>
                <span>Be specific in your hypothesis. Instead of "mindfulness is effective," try "mindfulness meditation practice reduces anxiety in college students."</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
