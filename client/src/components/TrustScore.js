import React, { useState, useEffect } from 'react';
import api from '../utils/api';

export default function TrustScore({ userId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/matching/trust/${userId}`)
      .then(r => setData(r.data))
      .catch(() => {});
  }, [userId]);

  if (!data) return null;

  const { trustScore, trustLevel, trustColor, stats } = data;
  const circ = 2 * Math.PI * 22;
  const fill = (trustScore / 100) * circ;

  return (
    <div style={{
      padding: '14px 16px', borderRadius: '12px',
      background: `${trustColor}10`, border: `1px solid ${trustColor}30`
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Ring */}
        <svg width="56" height="56" style={{ flexShrink: 0 }}>
          <circle cx="28" cy="28" r="22" fill="none" stroke="#2a2a3d" strokeWidth="4"/>
          <circle cx="28" cy="28" r="22" fill="none" stroke={trustColor} strokeWidth="4"
            strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
            transform="rotate(-90 28 28)"/>
          <text x="28" y="32" textAnchor="middle" fill={trustColor} fontSize="11" fontWeight="800">{trustScore}</text>
        </svg>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span style={{ color: trustColor, fontWeight: 700, fontSize: '0.9rem' }}>{trustLevel}</span>
            <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>Trust Score</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>✅ {stats.completedExchanges} completed</span>
            <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>📊 {stats.completionRate}% completion</span>
            <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>⭐ {stats.avgRating.toFixed(1)} rating</span>
          </div>
        </div>
      </div>
    </div>
  );
}
