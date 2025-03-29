'use client';

import { useState, useEffect } from 'react';
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
    yearRange: [1950, new Date().getFullYear()],
    selectedYearRange: [1990, new Date().getFullYear()],
    citationCount: {
      min: 0,
      max: 1000
    },
    selectedCitationRange: [5, 1000],
    publicationTypes: ['journal-article', 'conference-paper', 'book-chapter', 'preprint'],
    selectedPublicationTypes: [],
    openAccessOnly: false
  });

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
    
    // If we have an active search, reapply it with the new filters
    if (currentQuery) {
      // Reset to page 1 when filters change
      handleSearch(currentQuery, selectedApi, 1);
    }
  };

  const handleSearch = async (hypothesis: string, api: ResearchAPI, page = 1) => {
    console.log('Starting search with:', { hypothesis, api, page, filters, sortBy });
    setIsSearching(true);
    setError(null);
    setSelectedApi(api);
    setCurrentQuery(hypothesis);

    try {
      if (!process.env.NEXT_PUBLIC_CONTACT_EMAIL) {
        throw new Error('Contact email is not configured. Please check your environment variables.');
      }

      console.log('Creating research client with email:', process.env.NEXT_PUBLIC_CONTACT_EMAIL);
      const client = createResearchClient(api, process.env.NEXT_PUBLIC_CONTACT_EMAIL);
      
      // Apply filters to the search
      const searchOptions = {
        page,
        fromYear: filters.selectedYearRange[0],
        toYear: filters.selectedYearRange[1],
        minCitations: filters.selectedCitationRange[0],
        maxCitations: filters.selectedCitationRange[1],
        publicationTypes: filters.selectedPublicationTypes.length > 0 
          ? filters.selectedPublicationTypes 
          : undefined,
        openAccess: filters.openAccessOnly,
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
      handleSearch(currentQuery, selectedApi, newPage);
    }
  };

  // Handle sort change
  const handleSortChange = (value: SortOption) => {
    setSortBy(value);
    
    // If we have an active search, reapply it with the new sort option
    if (currentQuery) {
      handleSearch(currentQuery, selectedApi, currentPage);
    }
  };

  const totalPages = Math.ceil(totalResults / resultsPerPage);

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary/90 to-primary py-12 text-white">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Research Hypothesis Checker
          </h1>
          <p className="text-lg text-center max-w-3xl mx-auto opacity-90">
            Validate your research hypotheses by searching academic literature across Semantic Scholar and OpenAlex databases
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search card with shadow */}
        <div className="max-w-3xl mx-auto mb-12 bg-card rounded-xl shadow-md p-6 -mt-8 relative z-10 border border-border/50">
          <ResearchSearch onSearch={(hypothesis, api) => handleSearch(hypothesis, api, 1)} />
        </div>

        {error && (
          <div className="max-w-3xl mx-auto mb-8 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            {!process.env.NEXT_PUBLIC_CONTACT_EMAIL && (
              <p className="text-sm text-red-500 mt-2">
                Tip: Make sure NEXT_PUBLIC_CONTACT_EMAIL is set in your .env file
              </p>
            )}
          </div>
        )}

        {isSearching && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            <p className="mt-4 text-muted-foreground">Searching academic databases...</p>
          </div>
        )}

        {results.length > 0 && !isSearching && (
          <div className="mt-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h2 className="text-2xl font-semibold">
                <span className="text-primary font-bold">{totalResults}</span> relevant papers
                <span className="text-muted-foreground text-lg ml-2">via {selectedApi === 'openalex' ? 'OpenAlex' : 'Semantic Scholar'}</span>
              </h2>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Sort by:</span>
                <Select value={sortBy} onValueChange={(value) => handleSortChange(value as SortOption)}>
                  <SelectTrigger className="w-[180px]">
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
            
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Filters */}
              <div className="w-full lg:w-1/4 order-2 lg:order-1">
                <div className="sticky top-4">
                  <FilterSidebar 
                    filters={filters}
                    onFilterChange={handleFilterChange}
                  />
                </div>
              </div>
              
              {/* Results */}
              <div className="w-full lg:w-3/4 order-1 lg:order-2">
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
              </div>
            </div>
          </div>
        )}

        {!isSearching && results.length === 0 && currentQuery && (
          <div className="text-center py-16">
            <h3 className="text-xl font-medium mb-2">No results found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters to find more papers
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
