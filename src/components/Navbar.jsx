import React from 'react';
import { Leaf, LogOut, Cpu } from 'lucide-react';

const LINKS = [
  { id: 'home',        label: 'Home'          },
  { id: 'simulator',   label: 'Simulator'     },
  { id: 'validation',  label: 'Validation'    },
  { id: 'methodology', label: 'Methodology'   },
  { id: 'qrcode',      label: '📱 QR Code'    },
];

export default function Navbar({ currentPage, setCurrentPage, user, onLogout }) {
  return (
    <nav className="navbar">
      {/* ── BRAND ── */}
      <div className="navbar-brand" onClick={() => setCurrentPage('home')}>
        <span style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
          <span style={{
            width: 30, height: 30,
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #00FFA3, #00D4FF)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(0,255,163,0.4)'
          }}>
            <Leaf size={16} color="#020B18" strokeWidth={2.5} />
          </span>
          <span style={{ color: '#F1F5F9' }}>
            SimArch<span style={{
              color: '#00FFA3',
              textShadow: '0 0 12px rgba(0,255,163,0.5)'
            }}>Sustainable</span>
          </span>
          <span style={{
            fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.12em',
            color: '#475569', textTransform: 'uppercase',
            background: 'rgba(0,255,163,0.08)', border: '1px solid rgba(0,255,163,0.15)',
            borderRadius: '4px', padding: '2px 6px'
          }}>v2.0</span>
        </span>
      </div>

      {/* ── NAV LINKS ── */}
      <div className="navbar-links">
        {LINKS.map(l => (
          <button
            key={l.id}
            className={`nav-link ${currentPage === l.id ? 'active' : ''}`}
            onClick={() => setCurrentPage(l.id)}
          >
            {l.label}
          </button>
        ))}

        {/* ── USER INFO ── */}
        {user && (
          <div style={{
            marginLeft: '1rem', paddingLeft: '1rem',
            borderLeft: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', gap: '0.85rem'
          }}>
            {/* Avatar + info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: user.role === 'architect'
                  ? 'linear-gradient(135deg, rgba(0,255,163,0.15), rgba(0,255,163,0.05))'
                  : 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,212,255,0.05))',
                border: `1.5px solid ${user.role === 'architect' ? 'rgba(0,255,163,0.4)' : 'rgba(0,212,255,0.4)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.85rem',
                boxShadow: user.role === 'architect'
                  ? '0 0 10px rgba(0,255,163,0.2)'
                  : '0 0 10px rgba(0,212,255,0.2)'
              }}>
                {user.role === 'architect' ? '👩‍💻' : '🏢'}
              </div>
              <div style={{ lineHeight: 1.3 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#CBD5E1' }}>
                  {user.email}
                </div>
                <div style={{
                  fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: user.role === 'architect' ? '#00FFA3' : '#00D4FF',
                  textShadow: user.role === 'architect'
                    ? '0 0 8px rgba(0,255,163,0.5)'
                    : '0 0 8px rgba(0,212,255,0.5)'
                }}>
                  {user.role === 'architect' ? '⚡ Architect' : '🏛️ Promoter'}
                </div>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={onLogout}
              style={{
                background: 'rgba(255,61,107,0.08)',
                border: '1px solid rgba(255,61,107,0.2)',
                cursor: 'pointer',
                color: 'rgba(255,61,107,0.7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0.35rem', borderRadius: '8px', transition: 'all 0.2s'
              }}
              onMouseOver={e => {
                e.currentTarget.style.color = '#FF3D6B';
                e.currentTarget.style.background = 'rgba(255,61,107,0.15)';
                e.currentTarget.style.boxShadow = '0 0 12px rgba(255,61,107,0.3)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.color = 'rgba(255,61,107,0.7)';
                e.currentTarget.style.background = 'rgba(255,61,107,0.08)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
