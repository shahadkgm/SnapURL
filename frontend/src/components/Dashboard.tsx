import React from 'react';
import { 
  Link2, 
  MousePointerClick, 
  Search, 
  X, 
  BarChart2, 
  ExternalLink, 
  Copy, 
  Check, 
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { UrlItem } from '../api';
import { API_BASE_URL } from '../routes/apiRoutes';

interface DashboardProps {
  urls: UrlItem[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isLoading: boolean;
  copiedId: string | null;
  onCopy: (urlItem: UrlItem) => void;
  onDelete: (id: string) => void;
  currentPage?: number;
  totalPages?: number;
  totalCount?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  urls,
  searchQuery,
  onSearchChange,
  isLoading,
  copiedId,
  onCopy,
  onDelete,
  currentPage = 1,
  totalPages = 1,
  totalCount,
  pageSize = 10,
  onPageChange,
}) => {
  const displayTotalLinks = totalCount !== undefined ? totalCount : urls.length;
  const totalClicks = urls.reduce((sum, item) => sum + (item.clicks || 0), 0);

  // If local search is active or backend searched
  const filteredUrls = urls.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (item.title && item.title.toLowerCase().includes(query)) ||
      item.shortCode.toLowerCase().includes(query) ||
      item.originalUrl.toLowerCase().includes(query)
    );
  });

  const startItem = totalCount !== undefined && totalCount > 0
    ? (currentPage - 1) * pageSize + 1
    : 1;
  const endItem = totalCount !== undefined
    ? Math.min(currentPage * pageSize, totalCount)
    : filteredUrls.length;

  return (
    <section className="dashboard-section fade-in">
      {/* Quick Stats Summary */}
      <div className="stats-row">
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper">
            <Link2 size={18} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{displayTotalLinks}</span>
            <span className="stat-label">Total Links</span>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper">
            <MousePointerClick size={18} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{totalClicks}</span>
            <span className="stat-label">Total Clicks (Current Page)</span>
          </div>
        </div>
      </div>

      {/* Links Management Header */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Your Links</h2>
          <p className="section-subtitle">Manage, search, and track your shortened URLs</p>
        </div>

        {(displayTotalLinks > 0 || searchQuery) && (
          <div className="search-box">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search links..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="icon-action-btn"
                onClick={() => onSearchChange('')}
                title="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="loading-state glass-panel">
          <span className="spinner"></span>
          <span>Loading your links...</span>
        </div>
      ) : displayTotalLinks === 0 && !searchQuery ? (
        <div className="empty-state glass-panel">
          <div className="empty-icon-box">
            <Link2 size={24} />
          </div>
          <h3>No links yet</h3>
          <p>Paste a URL above to create your first shortened link.</p>
        </div>
      ) : filteredUrls.length === 0 ? (
        <div className="empty-state glass-panel">
          <p>No links found matching "{searchQuery}"</p>
        </div>
      ) : (
        <>
          <div className="urls-list">
            {filteredUrls.map((item) => (
              <div key={item.id} className="url-item-card glass-panel">
                <div className="url-item-main">
                  <div className="url-title-row">
                    <h4 className="url-item-title">{item.title || 'Untitled Link'}</h4>
                    <span className="badge badge-success">
                      <BarChart2 size={12} />
                      {item.clicks} {item.clicks === 1 ? 'click' : 'clicks'}
                    </span>
                  </div>

                  <div className="short-url-row">
                    <a
                      href={`${API_BASE_URL}/r/${item.shortCode}`}
                      target="_blank"
                      rel="noreferrer"
                      className="short-link-anchor"
                    >
                      {API_BASE_URL}/r/{item.shortCode}
                      <ExternalLink size={12} />
                    </a>
                  </div>

                  <p className="original-url-text" title={item.originalUrl}>
                    {item.originalUrl}
                  </p>
                </div>

                <div className="url-item-actions">
                  <button
                    type="button"
                    className="btn-secondary btn-icon"
                    onClick={() => onCopy(item)}
                    title="Copy link"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check size={14} className="text-success" />
                        <span className="text-success">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="btn-secondary btn-icon text-danger"
                    onClick={() => onDelete(item.id)}
                    title="Delete URL"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {onPageChange && (totalPages > 1 || (totalCount !== undefined && totalCount > pageSize)) && (
            <div className="pagination-wrapper glass-panel">
              <div className="pagination-info">
                Showing <span className="font-semibold">{startItem}</span> to{' '}
                <span className="font-semibold">{endItem}</span> of{' '}
                <span className="font-semibold">{totalCount ?? filteredUrls.length}</span> links
              </div>

              <div className="pagination-controls">
                <button
                  type="button"
                  className="pagination-btn"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage <= 1 || isLoading}
                  title="Previous page"
                >
                  <ChevronLeft size={16} />
                  <span>Prev</span>
                </button>

                <div className="pagination-pages">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => {
                      // Show first, last, current, and adjacent pages
                      return (
                        p === 1 ||
                        p === totalPages ||
                        Math.abs(p - currentPage) <= 1
                      );
                    })
                    .reduce<(number | string)[]>((acc, page, idx, arr) => {
                      if (idx > 0 && page - (arr[idx - 1] as number) > 1) {
                        acc.push('...');
                      }
                      acc.push(page);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      typeof item === 'string' ? (
                        <span key={`ellipsis-${idx}`} className="pagination-ellipsis">
                          {item}
                        </span>
                      ) : (
                        <button
                          key={item}
                          type="button"
                          className={`pagination-page-btn ${item === currentPage ? 'active' : ''}`}
                          onClick={() => onPageChange(item)}
                          disabled={isLoading}
                        >
                          {item}
                        </button>
                      ),
                    )}
                </div>

                <button
                  type="button"
                  className="pagination-btn"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages || isLoading}
                  title="Next page"
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
};
