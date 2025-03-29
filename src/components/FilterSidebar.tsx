import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export interface FilterOptions {
  yearRange: [number, number];
  selectedYearRange: [number, number];
  citationCount: {
    min: number;
    max: number;
  };
  selectedCitationRange: [number, number];
  publicationTypes: string[];
  selectedPublicationTypes: string[];
  openAccessOnly: boolean;
}

interface FilterSidebarProps {
  filters: FilterOptions;
  onFilterChange: (filters: Partial<FilterOptions>) => void;
  showResetButton?: boolean;
  className?: string;
}

export function FilterSidebar({ filters, onFilterChange, showResetButton = false, className = '' }: FilterSidebarProps) {
  const handleYearRangeChange = (value: number[]) => {
    onFilterChange({
      selectedYearRange: value as [number, number]
    });
  };

  const handleCitationRangeChange = (value: number[]) => {
    onFilterChange({
      selectedCitationRange: value as [number, number]
    });
  };

  const handlePublicationTypeChange = (type: string, checked: boolean) => {
    const newTypes = checked
      ? [...filters.selectedPublicationTypes, type]
      : filters.selectedPublicationTypes.filter(t => t !== type);
    
    onFilterChange({
      selectedPublicationTypes: newTypes
    });
  };

  const handleOpenAccessChange = (checked: boolean) => {
    onFilterChange({
      openAccessOnly: checked
    });
  };

  const resetFilters = () => {
    onFilterChange({
      selectedYearRange: [1990, new Date().getFullYear()],
      selectedCitationRange: [5, filters.citationCount.max],
      selectedPublicationTypes: [],
      openAccessOnly: false
    });
  };

  const formatPublicationType = (type: string) => {
    return type
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const renderCompactFilterContent = () => (
    <div className="space-y-4">
      {/* Year Range Filter */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium">Publication Year</h3>
          <span className="text-xs text-muted-foreground">
            {filters.selectedYearRange[0]} - {filters.selectedYearRange[1]}
          </span>
        </div>
        <Slider
          value={filters.selectedYearRange}
          min={filters.yearRange[0]}
          max={filters.yearRange[1]}
          step={1}
          minStepsBetweenThumbs={1}
          onValueChange={handleYearRangeChange}
          className="py-1.5"
        />
      </div>

      <Separator className="my-1 bg-muted/30" />

      {/* Citation Count Filter */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium">Citation Count</h3>
          <span className="text-xs text-muted-foreground">
            {filters.selectedCitationRange[0]} - {filters.selectedCitationRange[1]}+
          </span>
        </div>
        <Slider
          value={filters.selectedCitationRange}
          min={filters.citationCount.min}
          max={filters.citationCount.max}
          step={5}
          minStepsBetweenThumbs={5}
          onValueChange={handleCitationRangeChange}
          className="py-1.5"
        />
      </div>

      <Separator className="my-1 bg-muted/30" />

      {/* Open Access Filter */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="open-access-compact"
            checked={filters.openAccessOnly}
            onCheckedChange={(checked) => handleOpenAccessChange(checked === true)}
          />
          <Label htmlFor="open-access-compact" className="text-xs font-medium cursor-pointer">Open Access Only</Label>
        </div>
        
        {/* Publication Types */}
        <div className="flex items-center gap-2">
          <Label className="text-xs font-medium">Publication Types:</Label>
          <select 
            className="text-xs bg-background/40 rounded border border-muted/50 py-1 px-2"
            value=""
            onChange={(e) => {
              if (e.target.value) {
                handlePublicationTypeChange(e.target.value, !filters.selectedPublicationTypes.includes(e.target.value));
              }
            }}
          >
            <option value="">Select type...</option>
            {filters.publicationTypes.map(type => (
              <option key={type} value={type}>
                {formatPublicationType(type)} 
                {filters.selectedPublicationTypes.includes(type) ? ' ✓' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filters.selectedPublicationTypes.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {filters.selectedPublicationTypes.map(type => (
            <div key={type} className="bg-primary/10 text-xs rounded px-2 py-0.5 flex items-center gap-1">
              <span>{formatPublicationType(type)}</span>
              <button 
                onClick={() => handlePublicationTypeChange(type, false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderFullFilterContent = () => (
    <div className="space-y-6">
      {/* Year Range Filter */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Publication Year</h3>
          <span className="text-xs text-muted-foreground">
            {filters.selectedYearRange[0]} - {filters.selectedYearRange[1]}
          </span>
        </div>
        <Slider
          value={filters.selectedYearRange}
          min={filters.yearRange[0]}
          max={filters.yearRange[1]}
          step={1}
          minStepsBetweenThumbs={1}
          onValueChange={handleYearRangeChange}
          className="py-2"
        />
      </div>

      <Separator className="my-1 bg-muted/50" />

      {/* Citation Count Filter */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Citation Count</h3>
          <span className="text-xs text-muted-foreground">
            {filters.selectedCitationRange[0]} - {filters.selectedCitationRange[1]}+
          </span>
        </div>
        <Slider
          value={filters.selectedCitationRange}
          min={filters.citationCount.min}
          max={filters.citationCount.max}
          step={5}
          minStepsBetweenThumbs={5}
          onValueChange={handleCitationRangeChange}
          className="py-2"
        />
      </div>

      <Separator className="my-1 bg-muted/50" />

      {/* Publication Type Filter */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Publication Type</h3>
        <div className="grid grid-cols-1 gap-2">
          {filters.publicationTypes.map(type => (
            <div key={type} className="flex items-center space-x-2 bg-background/30 rounded-md p-2 hover:bg-background/50 transition-colors">
              <Checkbox
                id={`type-${type}`}
                checked={filters.selectedPublicationTypes.includes(type)}
                onCheckedChange={(checked) => 
                  handlePublicationTypeChange(type, checked === true)
                }
              />
              <Label htmlFor={`type-${type}`} className="text-sm flex-grow cursor-pointer">
                {formatPublicationType(type)}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator className="my-1 bg-muted/50" />

      {/* Open Access Filter */}
      <div className="flex items-center space-x-2 bg-background/30 rounded-md p-2 hover:bg-background/50 transition-colors">
        <Checkbox
          id="open-access"
          checked={filters.openAccessOnly}
          onCheckedChange={(checked) => handleOpenAccessChange(checked === true)}
        />
        <Label htmlFor="open-access" className="text-sm flex-grow cursor-pointer">Open Access Only</Label>
      </div>
    </div>
  );

  // For expandable inline version (compact)
  if (showResetButton) {
    return (
      <div className={className}>
        <div className="flex items-center justify-between mb-2">
          <Button 
            variant="ghost" 
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={resetFilters}
          >
            Reset Filters
          </Button>
        </div>
        {renderCompactFilterContent()}
      </div>
    );
  }
  
  // For the normal sidebar
  return (
    <Card className={`sticky top-4 w-full shadow-sm ${className}`}>
      <CardHeader className="pb-2 space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">Filters</CardTitle>
          <Button 
            variant="ghost" 
            className="h-8 px-2 text-xs"
            onClick={resetFilters}
          >
            Reset All
          </Button>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          Refine your research results
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderFullFilterContent()}
      </CardContent>
    </Card>
  );
} 