import React from 'react';
import { Zap, BarChart2, ShieldCheck } from 'lucide-react';

export const FeaturesGrid: React.FC = () => {
  return (
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
  );
};
