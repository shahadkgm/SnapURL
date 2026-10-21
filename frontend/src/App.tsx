import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { api, type User, type UrlItem } from './api';
import { API_BASE_URL } from './routes/apiRoutes';
import './App.css';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<'home' | 'login' | 'register'>('home');

  // URL State
  const [urls, setUrls] = useState<UrlItem[]>([]);
  const [latestUrl, setLatestUrl] = useState<UrlItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingUrls, setIsLoadingUrls] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Restore authenticated session on mount
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

  const handleAuthSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentPage('home');
    loadUserUrls();
  };

  const handleLogout = () => {
    api.removeToken();
    setUser(null);
    setUrls([]);
    setLatestUrl(null);
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
      setUrls((prev) => prev.filter((item) => item.id !== id));
      if (latestUrl?.id === id) {
        setLatestUrl(null);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete URL');
    }
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
              setUrls((prev) => [newUrl, ...prev]);
            }}
            onCloseLatestUrl={() => setLatestUrl(null)}
            onCopyUrl={handleCopyLink}
            onDeleteUrl={handleDeleteUrl}
            onSearchChange={setSearchQuery}
            onNavigate={setCurrentPage}
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
