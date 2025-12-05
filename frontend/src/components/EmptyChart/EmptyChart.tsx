'use client';

import styles from './EmptyChart.module.css';

export default function EmptyChart() {
  return (
    <div className={styles.chartContainer}>
      <svg className={styles.chart} viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="gridGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#2a2d35', stopOpacity: 0.3 }} />
            <stop offset="100%" style={{ stopColor: '#2a2d35', stopOpacity: 0.1 }} />
          </linearGradient>
        </defs>
        
        <rect width="800" height="400" fill="var(--secondary-dark)" rx="12" />
        
        <g opacity="0.2" stroke="var(--border-primary)" strokeWidth="1">
          <line x1="60" y1="40" x2="60" y2="360" />
          <line x1="60" y1="360" x2="740" y2="360" />
          <line x1="60" y1="280" x2="740" y2="280" />
          <line x1="60" y1="200" x2="740" y2="200" />
          <line x1="60" y1="120" x2="740" y2="120" />
          <line x1="60" y1="40" x2="740" y2="40" />
        </g>
      </svg>
    </div>
  );
}

