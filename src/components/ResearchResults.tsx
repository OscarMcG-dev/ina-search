import type { Work } from '@/lib/openalex';
import { Button } from '@/components/ui/button';

interface ResearchPaperCardProps {
  paper: Work;
}

function formatAuthors(authorships: any[] | undefined) {
  if (!authorships || authorships.length === 0) return 'Unknown';
  
  // Extract author names
  const authors = authorships.map(a => a.author.display_name);
  
  // Use a deterministic truncation approach
  if (authors.length <= 3) {
    return authors.join(', ');
  }
  
  // For more than 3 authors, always show first two followed by "et al."
  return `${authors[0]}, ${authors[1]} et al.`;
}

function ResearchPaperCard({ paper }: ResearchPaperCardProps) {
  const authorsDisplay = formatAuthors(paper.authorships);
  const hasFullText = paper.open_access_url || paper.doi;
  
  return (
    <div className="research-card flex flex-col h-full overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="p-5 flex-grow space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {paper.open_access_url && (
              <span className="inline-flex items-center rounded-full bg-green-950 px-2 py-1 text-xs font-medium text-green-300 ring-1 ring-inset ring-green-600/30">
                Open Access
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {paper.publication_year}
            </span>
          </div>
          <h3 className="font-semibold text-lg leading-tight line-clamp-2">
            {paper.title}
          </h3>
          <div className="flex items-center text-sm text-muted-foreground space-x-2">
            <span>{authorsDisplay}</span>
          </div>
        </div>
        
        {paper.abstract && (
          <div className="pt-2">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {paper.abstract}
            </p>
          </div>
        )}
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-muted-foreground">
              <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
              <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
            </svg>
            <span className="text-sm font-medium">{paper.cited_by_count} citations</span>
          </div>
        </div>
      </div>
      
      {hasFullText && (
        <div className="border-t p-4 bg-muted/20 flex gap-2 flex-wrap">
          {paper.open_access_url && (
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={() => window.open(paper.open_access_url, '_blank')}
            >
              Read Paper
            </Button>
          )}
          {paper.doi && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => window.open(`https://doi.org/${paper.doi}`, '_blank')}
            >
              View DOI
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

interface ResearchPaperGridProps {
  papers: Work[];
}

export function ResearchPaperGrid({ papers }: ResearchPaperGridProps) {
  if (papers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No research papers found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
      {papers.map((paper) => (
        <ResearchPaperCard key={paper.id} paper={paper} />
      ))}
    </div>
  );
} 