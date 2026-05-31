import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Simulator from './pages/Simulator' ;
import Methodology from './pages/Methodology';
import Validation from './pages/Validation';
import QRCodePage from './pages/QRCodePage';
import Login from './pages/Login';

function App() {
  const [user, setUser] = useState(null); // 'architect' or 'client'
  const [currentPage, setCurrentPage] = useState('home');
  const [openProjectsFromHome, setOpenProjectsFromHome] = useState(false);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':        return <Home setCurrentPage={setCurrentPage} onOpenProjects={() => { setCurrentPage('simulator'); setOpenProjectsFromHome(true); }} user={user} />;
      case 'simulator':   return <Simulator user={user} externalOpenProjects={openProjectsFromHome} setExternalOpenProjects={setOpenProjectsFromHome} />;
      case 'methodology': return <Methodology />;
      case 'validation':  return <Validation />;
      case 'qrcode':      return <QRCodePage />;
      default:            return <Home setCurrentPage={setCurrentPage} />;
    }
  };

  const isSimulator = currentPage === 'simulator';

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100dvh', background:'#f8fafc' }}>
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} user={user} onLogout={() => setUser(null)} />
      <main style={{ flex:1, display:'flex', flexDirection:'column', overflow: isSimulator ? 'hidden' : 'auto' }}>
        {renderPage()}
      </main>
      {!isSimulator && (
        <footer style={{ background:'white', borderTop:'1px solid #e5e7eb', padding:'1.25rem 2rem', textAlign:'center', color:'#9ca3af', fontSize:'0.85rem' }}>
          © 2026 SimArch Sustainable · Architecture Simulation Platform · Made with ❤️ for sustainability
        </footer>
      )}
    </div>
  );
}

export default App;
