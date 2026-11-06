import { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { api, type User, type UrlItem, type PaginationMeta } from './api';
import { API_BASE_URL } from './routes/apiRoutes';
import './App.css';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<'home' | 'login' | 'register'>('home');

  // URL State & Pagination
  const [urls, setUrls] = useState<UrlItem[]>([]);
  const [latestUrl, setLatestUrl] = useState<UrlItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingUrls, setIsLoadingUrls] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [pageSize] = useState(10);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const isInitialMount = useRef(true);

  // Restore authenticated session on mount
  useEffect(() => {
    const savedUser = api.getUser();
    if (savedUser && api.getToken()) {
      setUser(savedUser);
      loadUserUrls(1, '');
    }
  }, []);

  // Search debounce
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (!user) return;

    const timer = setTimeout(() => {
      loadUserUrls(1, searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadUserUrls = async (page = 1, search = searchQuery) => {
    setIsLoadingUrls(true);
    try {
      const res = await api.getMyUrls({ page, limit: pageSize, search });
      setUrls(res.data);
      setPaginationMeta(res.meta);
      setCurrentPageNum(res.meta.page);
    } catch {
      // Backend error fallback
    } finally {
      setIsLoadingUrls(false);
    }
  };

  const handleAuthSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentPage('home');
    loadUserUrls(1, '');
  };

  const handleLogout = () => {
    api.removeToken();
    setUser(null);
    setUrls([]);
    setLatestUrl(null);
    setSearchQuery('');
    setCurrentPage('home');
  };

  const handleCopyLink = (urlItem: UrlItem) => {
    const fullShortUrl = `${API_BASE_URL}/r/${urlItem.shortCode}`;
    navigator.clipboard.writeText(fullShortUrl);
    setCopiedId(urlItem.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteUrl = async (id: string) => {
    try {
      await api.deleteUrl(id);
      if (latestUrl?.id === id) {
        setLatestUrl(null);
      }
      const isLastOnPage = urls.length === 1 && currentPageNum > 1;
      const targetPage = isLastOnPage ? currentPageNum - 1 : currentPageNum;
      loadUserUrls(targetPage, searchQuery);
    } catch (err: any) {
      alert(err.message || 'Failed to delete URL');
    }
  };

  const handlePageChange = (newPage: number) => {
    loadUserUrls(newPage, searchQuery);
  };

  return (
    <div className="app-layout">
      <Navbar
        user={user}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
      />

      <main className="main-content">
        {currentPage === 'home' && (
          <HomePage
            user={user}
            urls={urls}
            latestUrl={latestUrl}
            copiedId={copiedId}
            searchQuery={searchQuery}
            isLoadingUrls={isLoadingUrls}
            onUrlCreated={(newUrl) => {
              setLatestUrl(newUrl);
              // Deduplicate immediately in state
              setUrls((prev) => [newUrl, ...prev.filter((u) => u.id !== newUrl.id)]);
              // Reload page 1 to ensure accurate server pagination counts
              loadUserUrls(1, searchQuery);
            }}
            onCloseLatestUrl={() => setLatestUrl(null)}
            onCopyUrl={handleCopyLink}
            onDeleteUrl={handleDeleteUrl}
            onSearchChange={setSearchQuery}
            onNavigate={setCurrentPage}
            currentPage={paginationMeta.page || currentPageNum}
            totalPages={paginationMeta.totalPages}
            totalCount={paginationMeta.total}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        )}

        {currentPage === 'login' && (
          <LoginPage
            onSuccess={handleAuthSuccess}
            onNavigate={setCurrentPage}
          />
        )}

        {currentPage === 'register' && (
          <RegisterPage
            onSuccess={handleAuthSuccess}
            onNavigate={setCurrentPage}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
