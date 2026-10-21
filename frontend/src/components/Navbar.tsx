import React from 'react';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';
import type { User } from '../api';

interface NavbarProps {
  user: User | null;
  currentPage: 'home' | 'login' | 'register';
  onNavigate: (page: 'home' | 'login' | 'register') => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  currentPage,
  onNavigate,
  onLogout,
}) => {
  return (
    <header className="navbar-container">
      <div className="navbar-content">
        <div
          className="navbar-brand cursor-pointer"
          onClick={() => onNavigate('home')}
          role="button"
          tabIndex={0}
          title="SnapLink Home"
        >
          <img src="/favicon.svg" alt="SnapLink logo" className="brand-logo-img" width="28" height="28" />
          <span className="brand-title">SnapLink</span>
        </div>

        <nav className="navbar-actions">
          {user ? (
            <div className="user-profile-menu">
              <div className="user-avatar-chip">
                <UserIcon size={15} />
                <span className="user-name">{user.name || user.email.split('@')[0]}</span>
              </div>
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={onLogout}
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="guest-actions">
              <button
                type="button"
                className={`btn-secondary btn-sm ${currentPage === 'login' ? 'active' : ''}`}
                onClick={() => onNavigate('login')}
              >
                <LogIn size={15} />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                className={`btn-primary btn-sm ${currentPage === 'register' ? 'active' : ''}`}
                onClick={() => onNavigate('register')}
              >
                <span>Get Started</span>
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};
