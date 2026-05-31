import React, { useState } from 'react';//le hook use.. pour gérer l'état local du composant
import { Leaf, ArrowRight } from 'lucide-react';//deux icones leaf pour le logo et arrowright pour la flèche du login



// déclaration du composant
export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');//set permet de faire un mise à jour et changer la aleur de l'email
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');//on stock le message d'erreur à afficher si la connexion échoue
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {//async déclenche lors de la soumission du formulaire
    e.preventDefault();//empeche le rechargement de la page
    setLoading(true); setError('');//active le mode loading et efface l'erreur précédente


    try {//envoie une requete http post vers le backend php 
      const res = await fetch('/simarch-backend/login.php', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ email, password }) //convertis mail et pass vers un text json 
      });
      const data = await res.json();// attend et parse la réponse json du serveur

      if (data.success) onLogin(data.user);// si l'opération success:true on appele onlogin pour connecter l'utilisateur
      else setError(data.message || 'Invalid credentials.');//sinon en affiche le message invalid credentials
    } catch {//on l'utilise si la connextion avec le serveur échoue
      if (email === 'archi@simarch.dz')         onLogin({ id:1, email:'archi@simarch.dz',     role:'architect' });
      else if (email === 'promoteur@email.com')  onLogin({ id:2, email:'promoteur@email.com', role:'promoteur' });
      else setError('Server error or XAMPP not detected. Use the demos below.');
    }
    setLoading(false);//désactive le mode loading dans le cas (succès ou erreur)
  };

  return (
    <div style={{ //background
      display:'flex', justifyContent:'center', alignItems:'center',
      minHeight:'100dvh', padding:'1rem',
      background:`
        radial-gradient(ellipse at 50% 0%,   rgba(0,255,163,0.10) 0%, transparent 55%),
        radial-gradient(ellipse at 100% 100%, rgba(0,212,255,0.06) 0%, transparent 50%),
        #020B18
      `
    }}>

      {/* Card */}
      <div style={{
        width:'100%', maxWidth:420,
        background:'rgba(15,23,42,0.9)',
        border:'1px solid rgba(255,255,255,0.08)',
        borderRadius:'1.5rem',
        overflow:'hidden',
        boxShadow:'0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,255,163,0.05)',
        backdropFilter:'blur(20px)',
      }}>

        {/* Header */}
        <div style={{//logo+le title nd subtitle
          padding:'2.5rem 2rem 2rem',
          textAlign:'center',
          background:'linear-gradient(180deg, rgba(0,255,163,0.08) 0%, transparent 100%)',
          borderBottom:'1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{
            width:60, height:60, borderRadius:'16px', margin:'0 auto 1.25rem',
            background:'linear-gradient(135deg,#00FFA3,#00C87A)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 0 30px rgba(0,255,163,0.4)',
          }}>
            <Leaf size={28} color="#020B18" strokeWidth={2.5}/> 
          </div>
          <h2 style={{
            fontSize:'1.6rem', fontWeight:900, margin:0,
            background:'linear-gradient(135deg,#fff 0%,#00FFA3 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            letterSpacing:'-0.02em',
          }}>SimArch Sustainable</h2>
          <p style={{ color:'#475569', fontSize:'0.85rem', marginTop:'0.4rem' }}>
            Parametric Ecological Platform
          </p>
        </div>

        {/* Form */}
        <div style={{ padding:'2rem' }}>
          <h3 style={{ fontSize:'1.1rem', fontWeight:700, color:'#F1F5F9', marginBottom:'1.5rem', textAlign:'center' }}>
            🔐 Login
          </h3>

          {error && (//invisible si y a pas d'erreur
            <div style={{
              background:'rgba(255,61,107,0.1)', color:'#FF3D6B',
              border:'1px solid rgba(255,61,107,0.25)',
              padding:'0.75rem', borderRadius:'0.5rem',
              fontSize:'0.82rem', marginBottom:'1rem', textAlign:'center',
            }}>{error}</div>
          )}
           
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div>
              <label style={{ display:'block', fontSize:'0.7rem', fontWeight:700, color:'#475569', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.07em' }}>Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                className="form-input" placeholder="archi@simarch.dz" required/>
            </div>
            <div>
              <label style={{ display:'block', fontSize:'0.7rem', fontWeight:700, color:'#475569', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.07em' }}>Password</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
                className="form-input" placeholder="••••••••" required/>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary"//soumet le formulaire et désactive loading pendant le requete
              style={{ width:'100%', height:46, marginTop:8, fontSize:'0.95rem', borderRadius:'0.6rem' }}>
              {loading ? 'Logging in...' : 'Login'} <ArrowRight size={16}/>
              
            </button>
          </form>

          {/* Demo */}
          <div style={{ marginTop:'2rem', paddingTop:'1.5rem', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontSize:'0.65rem', fontWeight:800, color:'#334155', textTransform:'uppercase', letterSpacing:'0.1em', textAlign:'center', marginBottom:12 }}>
              Demo Mode
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              <button
                onClick={()=>{ setEmail('archi@simarch.dz'); setPassword('admin123'); }}
                style={{
                  padding:'0.7rem', borderRadius:'0.5rem', cursor:'pointer', fontSize:'0.82rem', fontWeight:700,
                  background:'rgba(0,255,163,0.08)', border:'1px solid rgba(0,255,163,0.25)', color:'#00FFA3',
                  transition:'all 0.2s',
                }}
                onMouseOver={e=>e.currentTarget.style.background='rgba(0,255,163,0.15)'}
                onMouseOut={e=>e.currentTarget.style.background='rgba(0,255,163,0.08)'}
              >⚡ Architect</button>
              <button
                onClick={()=>{ setEmail('promoteur@email.com'); setPassword('promo123'); }}
                style={{
                  padding:'0.7rem', borderRadius:'0.5rem', cursor:'pointer', fontSize:'0.82rem', fontWeight:700,
                  background:'rgba(0,212,255,0.08)', border:'1px solid rgba(0,212,255,0.25)', color:'#00D4FF',
                  transition:'all 0.2s',
                }}
                onMouseOver={e=>e.currentTarget.style.background='rgba(0,212,255,0.15)'}
                onMouseOut={e=>e.currentTarget.style.background='rgba(0,212,255,0.08)'}
              >🏛️ Promoter</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
