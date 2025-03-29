import type { Work } from '@/lib/openalex';
import { Button } from '@/components/ui/button';

interface ResearchPaperCardProps {
  paper: Work;
}

function ResearchPaperCard({ paper }: ResearchPaperCardProps) {
  return (
    <div className="p-4 border rounded-lg shadow-sm bg-card">
      <h3 className="text-lg font-semibold mb-2">{paper.title}</h3>
      
      <div className="text-sm text-muted-foreground mb-4">
        <p>{paper.authorships?.map(a => a.author.display_name).join(', ')}</p>
        <p>Published: {paper.publication_year}</p>
        <p>Citations: {paper.cited_by_count}</p>
      </div>

      {paper.abstract && (
        <p className="text-sm mb-4 line-clamp-3">{paper.abstract}</p>
      )}

      <div className="flex items-center space-x-2">
        {paper.open_access_url && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(paper.open_access_url, '_blank')}
          >
            Read Paper
          </Button>
        )}
        {paper.doi && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(`https://doi.org/${paper.doi}`, '_blank')}
          >
            View DOI
          </Button>
        )}
      </div>
    </div>
  );
}

interface ResearchPaperGridProps {
  papers: Work[];
}

export function ResearchPaperGrid({ papers }: ResearchPaperGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {papers.map((paper) => (
        <ResearchPaperCard key={paper.id} paper={paper} />
      ))}
    </div>
  );
} 