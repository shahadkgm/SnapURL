import { useState, useEffect } from 'react';
import { 
  Link2, 
  Copy, 
  Check, 
  ExternalLink, 
  Trash2, 
  BarChart2, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  Lock,
  ClipboardPaste,
  X,
  SlidersHorizontal,
  Search,
  CheckCircle2,
  MousePointerClick
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { api, type User, type UrlItem } from './api';
import './App.css';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // URL Shortening Form State
  const [originalUrl, setOriginalUrl] = useState('');
  const [title, setTitle] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Newly created URL banner
  const [latestUrl, setLatestUrl] = useState<UrlItem | null>(null);

  // User's URLs & Search
  const [urls, setUrls] = useState<UrlItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingUrls, setIsLoadingUrls] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = api.getUser();
    if (savedUser && api.getToken()) {
      setUser(savedUser);
      loadUserUrls();
    }
  }, []);

  const loadUserUrls = async () => {
    setIsLoadingUrls(true);
    try {
      const data = await api.getMyUrls();
      setUrls(data);
    } catch {
      // Backend error fallback
    } finally {
      setIsLoadingUrls(false);
    }
  };

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleLogout = () => {
    api.removeToken();
    setUser(null);
    setUrls([]);
    setLatestUrl(null);
  };

  const handleAuthSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    loadUserUrls();
  };

  // 1-Click Paste from Clipboard
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

  const handleShortenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!user) {
      handleOpenAuth('login');
      return;
    }

    let urlToSubmit = originalUrl.trim();
    if (!urlToSubmit.startsWith('http://') && !urlToSubmit.startsWith('https://')) {
      urlToSubmit = `https://${urlToSubmit}`;
    }

    setIsSubmitting(true);
    try {
      const newUrl = await api.createUrl({
        originalUrl: urlToSubmit,
        title: title.trim() || undefined,
        customCode: customCode.trim() || undefined,
      });

      setUrls((prev) => [newUrl, ...prev]);
      setLatestUrl(newUrl);
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

  const handleCopyLink = (urlItem: UrlItem) => {
    const fullShortUrl = `http://localhost:3000/r/${urlItem.shortCode}`;
    navigator.clipboard.writeText(fullShortUrl);
    setCopiedId(urlItem.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteUrl = async (id: string) => {
    try {
      await api.deleteUrl(id);
      setUrls((prev) => prev.filter((item) => item.id !== id));
      if (latestUrl?.id === id) {
        setLatestUrl(null);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete URL');
    }
  };

  // Filtered URLs by search query
  const filteredUrls = urls.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      (item.title && item.title.toLowerCase().includes(query)) ||
      item.shortCode.toLowerCase().includes(query) ||
      item.originalUrl.toLowerCase().includes(query)
    );
  });

  const totalClicks = urls.reduce((sum, item) => sum + (item.clicks || 0), 0);

  return (
    <div className="app-layout">
      {/* Navbar */}
      <Navbar
        user={user}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
      />

      <main className="main-content">
        {/* Simple & Human Hero Section */}
        <section className="hero-section">
          <div className="hero-badge fade-in">
            <Link2 size={13} />
            <span>Clean, simple link shortening</span>
          </div>

          <h1 className="hero-heading fade-in">
            Shorten links, without the clutter.
          </h1>

          <p className="hero-description fade-in">
            Turn long, messy URLs into neat links in seconds. 
            Track visits and manage all your links in one straightforward dashboard.
          </p>

          {/* Clean Shorten Card */}
          <div className="shorten-card glass-panel fade-in">
            <form onSubmit={handleShortenSubmit} className="shorten-form">
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
                    onClick={() => handleOpenAuth('login')}
                  >
                    Sign in here
                  </button>
                </span>
              </div>
            )}
          </div>

          {/* Instant Result Card */}
          {latestUrl && (
            <div className="result-success-card glass-panel fade-in">
              <div className="result-header">
                <div className="result-title-badge">
                  <CheckCircle2 size={16} className="text-success" />
                  <span>Your shortened link is ready</span>
                </div>
                <button
                  type="button"
                  className="icon-action-btn"
                  onClick={() => setLatestUrl(null)}
                  title="Close"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="result-body">
                <div className="result-url-display">
                  <span className="result-url-text">
                    http://localhost:3000/r/{latestUrl.shortCode}
                  </span>
                </div>

                <div className="result-actions">
                  <button
                    type="button"
                    className="btn-primary btn-sm"
                    onClick={() => handleCopyLink(latestUrl)}
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
                    href={`http://localhost:3000/r/${latestUrl.shortCode}`}
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
          )}
        </section>

        {/* User Dashboard Section */}
        {user && (
          <section className="dashboard-section fade-in">
            {/* Quick Stats Summary */}
            <div className="stats-row">
              <div className="stat-card glass-panel">
                <div className="stat-icon-wrapper">
                  <Link2 size={18} />
                </div>
                <div className="stat-info">
                  <span className="stat-value">{urls.length}</span>
                  <span className="stat-label">Total Links</span>
                </div>
              </div>

              <div className="stat-card glass-panel">
                <div className="stat-icon-wrapper">
                  <MousePointerClick size={18} />
                </div>
                <div className="stat-info">
                  <span className="stat-value">{totalClicks}</span>
                  <span className="stat-label">Total Clicks</span>
                </div>
              </div>
            </div>

            {/* Links Management Header */}
            <div className="section-header">
              <div>
                <h2 className="section-title">Your Links</h2>
                <p className="section-subtitle">Manage and track your shortened URLs</p>
              </div>

              {urls.length > 0 && (
                <div className="search-box">
                  <Search size={15} className="search-icon" />
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search links..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="icon-action-btn"
                      onClick={() => setSearchQuery('')}
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {isLoadingUrls ? (
              <div className="loading-state glass-panel">
                <span className="spinner"></span>
                <span>Loading your links...</span>
              </div>
            ) : urls.length === 0 ? (
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
                          href={`http://localhost:3000/r/${item.shortCode}`}
                          target="_blank"
                          rel="noreferrer"
                          className="short-link-anchor"
                        >
                          http://localhost:3000/r/{item.shortCode}
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
                        onClick={() => handleCopyLink(item)}
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
                        onClick={() => handleDeleteUrl(item.id)}
                        title="Delete URL"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Feature Highlights Section */}
        <section className="features-grid">
          <div className="feature-card glass-panel">
            <div className="feature-icon-wrapper">
              <Zap size={18} />
            </div>
            <h3 className="feature-title">Fast Direct Forwarding</h3>
            <p className="feature-text">
              Direct redirection without waiting screens, countdowns, or intermediate ads.
            </p>
          </div>

          <div className="feature-card glass-panel">
            <div className="feature-icon-wrapper">
              <BarChart2 size={18} />
            </div>
            <h3 className="feature-title">Accurate Visit Counters</h3>
            <p className="feature-text">
              See how many times each shortened link has been opened with live click updates.
            </p>
          </div>

          <div className="feature-card glass-panel">
            <div className="feature-icon-wrapper">
              <ShieldCheck size={18} />
            </div>
            <h3 className="feature-title">Easy Link Management</h3>
            <p className="feature-text">
              All your created links are securely saved to your account so you can copy, inspect, or delete them anytime.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer-container">
        <div className="footer-content">
          <div className="footer-brand">
            <img src="/favicon.svg" alt="SnapLink logo" width="18" height="18" className="footer-logo-img" />
            <span>SnapLink</span>
          </div>
          <p className="footer-text">
            Simple, clean link shortening.
          </p>
        </div>
      </footer>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}

export default App;
