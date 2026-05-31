import React from 'react';    //pour utiliser jsx
import { ArrowRight, FolderOpen, Zap, Shield, BarChart3, MapPin } from 'lucide-react';
//1- fleche new simulation  2-icone dossier my saved projects  
 

   //tableaux features
const FEATURES = [
  {
    icon: <MapPin size={28} />,// icone de localisation bioclimatic context
    color: '#00FFA3',
    glow: 'rgba(0,255,163,0.3)',
    title: 'Bioclimatic Context',
    desc: 'Automatic retrieval of Algerian climate data (DTR C3-2) via interactive mapping. Zones A, B, C, D automatically detected.'
  },
  {
    icon: <Zap size={28} />, //icone eclair pour la feature 
    color: '#00D4FF',
    glow: 'rgba(0,212,255,0.3)',
    title: '2D Thermal Analysis',
    desc: 'Build your wall layer by layer. Instantly calculate U-Value, R-Resistance and visualize the thermal gradient in real-time.'
  },
  {
    icon: <Shield size={28} />, // icone bouclier pour DTR
    color: '#FFB800',
    glow: 'rgba(255,184,0,0.3)',
    title: 'DTR C3-2 Compliance',
    desc: 'Automatic validation against Algerian regulatory requirements. Intelligent Assistant with personalized bioclimatic recommendations.'
  },
  {
    icon: <BarChart3 size={28} />, //icone graphique
    color: '#BD93F9',
    glow: 'rgba(189,147,249,0.3)',
    title: 'Secure B2B Sharing',
    desc: 'Transmit your analyses to your Real Estate Promoter or Client. Each project is locked by recipient email.'
  },
];
 

// declaration du composant
export default function Home({ setCurrentPage, onOpenProjects, user }) {
  return (
    <div style={{
      minHeight: 'calc(100dvh - 62px)',
      background: `
        radial-gradient(ellipse at 50% -10%, rgba(0,255,163,0.10) 0%, transparent 55%),
        radial-gradient(ellipse at 90% 90%, rgba(0,212,255,0.06) 0%, transparent 50%),
        #020B18
      `,
      padding: '0 2rem 4rem',
      overflow: 'auto', //active du scroll si le contenu dépasse la hauteur
    }}>

      {/* ═══════════ HERO ═══════════ */}
      <div style={{ textAlign: 'center', paddingTop: '5rem', paddingBottom: '2rem', maxWidth: 820, margin: '0 auto' }}>

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(0,255,163,0.08)',
          border: '1px solid rgba(0,255,163,0.2)',
          borderRadius: '50px', padding: '0.35rem 1rem',
          fontSize: '0.78rem', fontWeight: 700, color: '#00FFA3',
          marginBottom: '2rem', letterSpacing: '0.06em',
          textTransform: 'uppercase',
          boxShadow: '0 0 20px rgba(0,255,163,0.1)',
          animation: 'fadeIn 0.5s ease-out'
        }}>
          <span style={{ width:7, height:7, borderRadius:'50%', background:'#00FFA3', boxShadow:'0 0 8px #00FFA3', display:'inline-block' }}/>
          Thermal Engineering Platform — Algeria DTR C3-2
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
          fontWeight: 900,
          letterSpacing: '-0.035em',
          lineHeight: 1.08,
          marginBottom: '1.5rem',
          background: 'linear-gradient(135deg, #ffffff 0%, #00FFA3 55%, #00D4FF 100%)',
          WebkitBackgroundClip: 'text',//découpe l'arriere-plan en dégradé pour qu'il prenne la forme des lettres
          WebkitTextFillColor: 'transparent',// rend la couleur d'origine du texte totalement transparente
          backgroundClip: 'text',
          animation: 'fadeIn 0.6s ease-out 0.1s both'
        }}>
          Design the Future of<br/>Sustainable Architecture
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: '1.1rem', color: '#94A3B8', lineHeight: 1.75,
          maxWidth: 660, margin: '0 auto 3rem',
          animation: 'fadeIn 0.6s ease-out 0.2s both'
        }}>
          An advanced digital engineering tool for architects and promoters.
          Simulate, analyze, and optimize the thermal envelope of your projects from the sketch phase.
        </p>

        {/* CTA Buttons */}
        <div style={{
          display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap',
          animation: 'fadeIn 0.6s ease-out 0.3s both'
        }}>
          {user?.role === 'architect' && (
            <button
              className="btn btn-primary"
              style={{ padding: '0.85rem 2rem', fontSize: '1rem', borderRadius: '50px', gap: '0.6rem' }}
              onClick={() => setCurrentPage('simulator')}
            >
              New Simulation <ArrowRight size={18} />
            </button>
          )}
          <button
            className="btn btn-outline"
            style={{
              padding: '0.85rem 2rem', fontSize: '1rem', borderRadius: '50px',
              gap: '0.6rem', border: '1px solid rgba(255,255,255,0.12)',
              color: '#CBD5E1'
            }}
            onClick={onOpenProjects}
          >
            <FolderOpen size={18} />
            {user?.role === 'architect' ? 'My Saved Projects' : 'View Received Projects'}
          </button>
        </div>
      </div>

      {/* ═══════════ STATS BAR ═══════════ */}
      <div style={{
        maxWidth: 820, margin: '0 auto 4rem',
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1px',
        background: 'rgba(255,255,255,0.06)',
        borderRadius: '1rem', overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.07)',
        animation: 'fadeIn 0.6s ease-out 0.4s both'
      }}>
        {[
          { val: '4', unit: 'Zones', label: 'Bioclimatic DZ' },
          { val: '12', unit: 'Materials', label: 'Local Certified' },
          { val: '100%', unit: 'Compliant', label: 'DTR C3-2' },
          { val: 'B2B', unit: 'Secure', label: 'Targeted Sharing' },
        ].map((s, i) => (
          <div key={i} style={{
            padding: '1.25rem',
            textAlign: 'center',
            background: 'rgba(15, 23, 42, 0.8)',
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#00FFA3', fontFamily: "'JetBrains Mono', monospace" }}>{s.val}</div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.2rem' }}>{s.unit}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.15rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ═══════════ FEATURE CARDS ═══════════ */}
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{
          textAlign: 'center', fontSize: '1.5rem', fontWeight: 800,
          marginBottom: '2.5rem', color: '#F1F5F9',
          animation: 'fadeIn 0.6s ease-out 0.5s both'
        }}>
          Why choose <span style={{ color: '#00FFA3' }}>SimArch</span>?
        </h2>

        <div className="features-grid" style={{ animation: 'fadeIn 0.6s ease-out 0.6s both' }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card">
              {/* Icon */}
              <div style={{
                width: 52, height: 52, borderRadius: '14px',
                background: `rgba(${f.color === '#00FFA3' ? '0,255,163' : f.color === '#00D4FF' ? '0,212,255' : f.color === '#FFB800' ? '255,184,0' : '189,147,249'}, 0.1)`,
                border: `1px solid ${f.glow}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1.25rem',
                color: f.color,
                boxShadow: `0 0 20px ${f.glow}`,
              }}>
                {f.icon}
              </div>
              <h3 className="feature-card h3" style={{ color: '#F1F5F9', marginBottom: '0.6rem' }}>{f.title}</h3>
              <p className="feature-card p">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
