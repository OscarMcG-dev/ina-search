"use client"

import { useEffect, useRef, useState } from 'react';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { Slider } from '../components/ui/slider';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';
import { debounce } from '@/lib/utils';

export interface FilterOptions {
  yearRange: [number, number]; // Min and max possible years
  selectedYearRange: [number, number]; // Currently selected range
  citationCount: {
    min: number;
    max: number;
  };
  selectedCitationRange: [number, number]; // Currently selected range
  publicationTypes: string[];
  selectedPublicationTypes: string[];
  openAccessOnly: boolean;
}

interface FilterSidebarProps {
  filters: FilterOptions;
  onFilterChange: (newFilters: Partial<FilterOptions>) => void;
}

export function FilterSidebar({ filters, onFilterChange }: FilterSidebarProps) {
  // State to track the local UI values (for immediate feedback)
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);
  
  // Create the debounced filter change function - only created once
  const debouncedFilterChange = useRef(
    debounce((newFilters: Partial<FilterOptions>) => {
      onFilterChange(newFilters);
    }, 800)
  ).current;
  
  // Immediately update the UI state, but debounce the actual search
  const handleYearChange = (values: number[]) => {
    // Ensure we have exactly two values for the tuple
    const yearRange: [number, number] = [values[0], values[1]];
    
    // Update the UI immediately
    setLocalFilters(prev => ({
      ...prev,
      selectedYearRange: yearRange
    }));
    
    // Debounce the actual search
    debouncedFilterChange({
      selectedYearRange: yearRange
    });
  };

  const handleCitationChange = (values: number[]) => {
    // Ensure we have exactly two values for the tuple
    const citationRange: [number, number] = [values[0], values[1]];
    
    // Update the UI immediately
    setLocalFilters(prev => ({
      ...prev,
      selectedCitationRange: citationRange
    }));
    
    // Debounce the actual search
    debouncedFilterChange({
      selectedCitationRange: citationRange
    });
  };

  const handlePublicationTypeChange = (type: string, checked: boolean) => {
    const newSelectedTypes = checked
      ? [...filters.selectedPublicationTypes, type]
      : filters.selectedPublicationTypes.filter(t => t !== type);

    onFilterChange({
      selectedPublicationTypes: newSelectedTypes
    });
  };

  const handleOpenAccessChange = (checked: boolean) => {
    onFilterChange({
      openAccessOnly: checked
    });
  };

  const resetAllFilters = () => {
    onFilterChange({
      selectedYearRange: [filters.yearRange[0], filters.yearRange[1]],
      selectedCitationRange: [0, filters.citationCount.max],
      selectedPublicationTypes: [],
      openAccessOnly: false
    });
  };
  
  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  return (
    <aside className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="p-4 bg-slate-100 dark:bg-slate-800">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-medium text-base">Filter Results</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={resetAllFilters}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Reset All
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Refine your research paper results</p>
      </div>
      
      <div className="p-4 space-y-8">
        {/* Year Range Filter */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Publication Year</Label>
            <span className="text-xs font-medium px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded-md">
              {localFilters.selectedYearRange[0]} - {localFilters.selectedYearRange[1]}
            </span>
          </div>
          
          <Slider
            min={filters.yearRange[0]}
            max={filters.yearRange[1]}
            step={1}
            value={[localFilters.selectedYearRange[0], localFilters.selectedYearRange[1]]}
            onValueChange={handleYearChange}
            className="mt-3"
          />
          
          <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
            <span>{filters.yearRange[0]}</span>
            <span>{filters.yearRange[1]}</span>
          </div>
        </div>
        
        <Separator className="my-2 bg-slate-200 dark:bg-slate-700" />
        
        {/* Citation Count Filter */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Citation Count</Label>
            <span className="text-xs font-medium px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded-md">
              {localFilters.selectedCitationRange[0]}+ citations
              {localFilters.selectedCitationRange[1] < filters.citationCount.max && 
                ` to ${localFilters.selectedCitationRange[1]}`}
            </span>
          </div>
          
          <Slider
            min={filters.citationCount.min}
            max={filters.citationCount.max}
            step={5}
            value={[localFilters.selectedCitationRange[0], localFilters.selectedCitationRange[1]]}
            onValueChange={handleCitationChange}
            className="mt-3"
          />
          
          <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
            <span>{filters.citationCount.min}</span>
            <span>{filters.citationCount.max}+</span>
          </div>
        </div>
        
        <Separator className="my-2 bg-slate-200 dark:bg-slate-700" />
        
        {/* Publication Type Filter */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold">Publication Type</Label>
          
          <div className="space-y-3 mt-2">
            {filters.publicationTypes.map(type => (
              <div key={type} className="flex items-center space-x-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
                <Checkbox
                  id={`publication-type-${type}`}
                  checked={filters.selectedPublicationTypes.includes(type)}
                  onCheckedChange={(checked) => 
                    handlePublicationTypeChange(type, checked as boolean)
                  }
                />
                <label
                  htmlFor={`publication-type-${type}`}
                  className="text-sm font-medium cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {type.split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <Separator className="my-2 bg-slate-200 dark:bg-slate-700" />
        
        {/* Open Access Filter */}
        <div className="flex items-center justify-between p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
          <div className="space-y-1">
            <Label htmlFor="open-access" className="text-sm font-semibold">Open Access Only</Label>
            <p className="text-xs text-slate-600 dark:text-slate-400">Show only freely available papers</p>
          </div>
          <Switch
            id="open-access"
            checked={filters.openAccessOnly}
            onCheckedChange={handleOpenAccessChange}
          />
        </div>
      </div>
    </aside>
  );
} 