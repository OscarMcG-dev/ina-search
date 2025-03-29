'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SearchIcon, SlidersHorizontal, ChevronUp, ChevronDown } from 'lucide-react';
import { FilterOptions, FilterSidebar } from './FilterSidebar';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Define the schema for form validation
const formSchema = z.object({
  query: z.string().min(2, {
    message: 'Query must be at least 2 characters.',
  }),
  apiSource: z.enum(['semantic-scholar', 'pubmed', 'arxiv']),
});

// Define the props type for ResearchSearch component
export interface ResearchSearchProps {
  onSearch: (query: string, apiSource: string, filters?: FilterOptions) => void;
  initialQuery?: string;
  initialApiSource?: 'semantic-scholar' | 'pubmed' | 'arxiv';
  initialFilters?: FilterOptions;
}

// Define the types for our form values
type FormValues = z.infer<typeof formSchema>;

export function ResearchSearch({ 
  onSearch, 
  initialQuery = '', 
  initialApiSource = 'semantic-scholar',
  initialFilters
}: ResearchSearchProps) {
  // Default filter values
  const currentYear = new Date().getFullYear();
  const defaultFilters: FilterOptions = {
    yearRange: [1990, currentYear],
    selectedYearRange: [1990, currentYear],
    citationCount: {
      min: 0,
      max: 1000
    },
    selectedCitationRange: [0, 1000],
    publicationTypes: ['journal-article', 'conference-paper', 'review-article', 'systematic-review', 'meta-analysis', 'book-chapter'],
    selectedPublicationTypes: [],
    openAccessOnly: false
  };

  // State for filter settings
  const [filters, setFilters] = useState<FilterOptions>(initialFilters || defaultFilters);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Initialize the form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: initialQuery,
      apiSource: initialApiSource,
    },
  });

  // Handle form submission
  const handleSubmit = (values: FormValues) => {
    onSearch(values.query, values.apiSource, filters);
  };

  const toggleFilters = () => {
    setFiltersExpanded(!filtersExpanded);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 p-4 rounded-lg border bg-card shadow-sm">
        <div className="space-y-3">
          <FormField
            control={form.control}
            name="query"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Enter your research hypothesis or question..."
                      className="pl-9 h-9 pr-24"
                      {...field}
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={toggleFilters}
                      className="absolute right-1 top-1 p-1 h-7 w-7"
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex items-center gap-2">
            <FormField
              control={form.control}
              name="apiSource"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Tabs
                      value={field.value}
                      onValueChange={field.onChange}
                      className="w-full"
                    >
                      <TabsList className="grid grid-cols-3 h-8">
                        <TabsTrigger value="semantic-scholar">
                          Semantic Scholar
                        </TabsTrigger>
                        <TabsTrigger value="pubmed">PubMed</TabsTrigger>
                        <TabsTrigger value="arxiv">arXiv</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" size="sm" className="h-8">
              Search
            </Button>
          </div>
        </div>

        {filtersExpanded && (
          <div className="mt-3 pt-3 border-t animate-in fade-in slide-in-from-top-1 duration-200">
            <FilterSidebar 
              filters={filters} 
              onFilterChange={(newFilters) => setFilters({ ...filters, ...newFilters })} 
              showResetButton={true}
              className="w-full bg-background/30 p-3 rounded-md"
            />
          </div>
        )}
      </form>
    </Form>
  );
} 