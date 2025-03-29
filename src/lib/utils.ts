import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAuthors(authors: Array<{ author: { display_name: string } }>) {
  return authors
    .map((a) => a.author.display_name)
    .slice(0, 3)
    .join(", ") + (authors.length > 3 ? " et al." : "");
}

export function calculateRelevanceScore(work: any): number {
  // This is a simple scoring algorithm that could be improved
  const factors = {
    hasAbstract: work.abstract ? 0.3 : 0,
    citationScore: Math.min((work.cited_by_count || 0) / 1000, 0.3),
    isOpenAccess: work.is_open_access ? 0.2 : 0,
    hasFullText: work.open_access_url ? 0.2 : 0,
  };

  return Object.values(factors).reduce((sum, score) => sum + score, 0);
} 