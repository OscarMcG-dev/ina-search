import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// A tailwind class name helper utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAuthors(authors: Array<{ author: { display_name: string } }>) {
  return authors
    .map((a) => a.author.display_name)
    .slice(0, 3)
    .join(", ") + (authors.length > 3 ? " et al." : "");
}

// Calculate a relevance score for a research paper
export function calculateRelevanceScore(paper: any): number {
  let score = 0;
  
  // Heavily prioritize citations
  if (paper.cited_by_count) {
    // Logarithmic scale for citations to better differentiate between ranges
    // This gives more weight to the difference between 5 and 50 citations than between 500 and 550
    score += Math.log10(paper.cited_by_count + 1) * 5; // +1 to handle 0 citations, *5 to scale up
    
    // Additional boost for papers with significant citations
    if (paper.cited_by_count >= 50) {
      score += 10;
    } else if (paper.cited_by_count >= 20) {
      score += 7;
    } else if (paper.cited_by_count >= 10) {
      score += 5;
    } else if (paper.cited_by_count >= 5) {
      score += 2;
    }
    
    // Penalty for papers with very few citations - they must be super relevant in other ways to surface
    if (paper.cited_by_count < 5) {
      score -= 5;
    }
  } else {
    // Significant penalty for papers with no citation information
    score -= 7;
  }
  
  // Recency bonus - recent papers may be more relevant
  const currentYear = new Date().getFullYear();
  if (paper.publication_year) {
    // Give higher scores to papers published in the last 5 years
    const yearDiff = currentYear - paper.publication_year;
    if (yearDiff <= 5) {
      score += (5 - yearDiff) * 1.5; // Increased weight for recency
    }
  }
  
  // Open access bonus
  if (paper.is_open_access) {
    score += 2;
  }
  
  // Having an abstract is a good signal
  if (paper.abstract && paper.abstract.length > 100) {
    score += 3;
  }
  
  return score;
}

/**
 * Creates a debounced version of a function
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay
 * @returns A debounced version of the original function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
  };
} 