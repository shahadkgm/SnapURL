import React from 'react';

export const Footer: React.FC = () => {
  return (
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
  );
};
