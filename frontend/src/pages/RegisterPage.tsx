import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { api, type User } from '../api';

interface RegisterPageProps {
  onSuccess: (user: User) => void;
  onNavigate: (page: 'home' | 'login' | 'register') => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSuccess, onNavigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const res = await api.register({ email, password, name });
      setSuccessMsg('Account created successfully! Signing in...');
      setTimeout(() => {
        onSuccess(res.user);
        onNavigate('home');
      }, 600);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your information.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper fade-in">
      <div className="auth-page-card glass-panel">
        <button
          type="button"
          className="auth-page-back-link"
          onClick={() => onNavigate('home')}
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </button>

        <div className="modal-header">
          <h2 className="modal-title">Create your account</h2>
          <p className="modal-subtitle">
            Sign up to create, save, and track your shortened links
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
          <div className="input-group">
            <label className="input-label" htmlFor="register-name">
              Full Name
            </label>
            <div className="input-field-wrapper">
              <UserIcon size={18} className="input-field-icon" />
              <input
                id="register-name"
                type="text"
                className="input-field"
                placeholder="e.g. Alex Johnson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="register-email">
              Email Address
            </label>
            <div className="input-field-wrapper">
              <Mail size={18} className="input-field-icon" />
              <input
                id="register-email"
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
            <label className="input-label" htmlFor="register-password">
              Password
            </label>
            <div className="input-field-wrapper">
              <Lock size={18} className="input-field-icon" />
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                placeholder="Min 6 characters"
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
                <span>Create Account</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-switch-footer">
          <span>Already have an account? </span>
          <button
            type="button"
            className="auth-switch-link"
            onClick={() => onNavigate('login')}
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};
