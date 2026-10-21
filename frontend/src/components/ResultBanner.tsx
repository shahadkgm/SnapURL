import React from 'react';
import { CheckCircle2, X, Copy, Check, ExternalLink } from 'lucide-react';
import type { UrlItem } from '../api';
import { API_BASE_URL } from '../routes/apiRoutes';

interface ResultBannerProps {
  latestUrl: UrlItem;
  copiedId: string | null;
  onCopy: (urlItem: UrlItem) => void;
  onClose: () => void;
}

export const ResultBanner: React.FC<ResultBannerProps> = ({
  latestUrl,
  copiedId,
  onCopy,
  onClose,
}) => {
  return (
    <div className="result-success-card glass-panel fade-in">
      <div className="result-header">
        <div className="result-title-badge">
          <CheckCircle2 size={16} className="text-success" />
          <span>Your shortened link is ready</span>
        </div>
        <button
          type="button"
          className="icon-action-btn"
          onClick={onClose}
          title="Close"
        >
          <X size={15} />
        </button>
      </div>

      <div className="result-body">
        <div className="result-url-display">
          <span className="result-url-text">
            {API_BASE_URL}/r/{latestUrl.shortCode}
          </span>
        </div>

        <div className="result-actions">
          <button
            type="button"
            className="btn-primary btn-sm"
            onClick={() => onCopy(latestUrl)}
          >
            {copiedId === latestUrl.id ? (
              <>
                <Check size={14} />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy Link</span>
              </>
            )}
          </button>

          <a
            href={`${API_BASE_URL}/r/${latestUrl.shortCode}`}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary btn-sm"
          >
            <ExternalLink size={14} />
            <span>Open</span>
          </a>
        </div>
      </div>
    </div>
  );
};
