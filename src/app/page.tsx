'use client';

import { useState } from 'react';
import type { Work } from '@/lib/openalex';
import type { ResearchAPI } from '@/lib/research-api';
import { createResearchClient } from '@/lib/research-api';
import { ResearchSearch } from '@/components/ResearchSearch';
import { ResearchPaperGrid } from '@/components/ResearchResults';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Work[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedApi, setSelectedApi] = useState<ResearchAPI>('openalex');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [currentQuery, setCurrentQuery] = useState('');
  const resultsPerPage = 25;

  const handleSearch = async (hypothesis: string, api: ResearchAPI, page = 1) => {
    console.log('Starting search with:', { hypothesis, api, page });
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
      
      console.log('Searching for hypothesis...');
      const response = await client.searchByHypothesis(hypothesis, page);
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

  const totalPages = Math.ceil(totalResults / resultsPerPage);

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          Research Hypothesis Checker
        </h1>
        
        <div className="max-w-3xl mx-auto mb-12">
          <ResearchSearch onSearch={(hypothesis, api) => handleSearch(hypothesis, api, 1)} />
        </div>

        {error && (
          <div className="max-w-3xl mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
            {!process.env.NEXT_PUBLIC_CONTACT_EMAIL && (
              <p className="text-sm text-red-500 mt-2">
                Tip: Make sure NEXT_PUBLIC_CONTACT_EMAIL is set in your .env file
              </p>
            )}
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-6">
              Found {totalResults} relevant papers using {selectedApi}
            </h2>
            <ResearchPaperGrid papers={results} />
            
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isSearching}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isSearching}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}

        {isSearching && (
          <div className="flex justify-center mt-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        )}
      </div>
    </main>
  );
}
