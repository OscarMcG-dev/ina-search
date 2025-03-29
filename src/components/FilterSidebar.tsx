import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { Slider } from '../components/ui/slider';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';

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
  const handleYearChange = (values: number[]) => {
    onFilterChange({
      selectedYearRange: [values[0], values[1]]
    });
  };

  const handleCitationChange = (values: number[]) => {
    onFilterChange({
      selectedCitationRange: [values[0], values[1]]
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

  return (
    <aside className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="p-4 bg-muted/50">
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
      
      <div className="p-4 space-y-6">
        {/* Year Range Filter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Publication Year</Label>
            <span className="text-xs text-muted-foreground">
              {filters.selectedYearRange[0]} - {filters.selectedYearRange[1]}
            </span>
          </div>
          
          <Slider
            min={filters.yearRange[0]}
            max={filters.yearRange[1]}
            step={1}
            value={[filters.selectedYearRange[0], filters.selectedYearRange[1]]}
            onValueChange={handleYearChange}
            className="mt-2"
          />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{filters.yearRange[0]}</span>
            <span>{filters.yearRange[1]}</span>
          </div>
        </div>
        
        <Separator />
        
        {/* Citation Count Filter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Citation Count</Label>
            <span className="text-xs text-muted-foreground">
              {filters.selectedCitationRange[0]}+ citations
              {filters.selectedCitationRange[1] < filters.citationCount.max && 
                ` to ${filters.selectedCitationRange[1]}`}
            </span>
          </div>
          
          <Slider
            min={filters.citationCount.min}
            max={filters.citationCount.max}
            step={5}
            value={[filters.selectedCitationRange[0], filters.selectedCitationRange[1]]}
            onValueChange={handleCitationChange}
            className="mt-2"
          />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{filters.citationCount.min}</span>
            <span>{filters.citationCount.max}+</span>
          </div>
        </div>
        
        <Separator />
        
        {/* Publication Type Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Publication Type</Label>
          
          <div className="space-y-2 mt-1">
            {filters.publicationTypes.map(type => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`publication-type-${type}`}
                  checked={filters.selectedPublicationTypes.includes(type)}
                  onCheckedChange={(checked) => 
                    handlePublicationTypeChange(type, checked as boolean)
                  }
                />
                <label
                  htmlFor={`publication-type-${type}`}
                  className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {type.split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <Separator />
        
        {/* Open Access Filter */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="open-access" className="text-sm font-medium">Open Access Only</Label>
            <p className="text-xs text-muted-foreground">Show only freely available papers</p>
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