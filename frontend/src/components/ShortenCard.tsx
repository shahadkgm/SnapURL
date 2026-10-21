import React, { useState } from 'react';
import { Link2, X, ClipboardPaste, ArrowRight, SlidersHorizontal, Lock } from 'lucide-react';
import { api, type User, type UrlItem } from '../api';

interface ShortenCardProps {
  user: User | null;
  onUrlCreated: (urlItem: UrlItem) => void;
  onNavigateAuth: (mode: 'login' | 'register') => void;
}

export const ShortenCard: React.FC<ShortenCardProps> = ({
  user,
  onUrlCreated,
  onNavigateAuth,
}) => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [title, setTitle] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setOriginalUrl(text.trim());
      }
    } catch {
      // Clipboard access might be blocked in some browser settings
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    let urlToSubmit = originalUrl.trim();
    if (!urlToSubmit) return;

    if (!urlToSubmit.startsWith('http://') && !urlToSubmit.startsWith('https://')) {
      urlToSubmit = `https://${urlToSubmit}`;
    }

    if (!user) {
      onNavigateAuth('login');
      return;
    }

    setIsSubmitting(true);
    try {
      const newUrl = await api.createUrl({
        originalUrl: urlToSubmit,
        title: title.trim() || undefined,
        customCode: customCode.trim() || undefined,
      });

      onUrlCreated(newUrl);
      setOriginalUrl('');
      setTitle('');
      setCustomCode('');
      setShowOptions(false);
    } catch (err: any) {
      setFormError(err.message || 'Unable to shorten this URL. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="shorten-card glass-panel fade-in">
      <form onSubmit={handleSubmit} className="shorten-form">
        <div className="url-input-container">
          <Link2 size={18} className="url-input-icon" />
          <input
            type="text"
            className="url-input"
            placeholder="Paste your link here (e.g. https://github.com/profile)..."
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            required
          />

          {originalUrl ? (
            <button
              type="button"
              className="icon-action-btn"
              onClick={() => setOriginalUrl('')}
              title="Clear input"
            >
              <X size={15} />
            </button>
          ) : (
            <button
              type="button"
              className="paste-action-btn"
              onClick={handlePasteClipboard}
              title="Paste from clipboard"
            >
              <ClipboardPaste size={14} />
              <span>Paste</span>
            </button>
          )}

          <button
            type="submit"
            className="btn-primary shorten-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="spinner"></span>
            ) : (
              <>
                <span>{user ? 'Shorten' : 'Shorten Link'}</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>

        {/* Optional Custom Alias */}
        {user && (
          <div className="options-container">
            <button
              type="button"
              className="options-toggle-btn"
              onClick={() => setShowOptions(!showOptions)}
            >
              <SlidersHorizontal size={13} />
              <span>{showOptions ? 'Hide options' : 'Add custom alias or title'}</span>
            </button>

            {showOptions && (
              <div className="optional-fields fade-in">
                <div className="field-col">
                  <label className="field-label">Link Title (optional)</label>
                  <input
                    type="text"
                    className="input-field no-icon sm-input"
                    placeholder="e.g. Work Portfolio"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="field-col">
                  <label className="field-label">Custom Alias (optional)</label>
                  <input
                    type="text"
                    className="input-field no-icon sm-input"
                    placeholder="e.g. my-project"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </form>

      {formError && (
        <div className="form-error-banner">
          <span>{formError}</span>
        </div>
      )}

      {!user && (
        <div className="auth-hint-banner">
          <Lock size={14} />
          <span>
            Sign in or create a free account to track clicks and keep your links.{' '}
            <button
              type="button"
              className="inline-auth-btn"
              onClick={() => onNavigateAuth('login')}
            >
              Sign in here
            </button>
          </span>
        </div>
      )}
    </div>
  );
};
