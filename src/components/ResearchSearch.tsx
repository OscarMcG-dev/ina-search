'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { ResearchAPI } from '@/lib/research-api';

interface ResearchSearchProps {
  onSearch: (hypothesis: string, api: ResearchAPI) => void;
}

export function ResearchSearch({ onSearch }: ResearchSearchProps) {
  const [hypothesis, setHypothesis] = useState('');
  const [selectedApi, setSelectedApi] = useState<ResearchAPI>('openalex');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hypothesis.trim()) {
      onSearch(hypothesis.trim(), selectedApi);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label 
          htmlFor="hypothesis" 
          className="text-base font-medium inline-flex items-center"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="w-4 h-4 mr-2 text-primary"
          >
            <path d="M10 22v-4c0-1.1-.9-2-2-2V8"/>
            <circle cx="14" cy="6" r="2"/>
            <path d="M18 11c0 5-4 7-6 8"/>
            <path d="M18 8a6 6 0 0 0-12 0c0 4.8 2.3 7.2 6 10"/>
          </svg>
          Enter your research hypothesis
        </label>
        <Textarea
          id="hypothesis"
          placeholder="Example: Higher levels of mindfulness practice lead to reduced stress levels in college students"
          value={hypothesis}
          onChange={(e) => setHypothesis(e.target.value)}
          className="min-h-[120px] transition-shadow focus:shadow-md resize-none"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Be specific and clear. The more focused your hypothesis, the more relevant your results will be.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-base font-medium inline-flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="w-4 h-4 mr-2 text-primary"
          >
            <path d="M21 9V8a2 2 0 0 0-2-2h-5.5"/>
            <path d="M9 6H3a2 2 0 0 0-2 2v1"/>
            <path d="M3 16v-1a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1"/>
            <path d="M9 18h12a2 2 0 0 0 2-2v-1"/>
            <path d="M3 18v-1a2 2 0 0 1 2-2h4.5"/>
          </svg>
          Select Database
        </label>
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant={selectedApi === 'openalex' ? 'default' : 'outline'}
            onClick={() => setSelectedApi('openalex')}
            className={`flex items-center justify-center h-14 ${selectedApi === 'openalex' ? 'ring-2 ring-primary/20' : ''}`}
          >
            <div className="flex flex-col items-center">
              <span className="font-semibold">OpenAlex</span>
              <span className="text-xs mt-1 opacity-80">Broad Coverage</span>
            </div>
          </Button>
          <Button
            type="button"
            variant={selectedApi === 'semanticscholar' ? 'default' : 'outline'}
            onClick={() => setSelectedApi('semanticscholar')}
            className={`flex items-center justify-center h-14 ${selectedApi === 'semanticscholar' ? 'ring-2 ring-primary/20' : ''}`}
          >
            <div className="flex flex-col items-center">
              <span className="font-semibold">Semantic Scholar</span>
              <span className="text-xs mt-1 opacity-80">AI Research</span>
            </div>
          </Button>
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full py-6 text-base mt-2" 
        disabled={!hypothesis.trim()}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="w-5 h-5 mr-2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        Search Research Papers
      </Button>
    </form>
  );
} 