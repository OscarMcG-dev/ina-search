"use client"

import { useState } from 'react';
import type { Work } from '@/lib/openalex';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

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
  const [isSending, setIsSending] = useState(false);
  const authorsDisplay = formatAuthors(paper.authorships);
  
  const sendToOneNote = async () => {
    try {
      setIsSending(true);
      const email = localStorage.getItem('user_email') || '';
      
      let userEmail = email;
      if (!userEmail) {
        // Prompt for email if not stored
        userEmail = window.prompt('Please enter your email address to receive this paper in OneNote:') || '';
        if (!userEmail || !userEmail.includes('@')) {
          setIsSending(false);
          toast({
            variant: "destructive",
            title: "Invalid Email",
            description: "Please provide a valid email address.",
          });
          return;
        }
        
        // Save the email for future use
        localStorage.setItem('user_email', userEmail);
      }
      
      const response = await fetch('/api/send-to-onenote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paper,
          email: userEmail
        }),
      });
      
      // Handle non-JSON responses (like HTML error pages)
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned a non-JSON response');
      }
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || result.details || 'Failed to send to OneNote');
      }
      
      // Display success message, including note about verified email if present
      if (result.note) {
        toast({
          title: "Email Sent with Limitations",
          description: result.note,
        });
      } else {
        toast({
          title: "Success!",
          description: "Paper sent to your email for OneNote",
        });
      }
    } catch (error) {
      console.error('Failed to send to OneNote:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to send: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
      });
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg leading-tight">{paper.title}</CardTitle>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mb-3">
          <div className="flex items-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-3.5 h-3.5 mr-1 text-muted-foreground/70"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>{authorsDisplay}</span>
          </div>
          
          <div className="flex items-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-3.5 h-3.5 mr-1 text-muted-foreground/70"
            >
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
            <span>{paper.publication_year}</span>
          </div>
          
          <div className="flex items-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-3.5 h-3.5 mr-1 text-muted-foreground/70"
            >
              <path d="M15 3v18"/>
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M7 7h1"/>
              <path d="M7 12h1"/>
              <path d="M7 17h1"/>
            </svg>
            <span>{paper.cited_by_count} citations</span>
          </div>
        </div>

        {paper.abstract && (
          <p className="text-sm line-clamp-3 text-card-foreground/90 mt-2">{paper.abstract}</p>
        )}
      </CardContent>

      <CardFooter className="flex flex-wrap gap-3 pt-2">
        {paper.open_access_url && (
          <Button
            variant="default"
            size="sm"
            onClick={() => window.open(paper.open_access_url, '_blank')}
            className="flex items-center"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-3.5 h-3.5 mr-1"
            >
              <path d="M12 2a8 8 0 0 0-8 8c0 5.2 8 12 8 12s8-6.8 8-12a8 8 0 0 0-8-8Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Read Paper
          </Button>
        )}
        
        {paper.doi && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`https://doi.org/${paper.doi}`, '_blank')}
            className="flex items-center"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-3.5 h-3.5 mr-1"
            >
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
              <rect width="6" height="6" x="9" y="3" rx="1" />
              <path d="M9 14v-2c0-1.1.9-2 2-2h2" />
              <path d="M13 14h2" />
              <path d="M9 18h6" />
            </svg>
            View DOI
          </Button>
        )}
        
        <Button
          variant="secondary"
          size="sm"
          onClick={sendToOneNote}
          disabled={isSending}
          className="flex items-center"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="w-3.5 h-3.5 mr-1"
          >
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2z" />
            <path d="M16 3v4" />
            <path d="M8 3v4" />
            <path d="M3 11h18" />
            <path d="M11 15h6" />
            <path d="M11 19h6" />
          </svg>
          {isSending ? 'Sending...' : 'Send to OneNote'}
        </Button>
      </CardFooter>
    </Card>
  );
}

interface ResearchPaperGridProps {
  papers: Work[];
}

export function ResearchPaperGrid({ papers }: ResearchPaperGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      {papers.map((paper) => (
        <ResearchPaperCard key={paper.id} paper={paper} />
      ))}
    </div>
  );
} 