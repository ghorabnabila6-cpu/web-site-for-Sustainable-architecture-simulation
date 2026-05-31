import React from 'react';
import { Zap, Sun, Lightbulb } from 'lucide-react';

const DARK = {
  bg: '#020B18',
  card: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.08)',
  text: '#94A3B8',
  title: '#F1F5F9',
  neonGreen: '#00FFA3',
  neonBlue: '#00D4FF',
  neonAmber: '#FFB800',
};

const Section = ({ number, icon, title, children, accentColor = DARK.neonGreen }) => (
  <div style={{
    background: DARK.card,
    border: `1px solid ${DARK.border}`,
    borderRadius: '1rem',
    padding: '2rem',
    marginBottom: '1.5rem',
    backdropFilter: 'blur(12px)',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s',
  }}
    onMouseOver={e => e.currentTarget.style.borderColor = `${accentColor}33`}
    onMouseOut={e => e.currentTarget.style.borderColor = DARK.border}
  >
    {/* Top accent line */}
    <div style={{
      position:'absolute', top:0, left:0, right:0, height:2,
      background:`linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
      opacity:0.6,
    }}/>

    <h2 style={{
      fontSize:'1.2rem', fontWeight:800, marginBottom:'1.25rem',
      display:'flex', alignItems:'center', gap:'0.75rem', color: DARK.title,
    }}>
      <span style={{
        width:36, height:36, borderRadius:'10px',
        background: `rgba(${accentColor==='#00FFA3'?'0,255,163':accentColor==='#00D4FF'?'0,212,255':'255,184,0'}, 0.12)`,
        border: `1px solid ${accentColor}33`,
        display:'flex', alignItems:'center', justifyContent:'center',
        color: accentColor, flexShrink:0, fontSize:'1rem',
      }}>
        {icon}
      </span>
      <span style={{ color: '#CBD5E1' }}>{number}.</span> {title}
    </h2>
    {children}
  </div>
);

const Formula = ({ children }) => (
  <div style={{
    background: 'rgba(0,255,163,0.04)',
    border: '1px solid rgba(0,255,163,0.15)',
    borderLeft: '3px solid #00FFA3',
    borderRadius: '0 0.5rem 0.5rem 0',
    padding: '1.25rem 1.5rem',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.95rem',
    color: '#00FFA3',
    textShadow: '0 0 12px rgba(0,255,163,0.3)',
    lineHeight: 2,
    marginBottom: '1rem',
  }}>
    {children}
  </div>
);

export default function Methodology() {
  return (
    <div style={{
      minHeight: 'calc(100dvh - 62px)',
      overflowY: 'auto',
      background: `
        repeating-linear-gradient(0deg,  transparent, transparent 39px, rgba(0,255,163,0.025) 39px, rgba(0,255,163,0.025) 40px),
        repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(0,255,163,0.025) 39px, rgba(0,255,163,0.025) 40px),
        #020B18
      `,
      padding: '3rem 2rem 5rem',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{
            display:'inline-flex', alignItems:'center', gap:'0.5rem',
            background:'rgba(0,255,163,0.08)', border:'1px solid rgba(0,255,163,0.2)',
            borderRadius:'50px', padding:'0.3rem 0.9rem',
            fontSize:'0.72rem', fontWeight:700, color:'#00FFA3',
            textTransform:'uppercase', letterSpacing:'0.08em',
            marginBottom:'1.25rem',
          }}>
            📐 Bioclimatic Engineering
          </div>
          <h1 style={{
            fontSize:'2.5rem', fontWeight:900, letterSpacing:'-0.03em', lineHeight:1.1,
            marginBottom:'1rem',
            background:'linear-gradient(135deg, #fff 0%, #00FFA3 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
          }}>
            Scientific Methodology
          </h1>
          <p style={{ fontSize:'1.05rem', color: DARK.text, lineHeight:1.75, maxWidth:680 }}>
            SimArch Sustainable relies on real physical formulas and algorithms of bioclimatic thermal engineering,
            in accordance with the <strong style={{color:'#CBD5E1'}}>Algerian DTR C3-2</strong>.
          </p>
        </div>

        {/* Section 1 */}
        <Section number="1" icon={<Zap size={18}/>} title="Thermal Resistance & U-Value" accentColor="#00FFA3">
          <p style={{ color: DARK.text, marginBottom:'1.25rem', lineHeight:1.75 }}>
            The heat transfer of a composite wall is calculated by combining the resistance of each
            material layer based on its thickness and thermal conductivity <strong style={{color:'#CBD5E1'}}>λ (lambda)</strong>.
          </p>
          <Formula>
            R<sub>total</sub> = R<sub>si</sub> + Σ (Thickness / λ) + R<sub>se</sub><br/>
            <br/>
            U-Value = 1 / R<sub>total</sub> &nbsp;[W/m²·K]
          </Formula>
          <p style={{ fontSize:'0.82rem', color:'#475569', fontStyle:'italic' }}>
            Where: R<sub>si</sub> = 0.13 m²K/W (internal resistance) | R<sub>se</sub> = 0.04 m²K/W (external resistance) — ISO 6946
          </p>
        </Section>

        {/* Section 2 */}
        <Section number="2" icon={<Sun size={18}/>} title="Thermal Balance of Openings (WWR)" accentColor="#FFB800">
          <p style={{ color: DARK.text, marginBottom:'1.25rem', lineHeight:1.75 }}>
            The Window-to-Wall Ratio defines the amount of external energy
            directly impacting thermal comfort depending on orientation and season.
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
            <div style={{
              background:'rgba(0,212,255,0.06)', border:'1px solid rgba(0,212,255,0.2)',
              borderRadius:'0.75rem', padding:'1.25rem',
            }}>
              <h3 style={{ fontWeight:700, color:'#00D4FF', marginBottom:'0.5rem', fontSize:'0.9rem' }}>❄️ Winter Losses</h3>
              <p style={{ fontSize:'0.82rem', color: DARK.text, lineHeight:1.6 }}>
                Q<sub>winter</sub> = A<sub>w</sub> × U<sub>window</sub> × ΔT<br/>
                Depends on the window's U-coefficient and the external temperature delta.
              </p>
            </div>
            <div style={{
              background:'rgba(255,184,0,0.06)', border:'1px solid rgba(255,184,0,0.2)',
              borderRadius:'0.75rem', padding:'1.25rem',
            }}>
              <h3 style={{ fontWeight:700, color:'#FFB800', marginBottom:'0.5rem', fontSize:'0.9rem' }}>☀️ Summer Gains</h3>
              <p style={{ fontSize:'0.82rem', color: DARK.text, lineHeight:1.6 }}>
                Q<sub>summer</sub> = A<sub>w</sub> × I × Sf × TL<br/>
                Results from solar irradiance, orientation, and shading factor.
              </p>
            </div>
          </div>
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.85rem', color:'#FFB800', background:'rgba(255,184,0,0.05)', border:'1px solid rgba(255,184,0,0.15)', borderRadius:'0.5rem', padding:'0.85rem 1.25rem' }}>
            Irradiance by orientation: South 75% | East 85% | West 100% | North 25%
          </div>
        </Section>

        {/* Section 3 */}
        <Section number="3" icon={<Lightbulb size={18}/>} title="Daylight Factor (DF)" accentColor="#00D4FF">
          <p style={{ color: DARK.text, marginBottom:'1.25rem', lineHeight:1.75 }}>
            The DF represents the proportion of natural outdoor light reaching
            the room's work surface — simplified <strong style={{color:'#CBD5E1'}}>BRE / CIBSE</strong> method.
          </p>
          <Formula>
            DF (%) = (A<sub>w</sub> × TL × Sky Factor × 100) / A<sub>r</sub>
          </Formula>
          <div style={{
            background:'rgba(0,212,255,0.06)', border:'1px solid rgba(0,212,255,0.2)',
            borderRadius:'0.6rem', padding:'1rem 1.25rem',
            fontSize:'0.88rem', color:'#00D4FF', display:'flex', alignItems:'center', gap:'0.75rem',
          }}>
            <span style={{ fontSize:'1.4rem' }}>💡</span>
            <span><strong>Ideal DF &gt; 2%</strong> to avoid artificial daytime lighting — reducing energy consumption.</span>
          </div>
        </Section>

      </div>
    </div>
  );
}
