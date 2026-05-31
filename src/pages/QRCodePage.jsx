import React, { useState } from 'react';
import { Download, Smartphone } from 'lucide-react';

//url:à encoder dans le QR code
//size: la taille en pixels
//color:du premier plan en hexadécim
function QRImage({ url, size, color }) {
  const fg  = color.replace('#', '');//supprimele dièz
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&color=${fg}&bgcolor=0F172A&qzone=2&format=png`;
  //construction de l'url de l'api externe
  return <img src={src} alt="QR Code" width={size} height={size} style={{ display:'block', borderRadius:'0.5rem' }}/>;//affichage de l'image du QR généré et supprime l'espace vide
}

const DEPLOY_URL = 'https://valley-maximize-salami.ngrok-free.dev/simarch/';//url par défaut de l'app via ngrok

export default function QRCodePage() {
  const [url, setUrl]     = useState(DEPLOY_URL);//état de l'URL encodée dans le QR code Initialisé avec DEPLOY modifiable via le champ de saisie
  const [size, setSize]   = useState(256);//etat de la taille sa valeur initial 256px et modifiable via le slider
  const [color, setColor] = useState('#00FFA3');//etat de couleur modifiable via les boutons de couleur

  const downloadQR = () => {
    const fg  = color.replace('#', '');//supprime le dièz pour l'url de l'api
    const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&color=${fg}&bgcolor=0F172A&qzone=2&format=png`;
    //reconstruit l'url de l'api avec taille , couleur , url
    const a   = document.createElement('a');//créer l'elem a (lien html)en mémoir sans l'insérer dans le dom
    a.href = src;//définit la déstination du lieb 
     a.download = 'simarch-qrcode.png';//indique de télécharger le fichier plutot que de naviguer vers lui 
      a.target = '_blank'; //ouvre dans un nouvel onglet
      a.click();//un clic sur le lien pour déclencher le téléchargement
  };

  const COLORS = ['#00FFA3','#00D4FF','#BD93F9','#FFB800','#FF3D6B','#F1F5F9'];

  return (
    <div style={{
      minHeight: 'calc(100dvh - 62px)',
      overflowY: 'auto',
      background: `
        radial-gradient(ellipse at 50% 50%, rgba(0,255,163,0.07) 0%, transparent 60%),
        #020B18
      `,
      padding: '3rem 2rem 5rem',//espacement intèrieur pour éviter que le contenu touche le bord  sous les petits écrans
    }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>


        {/* Header */}
        <div style={{ marginBottom:'3rem' }}>
          <div style={{//badge
            display:'inline-flex', gap:'0.5rem', alignItems:'center',
            background:'rgba(0,255,163,0.08)', border:'1px solid rgba(0,255,163,0.2)',
            borderRadius:'50px', padding:'0.3rem 0.9rem', marginBottom:'1.25rem',
            fontSize:'0.72rem', fontWeight:700, color:'#00FFA3',
            textTransform:'uppercase', letterSpacing:'0.08em',
          }}>
            <Smartphone size={13}/> Interactive Digital Portal
          </div>


          <h1 style={{
            fontSize:'2.5rem', fontWeight:900, letterSpacing:'-0.03em', lineHeight:1.1, marginBottom:'1rem',
            background:'linear-gradient(135deg, #fff 0%, #00FFA3 100%)',
            WebkitBackgroundClip:'text'//le fond ne s'affiche qu'à l'interieur des lettres
            , WebkitTextFillColor:'transparent'//rend le remplissage du texye transparent pour voir le fond
            , backgroundClip:'text',//version standard pour compatibilité résultat
          }}>
            QR Code — Quick Access
          </h1>
          
          <p style={{ fontSize:'1.05rem', color:'#94A3B8', lineHeight:1.75, maxWidth:680 }}>
            Intégrez ce portail lumineux dans votre mémoire papier. Le jury accède instantanément à la simulation live depuis son smartphone — une <strong style={{color:'#CBD5E1'}}>passerelle digitale flottante</strong>.
          </p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'2rem', alignItems:'start' }}>



          {/* QR affichage— Luminescent Portal */}
          <div style={{
            background:'rgba(255,255,255,0.04)',
            border:'1px solid rgba(0,255,163,0.2)',
            borderRadius:'1.25rem', padding:'2rem', textAlign:'center',
            backdropFilter:'blur(12px)',
            boxShadow:'0 0 40px rgba(0,255,163,0.08), inset 0 0 60px rgba(0,0,0,0.3)',
          }}>
            {/* Halo effect pour positioner le halo en absolu  */}
            <div style={{ position:'relative', display:'inline-block', marginBottom:'1.5rem' }}>
              <div style={{//élément décoratif  uniquement
                position:'absolute', inset:-12, borderRadius:'1rem',
                background:'transparent',//invisible
                boxShadow:`0 0 30px ${color}66, 0 0 60px ${color}22`,
                pointerEvents:'none',//ne capte pas les clics
                animation:'glow-pulse 3s ease-in-out infinite',
              }}/>

              <div style={{//cadre du code QR
                padding:'1rem', background:'rgba(15,23,42,0.9)',
                borderRadius:'0.75rem',
                border:`1px solid ${color}40`,
                display:'inline-block',
              }}>
                <QRImage url={url} size={size} color={color}/>
              </div>
            </div>

            <div style={{//l'affichage du url sous QR
              fontSize:'0.68rem', color:'#475569', marginBottom:'1.5rem',
              wordBreak:'break-all', padding:'0 0.5rem',
              fontFamily:"'JetBrains Mono',monospace",
            }}>{url}</div>

            <button className="btn btn-primary" onClick={downloadQR}
              style={{ width:'100%', justifyContent:'center', borderRadius:'0.6rem' }}>
              <Download size={15}/> Download QR Code (PNG)
            </button>
          </div>



          {/* Controls du colonne droite  */}
          <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

            {/* carte des Parameters */}
            <div style={{
              background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
              borderRadius:'1rem', padding:'1.5rem', backdropFilter:'blur(12px)',
            }}>

              <h3 style={{ fontWeight:700, marginBottom:'1.25rem', fontSize:'0.95rem', color:'#F1F5F9', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                ⚙️ Paramètres du QR Code
              </h3>
              <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>

                 
                <div>
                  <label className="form-label">URL de l'application (Ngrok)</label>
                  <input type="url" className="form-input" //vérifie que c une url valide
                  value={url}//champ controlé
                    onChange={e=>setUrl(e.target.value)}//maj a chaque frappe , qui redéclenche le rendu et maj QR 
                     placeholder="https://xxxx.ngrok-free.app/simarch/"/>
                </div>

                
                <div>
                  <label className="form-label">Taille: <span style={{ color:'#00FFA3', fontFamily:"'JetBrains Mono',monospace" }}>{size}px</span></label>
                  <input type="range" min="128" max="400" step="8" value={size} onChange={e=>setSize(+e.target.value)} style={{ width:'100%' }}/>
                </div>


                <div>
                  <label className="form-label">Couleur Neon</label>
                  <div style={{ display:'flex', gap:'0.6rem', flexWrap:'wrap', marginTop:'0.4rem' }}>
                    {COLORS.map(c => (
                      <button key={c} onClick={()=>setColor(c)} style={{
                        width:32, height:32, borderRadius:'50%', background:c,
                        border: color===c ? `3px solid white` : '2px solid rgba(255,255,255,0.1)',
                        cursor:'pointer', transition:'all 0.2s',
                        transform: color===c ? 'scale(1.25)' : 'scale(1)',
                        boxShadow: color===c ? `0 0 12px ${c}` : 'none',
                      }}/>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Print card: carte d'impression */}
        <div style={{
          marginTop:'2.5rem',
          background:'rgba(255,255,255,0.03)',
          border:`2px dashed ${color}55`,
          borderRadius:'1.25rem', padding:'2rem', textAlign:'center',
          boxShadow:`0 0 40px ${color}11`,
        }}>
          

          <h3 style={{ fontWeight:800, fontSize:'1rem', marginBottom:'1.25rem', color:'#F1F5F9' }}>
            🎓 Carte à Insérer dans votre Mémoire Papier
          </h3>


          <div style={{
            display:'inline-flex', alignItems:'center', gap:'2rem',
            background:'rgba(15,23,42,0.9)', padding:'1.5rem 2.5rem',
            borderRadius:'0.75rem', border:`1px solid ${color}33`, flexWrap:'wrap', justifyContent:'center',
          }}>


            <div style={{ border:`2px solid ${color}55`, borderRadius:'0.5rem', overflow:'hidden', boxShadow:`0 0 20px ${color}33` }}>
              <QRImage url={url} size={120} color={color}/>
            </div>


            <div style={{ textAlign:'left' }}>
              <div style={{ fontWeight:900, fontSize:'1.1rem', color:'#00FFA3', marginBottom:'0.25rem', textShadow:'0 0 10px rgba(0,255,163,0.4)' }}>SimArch Sustainable</div>

              <div style={{ fontSize:'0.85rem', color:'#CBD5E1', marginBottom:'0.5rem' }}>Plateforme de Simulation Architecturale Durable</div>

              <div style={{ fontSize:'0.75rem', color:'#475569' }}>Scannez pour accéder à la simulation interactive</div>
              
              <div style={{ fontSize:'0.68rem', color: color, fontFamily:"'JetBrains Mono',monospace", marginTop:'0.4rem', textShadow:`0 0 8px ${color}88` }}>{url}</div>
            </div>
          </div>
          <p style={{ marginTop:'1rem', fontSize:'0.75rem', color:'#334155' }}>
            Appuyez sur <kbd style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'4px', padding:'1px 5px', color:'#94A3B8' }}>Ctrl+P</kbd> dans le navigateur pour imprimer.
          </p>
        </div>

      </div>
    </div>
  );
}
