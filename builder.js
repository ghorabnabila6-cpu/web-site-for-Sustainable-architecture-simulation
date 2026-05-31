const fs = require('fs');

fs.mkdirSync('src/components', {recursive: true});
fs.mkdirSync('src/pages', {recursive: true});

// Migrate App.jsx to Simulator.jsx
let app = fs.readFileSync('src/App.jsx', 'utf8');
app = app.replace('function App() {', 'export default function Simulator() {')
         .replace('export default App;', '');
fs.writeFileSync('src/pages/Simulator.jsx', app);

// Append to index.css
const css = `
/* Navigation */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 2.5rem;
  background-color: var(--bg-panel);
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
  z-index: 50;
  position: relative;
}
.navbar-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: transform 0.2s;
}
.navbar-brand:hover {
  transform: scale(1.02);
}
.navbar-links {
  display: flex;
  gap: 2rem;
}
.nav-link {
  background: none;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  padding-bottom: 0.5rem;
  border-bottom: 3px solid transparent;
}
.nav-link:hover, .nav-link.active {
  color: var(--brand-green);
}
.nav-link.active {
  border-bottom-color: var(--brand-green);
}

/* Home Page */
.page-container {
  min-height: 100%;
  width: 100%;
  background-color: var(--bg-main);
  overflow-y: auto;
}
.hero-section {
  padding: 8rem 2rem;
  text-align: center;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(14, 165, 233, 0.08) 100%);
  border-bottom: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;
}
.hero-content {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 10;
}
.hero-content h1 {
  font-size: 3.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  line-height: 1.2;
  letter-spacing: -0.02em;
}
.hero-content p {
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin-bottom: 3rem;
  line-height: 1.6;
}
.btn-large {
  padding: 1.25rem 2.5rem !important;
  font-size: 1.125rem !important;
  font-weight: 600 !important;
  box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3) !important;
  border-radius: 9999px !important;
}
.btn-large:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgba(16, 185, 129, 0.4) !important;
}
.features-section {
  padding: 6rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}
.features-section h2 {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 4rem;
  color: var(--text-primary);
}
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2.5rem;
}
.feature-card {
  background: var(--bg-panel);
  padding: 2.5rem;
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: var(--shadow-lg);
  border-color: var(--brand-green);
}
.feature-icon {
  width: 56px;
  height: 56px;
  margin-bottom: 1.5rem;
}
.feature-card h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--text-primary);
}
.feature-card p {
  color: var(--text-secondary);
  line-height: 1.6;
  font-size: 1.05rem;
}

/* Adjust Simulator Container */
.app-container {
  height: calc(100vh - 84px); /* Full height minus larger navbar */
}
`;
fs.appendFileSync('src/index.css', css);

// Add Tailwind CDN to index.html
let html = fs.readFileSync('index.html', 'utf8');
if (!html.includes('tailwindcss.com')) {
    html = html.replace('</head>', '  <script src="https://cdn.tailwindcss.com"></script>\n  </head>');
    fs.writeFileSync('index.html', html);
}
