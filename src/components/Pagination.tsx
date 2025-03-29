import React from 'react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  resultsPerPage: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalResults,
  resultsPerPage,
  onPageChange,
}: PaginationProps) {
  // Calculate the range of page numbers to display
  const getPageNumbers = () => {
    // Always show the first page
    const pageNumbers = [1];
    
    // Calculate range around current page
    let rangeStart = Math.max(2, currentPage - 1);
    let rangeEnd = Math.min(totalPages - 1, currentPage + 1);
    
    // Adjust range if at the start
    if (currentPage <= 3) {
      rangeEnd = Math.min(4, totalPages - 1);
    }
    
    // Adjust range if at the end
    if (currentPage >= totalPages - 2) {
      rangeStart = Math.max(2, totalPages - 3);
    }
    
    // Add ellipsis before the range if needed
    if (rangeStart > 2) {
      pageNumbers.push(-1); // -1 represents an ellipsis
    }
    
    // Add the range
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pageNumbers.push(i);
    }
    
    // Add ellipsis after the range if needed
    if (rangeEnd < totalPages - 1) {
      pageNumbers.push(-2); // -2 represents an ellipsis (using a different key)
    }
    
    // Always show the last page if there's more than one page
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  // Calculate displayed item range
  const startItem = (currentPage - 1) * resultsPerPage + 1;
  const endItem = Math.min(currentPage * resultsPerPage, totalResults);

  return (
    <div className="mt-8 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium">{startItem}</span> to{' '}
          <span className="font-medium">{endItem}</span> of{' '}
          <span className="font-medium">{totalResults}</span> results
        </p>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
            </svg>
          </Button>
          
          {getPageNumbers().map((pageNum, i) => {
            if (pageNum < 0) {
              // Render ellipsis
              return (
                <span key={`ellipsis-${pageNum}`} className="px-2 text-muted-foreground">
                  …
                </span>
              );
            }
            
            return (
              <Button
                key={`page-${pageNum}`}
                variant={currentPage === pageNum ? 'default' : 'outline'}
                size="sm"
                className={`h-8 w-8 p-0 ${currentPage === pageNum ? 'pointer-events-none' : ''}`}
                onClick={() => onPageChange(pageNum)}
                aria-label={`Page ${pageNum}`}
                aria-current={currentPage === pageNum ? 'page' : undefined}
              >
                {pageNum}
              </Button>
            );
          })}
          
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
} 