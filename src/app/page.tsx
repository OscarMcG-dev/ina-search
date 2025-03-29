'use client';

import { useState } from 'react';
import { OpenAlexClient, type Work } from '@/lib/openalex';
import { ResearchSearch } from '@/components/ResearchSearch';
import { ResearchPaperGrid } from '@/components/ResearchResults';

export default function Home() {
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Work[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (hypothesis: string) => {
    setIsSearching(true);
    setError(null);

    try {
      const client = new OpenAlexClient(process.env.NEXT_PUBLIC_CONTACT_EMAIL || '');
      const papers = await client.searchByHypothesis(hypothesis);
      setResults(papers);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search for papers. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          Research Hypothesis Checker
        </h1>
        
        <div className="max-w-3xl mx-auto mb-12">
          <ResearchSearch onSearch={handleSearch} />
        </div>

        {error && (
          <div className="max-w-3xl mx-auto mb-8">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-6">
              Found {results.length} relevant papers
            </h2>
            <ResearchPaperGrid papers={results} />
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
