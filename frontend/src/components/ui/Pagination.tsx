'use client';

import { Icon } from './Icon';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    let pageNum = i;
    if (totalPages > 5) {
      if (currentPage <= 2) pageNum = i;
      else if (currentPage >= totalPages - 3) pageNum = totalPages - 5 + i;
      else pageNum = currentPage - 2 + i;
    }
    return pageNum;
  });

  return (
    <div className="pagination">
      <div style={{ display: 'flex', gap: 4 }}>
        <button className="icon-button" onClick={() => onPageChange(0)} disabled={currentPage === 0} aria-label="First page">
          <span style={{ display: 'flex', gap: 2 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 17 9 12l4-5"/><path d="M5 12h14"/></svg>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </span>
        </button>
        <button className="icon-button" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 0} aria-label="Previous page">
          <Icon name="chevron" size={16} />
        </button>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {pages.map((pageNum) => (
          <button
            key={pageNum}
            className={`btn ${pageNum === currentPage ? 'btn-primary' : 'btn-secondary'}`}
            style={{ minWidth: 36, padding: '0 8px' }}
            onClick={() => onPageChange(pageNum)}
          >
            {pageNum + 1}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        <button className="icon-button" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages - 1} aria-label="Next page">
          <Icon name="chevron" size={16} />
        </button>
        <button className="icon-button" onClick={() => onPageChange(totalPages - 1)} disabled={currentPage >= totalPages - 1} aria-label="Last page">
          <span style={{ display: 'flex', gap: 2 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/><path d="M19 12H5"/></svg>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </span>
        </button>
      </div>
    </div>
  );
}