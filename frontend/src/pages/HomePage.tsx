import React from 'react';
import { Link2 } from 'lucide-react';
import { ShortenCard } from '../components/ShortenCard';
import { ResultBanner } from '../components/ResultBanner';
import { Dashboard } from '../components/Dashboard';
import { FeaturesGrid } from '../components/FeaturesGrid';
import type { User, UrlItem } from '../api';

interface HomePageProps {
  user: User | null;
  urls: UrlItem[];
  latestUrl: UrlItem | null;
  copiedId: string | null;
  searchQuery: string;
  isLoadingUrls: boolean;
  onUrlCreated: (newUrl: UrlItem) => void;
  onCloseLatestUrl: () => void;
  onCopyUrl: (urlItem: UrlItem) => void;
  onDeleteUrl: (id: string) => void;
  onSearchChange: (query: string) => void;
  onNavigate: (page: 'home' | 'login' | 'register') => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  user,
  urls,
  latestUrl,
  copiedId,
  searchQuery,
  isLoadingUrls,
  onUrlCreated,
  onCloseLatestUrl,
  onCopyUrl,
  onDeleteUrl,
  onSearchChange,
  onNavigate,
}) => {
  return (
    <>
      {/* Hero Section */}
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

        {/* Shorten Input Card */}
        <ShortenCard
          user={user}
          onUrlCreated={onUrlCreated}
          onNavigateAuth={onNavigate}
        />

        {/* Instant Result Card */}
        {latestUrl && (
          <ResultBanner
            latestUrl={latestUrl}
            copiedId={copiedId}
            onCopy={onCopyUrl}
            onClose={onCloseLatestUrl}
          />
        )}
      </section>

      {/* User Dashboard Section */}
      {user && (
        <Dashboard
          urls={urls}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          isLoading={isLoadingUrls}
          copiedId={copiedId}
          onCopy={onCopyUrl}
          onDelete={onDeleteUrl}
        />
      )}

      {/* Feature Highlights Grid */}
      <FeaturesGrid />
    </>
  );
};
