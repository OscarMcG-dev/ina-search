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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="hypothesis" className="block text-sm font-medium">
          Enter your research hypothesis
        </label>
        <Textarea
          id="hypothesis"
          placeholder="Example: Higher levels of mindfulness practice lead to reduced stress levels in college students"
          value={hypothesis}
          onChange={(e) => setHypothesis(e.target.value)}
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="api" className="block text-sm font-medium">
          Select Research API
        </label>
        <div className="flex space-x-2">
          <Button
            type="button"
            variant={selectedApi === 'openalex' ? 'outline' : 'default'}
            onClick={() => setSelectedApi('openalex')}
          >
            OpenAlex
          </Button>
          <Button
            type="button"
            variant={selectedApi === 'semanticscholar' ? 'outline' : 'default'}
            onClick={() => setSelectedApi('semanticscholar')}
          >
            Semantic Scholar
          </Button>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={!hypothesis.trim()}>
        Search Research Papers
      </Button>
    </form>
  );
} 