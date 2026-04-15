import React from 'react';

interface PaginationProps {
  currentPage: number;
  onPrev: () => void;
  onNext: () => void;
  hasNextPage: boolean;
}

export function Pagination({ currentPage, onPrev, onNext, hasNextPage }: PaginationProps) {
  return (
    <div className="pagination">
      <button 
        className="btn-icon" 
        onClick={onPrev} 
        disabled={currentPage === 1}
      >
        Previous
      </button>

      <span className="page-info">
        Page {currentPage}
      </span>

      <button 
        className="btn-icon" 
        onClick={onNext} 
        disabled={!hasNextPage}
      >
        Next
      </button>
    </div>
  );
}
