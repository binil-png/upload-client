import React from 'react';

interface PaginationProps {
  currentPage: number;
  onPrev: () => void;
  onNext: () => void;
  hasNextPage: boolean;
}

export function Pagination({ currentPage, onPrev, onNext, hasNextPage }: PaginationProps) {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50/50 border-t border-slate-100">
      <button 
        className="btn-icon-soft flex items-center gap-1.5" 
        onClick={onPrev} 
        disabled={currentPage === 1}
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
        Prev
      </button>

      <span className="text-xs font-semibold text-slate-500">
        Page <span className="text-indigo-600">{currentPage}</span>
      </span>

      <button 
        className="btn-icon-soft flex items-center gap-1.5" 
        onClick={onNext} 
        disabled={!hasNextPage}
      >
        Next
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
      </button>
    </div>
  );
}
