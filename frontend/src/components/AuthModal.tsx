import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api, type User } from '../api';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'register';
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode,
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (mode === 'register') {
        const res = await api.register({ email, password, name });
        setSuccessMsg('Account created successfully! Signing in...');
        setTimeout(() => {
          onSuccess(res.user);
          onClose();
        }, 600);
      } else {
        const res = await api.login({ email, password });
        setSuccessMsg('Welcome back! Loading your dashboard...');
        setTimeout(() => {
          onSuccess(res.user);
          onClose();
        }, 500);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card glass-panel fade-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <div className="modal-header">
          <div className="tab-switcher">
            <button
              type="button"
              className={`tab-btn ${mode === 'login' ? 'active' : ''}`}
              onClick={() => {
                setMode('login');
                setError(null);
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`tab-btn ${mode === 'register' ? 'active' : ''}`}
              onClick={() => {
                setMode('register');
                setError(null);
              }}
            >
              Create Account
            </button>
          </div>
          <h2 className="modal-title">
            {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </h2>
          <p className="modal-subtitle">
            {mode === 'login'
              ? 'Enter your email and password to access your links'
              : 'Sign up to create, save, and track your shortened links'}
          </p>
        </div>

        {error && (
          <div className="auth-alert alert-error">
            <AlertCircle size={18} className="alert-icon" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="auth-alert alert-success">
            <CheckCircle2 size={18} className="alert-icon" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <div className="input-group">
              <label className="input-label" htmlFor="auth-name">
                Full Name
              </label>
              <div className="input-field-wrapper">
                <UserIcon size={18} className="input-field-icon" />
                <input
                  id="auth-name"
                  type="text"
                  className="input-field"
                  placeholder="e.g. Alex Johnson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="input-group">
            <label className="input-label" htmlFor="auth-email">
              Email Address
            </label>
            <div className="input-field-wrapper">
              <Mail size={18} className="input-field-icon" />
              <input
                id="auth-email"
                type="email"
                className="input-field"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="auth-password">
              Password
            </label>
            <div className="input-field-wrapper">
              <Lock size={18} className="input-field-icon" />
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                placeholder={mode === 'register' ? 'Min 6 characters' : 'Enter your password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary auth-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="spinner"></span>
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
