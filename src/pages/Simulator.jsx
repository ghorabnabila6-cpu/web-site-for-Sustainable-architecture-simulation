import React, { useState, useMemo, useRef, useEffect } from 'react';//memo pour mémoriserles calcules
//ref pour référencer un élément DOM sans déclencher de re-rendu
//effect pour exécuter du code en réponse à des changements d'état(board)

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';//pour afficher un carte interactive
//mapcon c le rectangle principale qui contient la carte
//tilelayer cla couche de tuiles(fond de carte openstreetmap)
//marker c un marqueur pour épingler sur la carte
//usemap c pour écouter les évenements de la cartecomme les clics


import {//chart.js une bib de graphiques
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Legend, ArcElement
} from 'chart.js';
//scale c types d'axes catégorie et nombres
//element sont les formes géométrique des graphiques poits..
//title, tooltip,legend sont des plugins d'affichage
import { Line, Doughnut, Bar } from 'react-chartjs-2';//les wrappers react de la bib chartjs


import ProjectManager from '../components/ProjectManager';//composant interne gérant la sauvgarde et le chargement de projets
import { jsPDF } from 'jspdf'; //pour gérer les pdf

import {
  Leaf, MapPin, Layers, Sun, ShieldAlert, Download, FolderOpen,
  Activity, Droplets, ThermometerSun, AlertTriangle, ArrowRight,
  CheckCircle, Lightbulb, Wind, Zap
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);
//enregistrement obligatoire dces modules psq sans them les graphiques ne s'affichent pas

const MATERIALS = [
  { id: 'concrete_full', name: 'Solid Reinforced Concrete (Structure)', lambda: 1.75,  color: '#9ca3af', price: 15000 },
  { id: 'concrete_light',name: 'Lightweight Aggregate Concrete',    lambda: 0.45,  color: '#cbd5e1', price: 12000 },
  { id: 'brick_hollow', name: 'Hollow Brick (standard)',      lambda: 0.45,  color: '#f87171', price: 6000 },
  { id: 'brick_full',   name: 'Solid Terracotta',            lambda: 0.8,   color: '#dc2626', price: 9000 },
  { id: 'stone',        name: 'Ashlar Stone (Local)',     lambda: 1.4,   color: '#a8a29e', price: 18000 },
  { id: 'insulation',   name: 'EPS Insulation (Polystyrene)',   lambda: 0.035, color: '#fde047', price: 8500 },
  { id: 'rockwool',     name: 'Rockwool (Thermal)',    lambda: 0.04,  color: '#a3e635', price: 11000 },
  { id: 'wood_massif',  name: 'Solid Wood (Cedar/Pine)',       lambda: 0.13,  color: '#d97706', price: 25000 },
  { id: 'cork_local',   name: 'Expanded Cork (Local DZ)',      lambda: 0.04,  color: '#92400e', price: 16000 },
  { id: 'earth_concrete',name: 'Earth Concrete (Toub)',        lambda: 0.75,  color: '#b45309', price: 4000 },
  { id: 'plaster',      name: 'Plaster (Coating)',               lambda: 0.35,  color: '#d1d5db', price: 3000 },
  { id: 'aerated',      name: 'Aerated Concrete (Siporex)',     lambda: 0.12,  color: '#c4b5fd', price: 14000 },
];

function getBioclimaticZone(lat) {
  if (lat > 36.2) return { name: 'Coastal (Zone A)', type: 'humid', wind: ['Sea breeze (Day)', 'Land breeze (Night)'] };
  if (lat > 34.5) return { name: 'High Plateaus (Zone B)', type: 'semi-arid', wind: ['Cold winds (North)', 'Sirocco (South)'] };
  if (lat > 32.5) return { name: 'Saharan Atlas (Zone C)', type: 'arid', wind: ['Sand winds', 'Dominant Sirocco'] };
  return { name: 'Sahara (Zone D)', type: 'hyper-arid', wind: ['Intense Sirocco (Chehili)', 'Desert thermal breeze'] };
}

const STANDARD_U = 2.5;// U thermique standard(DTR ALG)toutes les comparaisons de performance se font par rapport à cette valeur

/* ── Intelligent recommendation engine ── */
function getRecommendations({ uValue, flj, energySavings, win, layers, co2Reduction, location }) {
  const recs = [];
  const zone = getBioclimaticZone(location.lat);//reçoit les resultats calculés et les retourne dans un tableau commençcons par détecter la zone

  // recommendations par zone bioclimatique algérienne
  if (zone.type === 'humid') {
    recs.push({
      type: 'warning', icon: '🌊',
      title: `Coastal Strategy: ${zone.name}`,
      text: `Exploit the ${zone.wind[0]} for natural nocturnal ventilation. Materials: Cast-in-place reinforced concrete or Brick with hydrophobic cement coating.`,
      action: 'Promote cross-ventilation'
    });
  } else if (zone.type === 'hyper-arid' || zone.type === 'arid') {
    recs.push({
      type: 'warning', icon: '🏜️',
      title: `Saharan Strategy: ${zone.name}`,
      text: `Protection against ${zone.wind[0]} required. Use high thermal mass (Stone or Solid Terracotta) to absorb daytime heat.`,
      action: 'Use walls with high thermal mass'
    });
  } else {
    recs.push({
      type: 'warning', icon: '⛰️',
      title: `High Plateaus Strategy: ${zone.name}`,
      text: `Reinforced insulation mandatory against ${zone.wind[0]}. Beware of ${zone.wind[1]} (Chehili) in summer: close South-facing windows.`,
      action: 'Prioritize External Thermal Insulation (ETI)'
    });
  }

  if (uValue > 1.5) {//performance de la paroi
    recs.push({
      type: 'danger', icon: '🔥',
      title: 'Insufficient Insulation',
      text: `U-Value (${uValue.toFixed(2)}) too high. Major heat loss danger. Add 10cm of EPS or Rockwool Insulation.`,
      action: 'Add insulation (min 10cm)'
    });
  } else if (uValue > 0.8) {
    recs.push({
      type: 'warning', icon: '⚠️',
      title: 'Average Performance',
      text: `U-Value = ${uValue.toFixed(2)}. Acceptable for standard buildings, but insufficient for passive comfort.`,
      action: 'Optimize insulation thickness'
    });
  } else {
    recs.push({
      type: 'success', icon: '✅',
      title: 'Excellent Insulation',
      text: `U-Value = ${uValue.toFixed(2)}. Highly performing wall complying with international standards.`,
      action: null
    });
  }

  if (flj < 2) {//lumière naturelle
    recs.push({
      type: 'warning', icon: '💡',
      title: 'Low Natural Light',
      text: `DF = ${flj.toFixed(1)}%. Risk of visual discomfort. Increase window area or use high-transmission glazing (TL).`,
      action: 'Enlarge window or change TL'
    });
  }

  if (win.shadingFactor > 0.5 && (win.orientation === 'South' || win.orientation === 'West')) {
    recs.push({ //degre du sud ou ouest augumente sans proyection solaire suffisante surchaufe en été
      type: 'danger', icon: '🌡️',
      title: 'Overheating Risk (WWR)',
      text: `${win.orientation} orientation is vulnerable. Add solar shading (Sunshades, shutters) to reduce direct solar gain.`,
      action: 'Install fixed or movable sunshades'
    });
  }

  if (co2Reduction < 15) {//encourage l'usage de matérieux biosourcés
    recs.push({
      type: 'warning', icon: '🌿',
      title: 'Low Carbon Footprint',
      text: `Low CO\u2082 reduction (${co2Reduction.toFixed(0)} kg/year). Integrate materials like Wood or Terracotta for a better carbon footprint.`,
      action: 'Change composition towards sustainable materials'
    });
  }

  return recs;
}


/* ── PDF Generator (text-based, no screenshot) ── */
function generatePDF({ uValue, rValue, energySavings, co2Reduction, flj, gainEte, perteHiver, layers, win, climate, location, recommendations, totalInvestment, totalWallCost, totalWindowCost, extraInvestment, annualBillSavingsDA, paybackPeriod }) {
  //initiallisation
  const pdf    = new jsPDF('p', 'mm', 'a4');//portrait mm, format A4
  const W      = pdf.internal.pageSize.getWidth();//largeur de la page 210mm
  const margin = 20;//la marge 
  let y        = margin;//curseur vertical
  //ecrire une ligne avec ses critères
  const addLine = (txt, sz = 11, style = 'normal', color = [30, 30, 30]) => {
    pdf.setFontSize(sz);
    pdf.setFont('helvetica', style);
    pdf.setTextColor(...color);
    pdf.text(txt, margin, y);
    y += sz * 0.7;
  };

  const addSep = (h = 6) => { y += h; };//ajoute un espace vertical vide
  //ecrire un parag avec retour à la ligne automatique et gestion de pagination
  const addPara = (txt, sz = 10) => {
    pdf.setFontSize(sz);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(60, 60, 60);
    const lines = pdf.splitTextToSize(txt, W - margin * 2);
    lines.forEach(line => {
      if (y > 275) { pdf.addPage(); y = margin; }
      pdf.text(line, margin, y);
      y += 5;
    });
    y += 2;
  };

  // Header Decor
  pdf.setFillColor(16, 185, 129);
  pdf.rect(0, 0, W, 25, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('BIOCLIMATIC PERFORMANCE REPORT', margin, 16);
  y = 35;

  const zone = getBioclimaticZone(location.lat);

  
//les 7 sections du rapport  
  // 1. Spécifications Techniques
  addLine('1. Technical Specifications of Materials', 13, 'bold', [16, 140, 100]);
  addPara("The choice of Reinforced Concrete is complemented by its density and thermal conductivity (\u03bb) characteristics. For arid zones, we recommend Earth Concrete for its high thermal mass, which naturally regulates heat peaks.");
  
  addLine('Simulated wall composition:', 11, 'bold');
  layers.forEach((l, i) => {
    const m = MATERIALS.find(mat => mat.id === l.materialId);
    addLine(`   - Layer ${i+1} : ${m.name} (${l.thickness*100} cm) | \u03bb = ${m.lambda} W/mK`);
  });
  y += 5; 

  // 2. Analyse Bioclimatique
  addLine('2. Bioclimatic Analysis by Region', 13, 'bold', [16, 140, 100]);
  if (zone.type === 'humid') {
    addPara("Coastal Zone: Priority to humidity management and exploiting the sea breeze for passive cooling. The use of salt corrosion-resistant materials is recommended.");
  } else {
    addPara("Arid Zone / High Plateaus: Recommendation of materials with high thermal mass and reduction of glazed surfaces exposed to the Sirocco (hot sand wind). External insulation is a priority.");
  }
  y += 5;

  // 3. Dynamique des Vents
  addLine('3. Wind Dynamics and Ventilation', 13, 'bold', [16, 140, 100]);
  addPara(`The tool integrates the impact of local Wind Dynamics: ${zone.wind.join(' and ')}. The architect receives advice on the orientation of openings to promote cross ventilation while protecting against cold North winds in winter.`);
  y += 5;

  // 4. Analysis of Openings and Uw Coefficient
  addLine('4. Analysis of Openings and Uw Coefficient', 13, 'bold', [16, 140, 100]);
  addPara("The Uw Coefficient represents the ability of the glazed wall to let heat pass. It combines the thermal performance of the glazing (Ug) and the frame (Uf). It is the key indicator for evaluating winter losses and excessive summer gains.");
  const glazingLabel = win.uWindow > 4.0 ? 'Single Glazing (Monolithic)' : (win.uWindow > 1.5 ? 'Standard Double Glazing' : 'High-Performance Double Glazing (Low-E)');
  addLine(`• Selected Glazing Type: ${glazingLabel}  |  Uw = ${win.uWindow} W/m\u00b2K`, 11, 'bold');
  addLine(`• Window Area: ${(win.width * win.height).toFixed(2)} m\u00b2  |  Light Transmittance (LT): ${win.tl}  |  Orientation: ${win.orientation}`, 11);
  if (zone.type === 'humid') {
    addPara("Recommendation: In Coastal Zones, an Uw < 2.5 W/m2K is recommended to limit the impact of humidity and reduce the cooling load.");
  } else {
    addPara("Recommendation: In Arid Zones, prioritize movable solar shading to compensate for intense direct radiation.");
  }
  y += 5;

  // 5. Résultats Numériques
  addLine('5. Global Performance Indicators', 13, 'bold', [16, 140, 100]);
  addLine(`• Wall U-Value:              ${uValue.toFixed(3)} W/m\u00b2K`, 11);
  addLine(`• R-Value (Thermal Res.):   ${(1/uValue).toFixed(3)} m\u00b2K/W`, 11);
  addLine(`• Energy Savings vs. Standard: ${energySavings.toFixed(1)} %`, 11);
  addLine(`• Solar Gains (Summer):     ${Math.round(gainEte)} W`, 11);
  addLine(`• Thermal Losses (Winter):  ${Math.round(perteHiver)} W`, 11);
  addLine(`• Daylight Factor (DF):     ${flj.toFixed(1)} %`, 11);
  addLine(`• Estimated CO2 Reduction:  ${co2Reduction.toFixed(1)} kg/year`, 11);
  y += 8;

  // 6. Financial & Economic Analysis
  if (y > 220) { pdf.addPage(); y = 25; }
  addLine('6. Financial & Economic Analysis (Algerian Market Estimate)', 13, 'bold', [16, 140, 100]);
  addPara("The following cost estimates are based on average Algerian construction market prices (DA/m2) for materials and glazing systems. These figures are indicative and allow the promoter to evaluate the Return on Investment (ROI) of the sustainable envelope choices.");

  // Cost table header
  addSep(2);
  pdf.setFillColor(16, 140, 100);
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.rect(margin, y, W - margin * 2, 7, 'F');
  pdf.text('Item', margin + 2, y + 5);
  pdf.text('Cost (DA)', W - margin - 30, y + 5);
  y += 9;

  // Cost rows: temps de retour
  const rows = [
    { label: `  Wall Composition (${Math.round(20)} m2 reference surface)`, val: Math.round(totalWallCost).toLocaleString() + ' DA' },
    { label: `  Glazing System: ${glazingLabel}`, val: Math.round(totalWindowCost).toLocaleString() + ' DA' },
    { label: '  TOTAL Initial Investment', val: Math.round(totalInvestment).toLocaleString() + ' DA', bold: true },
    { label: '  Extra cost vs. standard construction', val: Math.round(extraInvestment).toLocaleString() + ' DA' },
  ];
  rows.forEach((row, idx) => {
    if (y > 270) { pdf.addPage(); y = 25; }
    if (idx % 2 === 0) {
      pdf.setFillColor(240, 250, 245);
      pdf.rect(margin, y - 1, W - margin * 2, 7, 'F');
    }
    pdf.setTextColor(row.bold ? 16 : 50, row.bold ? 140 : 50, row.bold ? 100 : 50);
    pdf.setFont('helvetica', row.bold ? 'bold' : 'normal');
    pdf.setFontSize(9);
    pdf.text(row.label, margin + 2, y + 4);
    pdf.text(row.val, W - margin - 2, y + 4, { align: 'right' });
    y += 8;
  });
  y += 4;

  // ROI Summary
  addLine('ROI Summary:', 11, 'bold', [16, 140, 100]);
  addLine(`• Estimated Annual Energy Bill Savings: +${Math.round(annualBillSavingsDA).toLocaleString()} DA/year`, 11, 'normal', [30, 30, 30]);
  addLine(`• Payback Period (ROI): ${paybackPeriod} years`, 11, 'bold', [16, 140, 100]);
  addPara(`   -> Interpretation: The additional investment of ${Math.round(extraInvestment).toLocaleString()} DA in high-performance materials will be fully recovered in ${paybackPeriod} years through reduced energy costs. After this period, all savings are net profit for the building owner.`);
  y += 6;

  // 7. Assistant Intelligent
  addLine('7. Intelligent Assistant Advice', 13, 'bold', [200, 30, 30]);
  addSep(2);
  recommendations.forEach((r, i) => {
    const color = r.type === 'danger' ? [200,30,30] : r.type === 'warning' ? [180,120,0] : [16,140,100];
    addLine(`${i+1}. ${r.icon} ${r.title}`, 10, 'bold', color);
    addPara(`   ${r.text}`, 9);
    if (r.action) {
       addLine(`   -> Action: ${r.action}`, 9, 'italic', [16, 140, 100]);
       y += 2;
    }
    y += 2;
  });

  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.text('© SimArch Sustainable — Certified parametric analysis ' + new Date().getFullYear(), W/2, 285, {align:'center'});

  pdf.save('SimArch_Expert_Report.pdf');
}




/* ─────────────────────────────────── COMPONENT ─────────────────────────────────── */
export default function Simulator({ user, externalOpenProjects, setExternalOpenProjects }) {
  const isArchitect = user?.role === 'architect';//si cl'architecte il permet de modifier les materieuxet l'imprimer
  const dashboardRef = useRef(null);
  const [showProjects, setShowProjects] = useState(false);//controler l'affichage de la modale projectmanager
  const [step, setStep] = useState(1);//l'étape du formulaire en 4pas

  // Écouter si l'ordre d'ouvrir est envoyé depuis Home
  useEffect(() => {
    if (externalOpenProjects) {
      setShowProjects(true);
      if (setExternalOpenProjects) setExternalOpenProjects(false);
    }
  }, [externalOpenProjects, setExternalOpenProjects]);
  

  //géoclimatique
  const [location, setLocation] = useState({ lat: 36.9, lng: 7.766 });//coordonnées géographiques
  const [climate,  setClimate]  = useState({ temp: 24, humidity: 65, sunHours: 8 });//données climatiques

  const [layers, setLayers] = useState([//composition de paroi
    { id: 'l1', materialId: 'brick_hollow', thickness: 0.20 },//chaque couche eu un id,,
    { id: 'l2', materialId: 'plaster',      thickness: 0.02 },
  ]);
 

  //analysis of openings
  const [win, setWin] = useState({
    width: 1.5, height: 1.2, orientation: 'South',
    shadingFactor: 0.5, uWindow: 1.3, roomArea: 15, tl: 0.7,
  });

  /* les calcules thermique */
  const rValue = useMemo(() => {
    let r = 0.17; //résistance superficielles standard
    layers.forEach(l => {
      const m = MATERIALS.find(m => m.id === l.materialId);
      if (m) r += l.thickness / m.lambda;//formule R=e/lambda pour chaque couche
    });
    return r;
  }, [layers]);//récalculer uniquement quand layer change

  const uValue      = 1 / rValue;
  const energySavings = Math.max(0, Math.min(100, ((STANDARD_U - uValue) / STANDARD_U) * 100));
  const co2Reduction  = energySavings * 1.2;
  const windowArea  = win.width * win.height; //surface vitrée en m carée
  const ORIENTATION_COEFFS = { 'South': 0.75, 'West': 1.0, 'East': 0.85, 'North': 0.25 };
  const irradiance  = 850 * (ORIENTATION_COEFFS[win.orientation] || 0.75);
  const gainEte     = windowArea * irradiance * win.shadingFactor * win.tl;//la chaleur qui entre par la the glass
  const dtHiver     = 20 - Math.max(0, climate.temp - 10);//du 6 c la température extérieure
  const perteHiver  = windowArea * win.uWindow * dtHiver;
  const flj         = (windowArea * win.tl * 0.5 * 100) / win.roomArea;



  /* ── Financial Logic(calcules) ── */
  const glazingPricePerM2 = win.uWindow > 4.0 ? 2000 : (win.uWindow > 1.5 ? 5000 : 8500);
  const totalWindowCost = windowArea * glazingPricePerM2;//cout total de la fenetre
  
  const wallArea = 20; // Assumed opaque wall area
  let wallCostPerM2 = 0; //comment on calcule le cout de chaque couche
  layers.forEach(l => {
    const m = MATERIALS.find(mat => mat.id === l.materialId);
    if (m) wallCostPerM2 += (l.thickness * m.price);
  });
  const totalWallCost = wallCostPerM2 * wallArea;
  const totalInvestment = totalWindowCost + totalWallCost;
 
   
  // Baseline standard cost (Hollow brick 20cm + plaster 2cm + single glazing)
  const baselineWallCost = ((0.2 * 6000) + (0.02 * 3000)) * wallArea;
  const baselineWinCost = windowArea * 2000;
  const baselineInvestment = baselineWallCost + baselineWinCost;//sert de base de comparaison

  const extraInvestment = Math.max(0, totalInvestment - baselineInvestment);//surcout de la solution performante vs le standard
  const annualBillSavingsDA = (energySavings / 100) * 45000; // Assumption: 45000 DA/year baseline bill
  const paybackPeriod = extraInvestment > 0 && annualBillSavingsDA > 0 ? (extraInvestment / annualBillSavingsDA).toFixed(1) : '0.0';//temps de retour sur investissement


  const recommendations = useMemo(() =>//memorise les resultats
    getRecommendations({ uValue, flj, energySavings, win, layers, co2Reduction, location }),
    [uValue, flj, energySavings, win, layers, co2Reduction, location]
  );

  /* Charts:données des graphiques */
  //calcule le gradient de température à traves le paroi
  const gradientData = useMemo(() => {
    const labels = ['Ext.']; const data = [0]; let drop = 0;
    layers.forEach(l => {
      const m = MATERIALS.find(m => m.id === l.materialId);
      if (m) {
        drop += ((l.thickness / m.lambda) / rValue) * 100;
        labels.push(m.name); data.push(drop);
      }
    });
    labels.push('Int.'); data.push(100);
    return { labels, datasets: [{ label:'Temp Drop (%)', data, borderColor:'#10b981', backgroundColor:'#10b98115', fill:true, tension:0.3 }] };
  }, [layers, rValue]);


  //donnée pour le graph en bares comparant U standard vs calculé
  const comparisonData = {
    labels: ['Standard (ref.)', 'Your Solution'],
    datasets: [
      { label:'U-Value (W/m²K)',  data:[STANDARD_U, uValue],        backgroundColor:['#fca5a5','#6ee7b7'] },
    ]
  };

  /* Handlers:gestionnaire d'évenement */
  const addLayer    = () => setLayers([...layers, { id:`l${Date.now()}`, materialId:'insulation', thickness:0.1 }]);//ajoute une couche d'isolant par defaut génère un id unique
  const removeLayer = id => setLayers(layers.filter(l => l.id !== id));//supprimer une couche à propos de l'id en filtrant le tableau
  const updateLayer = (id, key, val) => setLayers(layers.map(l => l.id === id ? {...l, [key]:val} : l));

  const LocationPicker = () => {
    useMapEvents({ click(e) {//ecoute les clics sur la carte et met à jour la position 
      setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
      setClimate({//estime le climat par inerpolation linéaire selon la latitude
        temp:     Math.round(20 + (36 - e.latlng.lat) * 2),
        humidity: Math.round(65 - (36 - e.latlng.lat) * 5),
        sunHours: Math.round(8  + (36 - e.latlng.lat) * 0.5),
      });
    }});
    return <Marker position={[location.lat, location.lng]} />;
  };


   //collecte tout les états et les résulatts calculés pour passer à les générer 
  const handleExportPDF = () => generatePDF({
    uValue, rValue, energySavings, co2Reduction, flj, gainEte, perteHiver,
    layers, win, climate, location, recommendations,
    totalInvestment, totalWallCost, totalWindowCost,
    extraInvestment, annualBillSavingsDA, paybackPeriod
  });


  /* ── snapshot de l'état actuel et envoyé au projectmanager pour sauvgarder ── */
  const currentState = { location, climate, layers, win };

  //charger un projet sauvegardé
  const handleLoadProject = (loadedData) => {
    if (!loadedData) return;
    let data = loadedData;
    // Sécurité : si la donnée est reçue comme une chaîne depuis le PHP on les parse
    if (typeof loadedData === 'string') {
      try { data = JSON.parse(loadedData); } catch (e) { console.error('Parsing error', e); }
    }
    //les vérifications evitent d'écraser l'état si un champ est manquant
    if (data.location) setLocation(data.location);
    if (data.climate) setClimate(data.climate);
    if (data.layers) setLayers(data.layers);
    if (data.win) setWin(data.win);
    // If the promoteur loads a project, jump directly to Dashboard (read-only results)
    if (user?.role === 'promoteur') {
      setStep(4);
    }
  };



  /* ── Colors for rec badge retourne du css selon le type de recommand ── */
  // Dark-mode rec styles (bg:border:color)
  const parseStyle = type => {
    const map = {
      danger:  { bg:'rgba(255,61,107,0.08)',  border:'rgba(255,61,107,0.25)',  color:'#FF3D6B' },
      warning: { bg:'rgba(255,184,0,0.08)',   border:'rgba(255,184,0,0.25)',   color:'#FFB800' },
      success: { bg:'rgba(0,255,163,0.06)',   border:'rgba(0,255,163,0.25)',   color:'#00FFA3' },
    };
    return map[type] || map.warning;
  };

  /* ── Step Nav helpers: données des 4 étapes pour construire la barre de navigation ── */
  const zone = getBioclimaticZone(location.lat);
  const STEPS = [
    { n:1, label:'Geoclimate',  icon:'🗺️' },
    { n:2, label:'Wall',      icon:'🧱' },
    { n:3, label:'Windows',      icon:'🪟' },
    { n:4, label:'Dashboard',  icon:'📊' },
  ];
  //style glassmorphism
  const NeonCard = ({ children, style={} }) => (
    <div style={{
      background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
      borderRadius:'1rem', backdropFilter:'blur(12px)', ...style
    }}>{children}</div>
  );
 
  //conteneur principal
  return (
    <div style={{ minHeight:'calc(100dvh - 62px)', display:'flex', flexDirection:'column', background:'#020B18', overflow:'hidden', position:'relative' }}>
      
      {/* ── STEPPER HEADER ── */}
      <div style={{ 
        padding:'1.5rem 2rem 1rem', 
        borderBottom:'1px solid rgba(255,255,255,0.05)',
        display:'flex', justifyContent:'center', alignItems:'center', gap:'2rem',
        background:'rgba(15,23,42,0.6)', backdropFilter:'blur(10px)',
        position:'relative', zIndex:10,
        flexWrap: 'wrap'
      }}>
        {STEPS.map((s, i) => (//génere les 4 cercles numéroté, si deja passé affiche >
          <React.Fragment key={s.n}>
            <div 
              onClick={() => { 
                if (!isArchitect) return; // Le client ne peut pas naviguer en arrière(bloque)
                if(s.n <= step) setStep(s.n);//permet de revenir en arrière
              }}
              style={{
                display:'flex', alignItems:'center', gap:'0.75rem',
                cursor: (!isArchitect || s.n > step) ? 'default' : 'pointer',
                opacity: step === s.n ? 1 : (s.n < step ? 0.7 : 0.3),
                transition:'all 0.3s ease'
              }}
            >
              <div style={{
                width:32, height:32, borderRadius:'50%',
                background: step >= s.n ? 'rgba(0,255,163,0.1)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${step >= s.n ? '#00FFA3' : 'rgba(255,255,255,0.1)'}`,
                display:'flex', alignItems:'center', justifyContent:'center',
                color: step >= s.n ? '#00FFA3' : '#94A3B8',
                boxShadow: step === s.n ? '0 0 15px rgba(0,255,163,0.3)' : 'none',//s'allume sur l'étape active
                fontSize:'0.8rem', fontWeight:700, transition:'all 0.3s ease'
              }}>
                {s.n < step ? <CheckCircle size={14}/> : s.n}
              </div>


              <div style={{ fontSize:'0.85rem', fontWeight:600, color: step >= s.n ? '#F1F5F9' : '#64748B', transition:'color 0.3s ease' }}>
                {s.label}
              </div>
            </div>
            {i < STEPS.length - 1 && (//la bare de connexion entre 2 étapes devient verte quaand l'étape est passée
              <div style={{ flex:1, maxWidth:60, height:2, background: s.n < step ? '#00FFA3' : 'rgba(255,255,255,0.05)', transition:'background 0.3s ease' }}/>
            )}
          </React.Fragment>
        ))}
      </div>



      {/* ── CONTENT AREA:zone de contenu avec ses 4 étapes── */}
      <div style={{ flex:1, overflowY:'auto', padding:'2rem', position:'relative', display:'flex', flexDirection:'column' }}>
        
        {/* STEP 1: GÉOCLIMAT */}
        {step === 1 && (//affiché uniquement si step==1 animation d'appartition
          <div style={{ flex:1, display:'flex', flexDirection:'column', maxWidth:1200, margin:'0 auto', width:'100%', animation:'fadeIn 0.5s ease-out' }}>
            <div style={{ marginBottom:'1.5rem', textAlign:'center' }}>
              <h2 style={{ fontSize:'1.8rem', fontWeight:800, color:'#F1F5F9', marginBottom:'0.5rem' }}>🌍 Geoclimatic Configuration</h2>
              <p style={{ color:'#94A3B8', fontSize:'0.9rem' }}>Select the exact location of your project to retrieve climate data.</p>
            </div>
            //la carte leaflet
            <div style={{ display:'flex', gap:'1.5rem', flex:1, minHeight:400, flexWrap:'wrap' }}>
              <NeonCard style={{ flex:2, minWidth:300, overflow:'hidden', position:'relative', padding:0, border:'1px solid rgba(0,212,255,0.3)', boxShadow:'0 0 30px rgba(0,212,255,0.05)' }}>
                <MapContainer center={[36.9, 7.766]} zoom={5} scrollWheelZoom={false} style={{height:'100%',width:'100%',minHeight:400}}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" className="map-tiles" />
                  <LocationPicker/>
                </MapContainer>
              </NeonCard>
              
              <div style={{ flex:1, minWidth:300, display:'flex', flexDirection:'column', gap:'1rem' }}>
                <NeonCard style={{ padding:'1.5rem', border:'1px solid rgba(0,255,163,0.2)' }}>
                  <h3 style={{ fontSize:'0.9rem', color:'#00FFA3', fontWeight:700, marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                    <MapPin size={16}/> Detected Bioclimatic Zone
                  </h3>
                  <div style={{ fontSize:'1.2rem', fontWeight:800, color:'#F1F5F9', marginBottom:'0.5rem' }}>{zone.name}</div>
                  <div style={{ fontSize:'0.8rem', color:'#94A3B8', lineHeight:1.5 }}>
                    Dominant winds: {zone.wind.join(' / ')}
                  </div>
                </NeonCard>

                <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:'0.75rem' }}>
                  {[//3cartes météo affichant la température,,généré par un map 
                    { icon:<ThermometerSun size={18} color="#FFB800"/>, val:`${climate.temp}°C`, label:'Average Temperature', bg:'rgba(255,184,0,0.05)' },
                    { icon:<Droplets size={18} color="#00D4FF"/>, val:`${climate.humidity}%`, label:'Humidity Rate', bg:'rgba(0,212,255,0.05)' },
                    { icon:<Sun size={18} color="#FFB800"/>, val:`${climate.sunHours}h/d`, label:'Sunlight', bg:'rgba(255,184,0,0.05)' },
                  ].map((c,i)=>(
                    <NeonCard key={i} style={{ padding:'1.25rem', display:'flex', alignItems:'center', gap:'1rem', background:c.bg }}>
                      <div style={{ padding:'0.75rem', background:'rgba(15,23,42,0.8)', borderRadius:'0.5rem' }}>{c.icon}</div>
                      <div>
                        <div style={{ fontSize:'1.4rem', fontWeight:800, color:'#F1F5F9', fontFamily:"'JetBrains Mono',monospace" }}>{c.val}</div>
                        <div style={{ fontSize:'0.75rem', color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.05em' }}>{c.label}</div>
                      </div>
                    </NeonCard>
                  ))}
                </div>

                <div style={{ flex:1 }}/>
                <button className="btn btn-primary" onClick={()=>setStep(2)} style={{ padding:'1rem', fontSize:'1rem', justifyContent:'center', borderRadius:'0.75rem', width:'100%' }}>
                  Next Step: Design Wall <ArrowRight size={18}/>
                </button>
              </div>
            </div>
          </div>
        )}



        {/* STEP 2: WALL BUILDER */}
        {step === 2 && (
          <div style={{ maxWidth:1000, margin:'0 auto', width:'100%', animation:'fadeIn 0.5s ease-out' }}>
            <div style={{ marginBottom:'2rem', textAlign:'center' }}>
              <h2 style={{ fontSize:'1.8rem', fontWeight:800, color:'#F1F5F9', marginBottom:'0.5rem' }}>🧱 Wall Engineering</h2>
              <p style={{ color:'#94A3B8', fontSize:'0.9rem' }}>Design the opaque envelope layer by layer and observe the thermal performance.</p>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))', gap:'2rem' }}>
              <NeonCard style={{ padding:'1.5rem', border:'1px solid rgba(0,255,163,0.15)' }}>
                <h3 style={{ fontSize:'1rem', color:'#F1F5F9', fontWeight:700, marginBottom:'1.5rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                  <Layers size={16} color="#00FFA3"/> Dynamic Composition
                </h3>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem', marginBottom:'1rem' }}>
                  {layers.map(l=>{//pour chaque couche un select pour choisir le matériau
                  //un slider d'épaisseur
                  //un bouton de suppression
                  // le caré coloré reflète la couleur du matériau
                    const mat = MATERIALS.find(m=>m.id===l.materialId);
                    return (
                      <div key={l.id} style={{ background:'rgba(15,23,42,0.6)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:'0.75rem', padding:'1rem', position:'relative' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.75rem' }}>
                          <div style={{ width:12, height:12, borderRadius:'3px', background:mat.color, flexShrink:0, boxShadow:`0 0 8px ${mat.color}88` }}/>
                          <select className="form-select" style={{ flex:1, fontSize:'0.85rem' }} value={l.materialId} onChange={e=>updateLayer(l.id,'materialId',e.target.value)}>
                            {MATERIALS.map(m=><option key={m.id} value={m.id}>{m.name} (λ={m.lambda})</option>)}
                          </select>
                          <button onClick={()=>removeLayer(l.id)} style={{ color:'#FF3D6B', background:'none', border:'none', cursor:'pointer', padding:5 }}>✕</button>
                        </div>
                        <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem', color:'#94A3B8', marginBottom:'0.5rem' }}>
                          <span>Thickness</span>
                          <span style={{ color:'#00FFA3', fontFamily:"'JetBrains Mono',monospace", fontWeight:700 }}>{(l.thickness*100).toFixed(0)} cm</span>
                        </div>
                        <input type="range" min="0.01" max="0.5" step="0.01" value={l.thickness} onChange={e=>updateLayer(l.id,'thickness',parseFloat(e.target.value))} style={{ width:'100%' }}/>
                      </div>
                    );
                  })}
                </div>
                <button onClick={addLayer} className="btn btn-outline" style={{ width:'100%', borderStyle:'dashed', borderColor:'rgba(0,255,163,0.3)', color:'#00FFA3', justifyContent:'center' }}>
                  + Add a Layer
                </button>
              </NeonCard>

              <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
                <NeonCard style={{ padding:'1.5rem', background:'rgba(0,255,163,0.05)', border:'1px solid rgba(0,255,163,0.2)' }}>
                  <h3 style={{ fontSize:'0.9rem', color:'#00FFA3', fontWeight:700, marginBottom:'0.5rem' }}>Instant Performance</h3>
                  <div style={{ display:'flex', alignItems:'flex-end', gap:'0.5rem' }}>
                    <div style={{ fontSize:'2.5rem', fontWeight:900, color: uValue<=STANDARD_U ? '#00FFA3' : '#FF3D6B', lineHeight:1, fontFamily:"'JetBrains Mono',monospace" }}>{uValue.toFixed(2)}</div>
                    <div style={{ fontSize:'0.9rem', color:'#94A3B8', paddingBottom:'0.3rem' }}>W/m²K (U-Value)</div>
                  </div>
                </NeonCard>

                <NeonCard style={{ padding:'1.5rem', flex:1, display:'flex', flexDirection:'column' }}>
                  <h3 style={{ fontSize:'1rem', color:'#F1F5F9', fontWeight:700, marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                    <Activity size={16} color="#00D4FF"/> 2D Cross Section
                  </h3>
                  <div style={{ display:'flex', height:140, borderRadius:'0.5rem', overflow:'hidden', border:'1px solid rgba(255,255,255,0.1)', boxShadow:'inset 0 0 20px rgba(0,0,0,0.5)' }}>
                    {layers.map(l=>{//visualisation 2D
                      const mat=MATERIALS.find(m=>m.id===l.materialId);
                      const total=layers.reduce((s,x)=>s+x.thickness,0);
                      const pct=Math.max(8,(l.thickness/total)*100);//
                      return (
                        <div key={l.id} title={`${mat.name} – ${(l.thickness*100).toFixed(0)}cm`}
                          style={{width:`${pct}%`,background:mat.color,display:'flex',alignItems:'center',justifyContent:'center',
                            writingMode:'vertical-rl',fontSize:'0.65rem',fontWeight:700,
                            color:'rgba(0,0,0,0.7)',textTransform:'uppercase',letterSpacing:1,transition:'width 0.4s'}}>
                          {mat.name}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem', color:'#64748B', marginTop:'0.75rem' }}>
                    <span>← Exterior</span>
                    <span>Interior →</span>
                  </div>
                </NeonCard>
                
                <div style={{ display:'flex', gap:'1rem' }}>
                  <button className="btn btn-outline" onClick={()=>setStep(1)} style={{ padding:'1rem', flex:1, justifyContent:'center', borderRadius:'0.75rem' }}>Back</button>
                  <button className="btn btn-primary" onClick={()=>setStep(3)} style={{ padding:'1rem', flex:2, justifyContent:'center', borderRadius:'0.75rem' }}>Next Step: Windows <ArrowRight size={18}/></button>
                </div>
              </div>
            </div>
          </div>
        )}
 


        {/* STEP 3: WINDOWS */}
        {step === 3 && (
          <div style={{ maxWidth:900, margin:'0 auto', width:'100%', animation:'fadeIn 0.5s ease-out' }}>
            <div style={{ marginBottom:'2rem', textAlign:'center' }}>
              <h2 style={{ fontSize:'1.8rem', fontWeight:800, color:'#F1F5F9', marginBottom:'0.5rem' }}>🪟 Analysis of Openings</h2>
              <p style={{ color:'#94A3B8', fontSize:'0.9rem' }}>Configure glass openings to evaluate solar heat gains and visual comfort.</p>
            </div>

            <NeonCard style={{ padding:'2rem', marginBottom:'2rem', border:'1px solid rgba(255,184,0,0.2)' }}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:'2rem' }}>
                <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize:'0.85rem' }}>Window dimensions (W × H in meters)</label>
                    <div style={{ display:'flex', gap:'1rem' }}>
                      <input type="number" className="form-input" value={win.width} step="0.1" onChange={e=>setWin({...win, width:+e.target.value})}/>
                      <input type="number" className="form-input" value={win.height} step="0.1" onChange={e=>setWin({...win, height:+e.target.value})}/>
                    </div>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize:'0.85rem' }}>Main Orientation</label>
                    <select className="form-select" value={win.orientation} onChange={e=>setWin({...win, orientation:e.target.value})}>
                      {['North','South','East','West'].map(o=><option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize:'0.85rem' }}>Shading Factor (0=Blocked, 1=Clear)</label>
                    <input type="range" min="0" max="1" step="0.05" value={win.shadingFactor} onChange={e=>setWin({...win, shadingFactor:+e.target.value})} style={{ width:'100%' }}/>
                    <div style={{ textAlign:'right', fontSize:'0.75rem', color:'#FFB800', fontFamily:"'JetBrains Mono',monospace", marginTop:'0.25rem' }}>{win.shadingFactor.toFixed(2)}</div>
                  </div>
                </div>
                  
                <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize:'0.85rem' }}>Glazing Type (U-Value)</label>
                    <select className="form-select" value={win.uWindow} onChange={e=>setWin({...win, uWindow: parseFloat(e.target.value)})}>
                      <option value={5.8}>Single Glazing (Monolithic)</option>
                      <option value={2.8}>Standard Double Glazing</option>
                      <option value={1.3}>High-Performance Double (Low-E)</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize:'0.85rem' }}>Light Transmittance (LT)</label>
                    <input type="number" className="form-input" value={win.tl} step="0.05" min="0" max="1" onChange={e=>setWin({...win, tl:+e.target.value})}/>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize:'0.85rem' }}>Room area (m²)</label>
                    <input type="number" className="form-input" value={win.roomArea} step="1" onChange={e=>setWin({...win, roomArea:+e.target.value})}/>
                  </div>
                </div>
              </div>
            </NeonCard>

            <div style={{ display:'flex', gap:'1rem', justifyContent:'center' }}>
              <button className="btn btn-outline" onClick={()=>setStep(2)} style={{ padding:'1rem 2rem', borderRadius:'0.75rem' }}>Back</button>
              <button className="btn btn-primary" onClick={()=>setStep(4)} style={{ padding:'1rem 2rem', borderRadius:'0.75rem' }}>Final Step: Dashboard <ArrowRight size={18}/></button>
            </div>
          </div>
        )}



        {/* STEP 4: DASHBOARD & AI */}
        {step === 4 && (//la bande 
          <div style={{ maxWidth:1200, margin:'0 auto', width:'100%', animation:'fadeIn 0.5s ease-out' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'2rem', flexWrap:'wrap', gap:'1rem' }}>
              <div>
                <h2 style={{ fontSize:'1.8rem', fontWeight:800, color:'#F1F5F9', marginBottom:'0.25rem' }}>📊 Dashboard & Expert System</h2>
                <p style={{ color:'#94A3B8', fontSize:'0.9rem' }}>Thermal results and optimization recommendations.</p>
              </div>
              <div style={{ display:'flex', gap:'0.75rem' }}>
                {isArchitect && (//btn strat
                  <button className="btn btn-outline" onClick={()=>setStep(1)} style={{ fontSize:'0.8rem', borderRadius:'0.6rem' }}>Start Over</button>
                )}
                {isArchitect && (//btn save
                  <button className="btn btn-primary" onClick={() => setShowProjects(true)} style={{ fontSize:'0.8rem', gap:'0.5rem', borderRadius:'0.6rem', background: 'transparent', border: '1px solid #00FFA3', color: '#00FFA3' }}>
                    <FolderOpen size={16}/> Save / Manage Projects
                  </button>
                )}
                {isArchitect && (//btn pdf
                  <button className="btn btn-primary" onClick={handleExportPDF} style={{ fontSize:'0.8rem', gap:'0.5rem', borderRadius:'0.6rem' }}>
                    <Download size={16}/> Generate PDF Report
                  </button>
                )}
              </div>
            </div>

            {/* KPIs: les cartes */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:'1rem', marginBottom:'1.5rem' }}>
              {[
                { val:uValue.toFixed(2), unit:'W/m²K', label:'Wall U-Value', color:'#00FFA3', glow:'rgba(0,255,163,0.1)' },
                { val:`${Math.round(gainEte)}`, unit:'W', label:'Solar Gains (Summer)', color:'#FFB800', glow:'rgba(255,184,0,0.1)' },
                { val:`${Math.round(perteHiver)}`, unit:'W', label:'Thermal Losses (Winter)', color:'#00D4FF', glow:'rgba(0,212,255,0.1)' },
                { val:flj.toFixed(1), unit:'%', label:'Daylight Factor (DF)', color:flj>=2?'#00FFA3':'#FF3D6B', glow:flj>=2?'rgba(0,255,163,0.1)':'rgba(255,61,107,0.1)' },
              ].map((k,i)=>(
                <NeonCard key={i} style={{ padding:'1.5rem', textAlign:'center', background:k.glow, border:`1px solid ${k.color}40` }}>
                  <div style={{ fontSize:'2.2rem', fontWeight:900, color:k.color, fontFamily:"'JetBrains Mono',monospace", textShadow:`0 0 15px ${k.color}88`, lineHeight:1 }}>{k.val}</div>
                  <div style={{ fontSize:'0.7rem', color:k.color, fontWeight:700, textTransform:'uppercase', margin:'0.6rem 0 0.25rem' }}>{k.unit}</div>
                  <div style={{ fontSize:'0.8rem', color:'#CBD5E1' }}>{k.label}</div>
                </NeonCard>
              ))}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(350px, 1fr))', gap:'1.5rem', marginBottom:'1.5rem' }}>
              

              {/* Financial KPIs */}
              <div style={{ display:'flex', gap:'1rem', flexDirection:'column' }}>
                <NeonCard style={{ flex:1, padding:'1.5rem', border:'1px solid rgba(189,147,249,0.3)', background:'rgba(189,147,249,0.05)' }}>
                   <div style={{ fontSize:'0.8rem', color:'#BD93F9', fontWeight:700, textTransform:'uppercase' }}>Initial Investment</div>
                   <div style={{ fontSize:'1.8rem', fontWeight:800, color:'#F1F5F9', fontFamily:"'JetBrains Mono',monospace", margin:'0.5rem 0' }}>{Math.round(totalInvestment).toLocaleString()} DA</div>
                   <div style={{ fontSize:'0.75rem', color:'#94A3B8' }}>Wall: {Math.round(totalWallCost).toLocaleString()} DA | Windows: {Math.round(totalWindowCost).toLocaleString()} DA</div>
                </NeonCard>

                <div style={{ display:'flex', gap:'1rem', flex: 1 }}>
                  <NeonCard style={{ flex:1, padding:'1.5rem', border:'1px solid rgba(0,255,163,0.3)', background:'rgba(0,255,163,0.05)' }}>
                     <div style={{ fontSize:'0.8rem', color:'#00FFA3', fontWeight:700, textTransform:'uppercase' }}>Annual Savings</div>
                     <div style={{ fontSize:'1.6rem', fontWeight:800, color:'#F1F5F9', fontFamily:"'JetBrains Mono',monospace", margin:'0.5rem 0' }}>+{Math.round(annualBillSavingsDA).toLocaleString()} DA/yr</div>
                     <div style={{ fontSize:'0.7rem', color:'#94A3B8' }}>Based on {Math.round(energySavings)}% energy reduction</div>
                  </NeonCard>

                  <NeonCard style={{ flex:1, padding:'1.5rem', border:'1px solid rgba(255,184,0,0.3)', background:'rgba(255,184,0,0.05)' }}>
                     <div style={{ fontSize:'0.8rem', color:'#FFB800', fontWeight:700, textTransform:'uppercase' }}>ROI Payback</div>
                     <div style={{ fontSize:'1.6rem', fontWeight:800, color:'#F1F5F9', fontFamily:"'JetBrains Mono',monospace", margin:'0.5rem 0' }}>{paybackPeriod} Years</div>
                     <div style={{ fontSize:'0.7rem', color:'#94A3B8' }}>To recover extra ({Math.round(extraInvestment).toLocaleString()} DA)</div>
                  </NeonCard>
                </div>
              </div>
              <NeonCard style={{ padding:'1.5rem', display:'flex', flexDirection:'column' }}>
                <h3 style={{ fontSize:'1rem', color:'#F1F5F9', fontWeight:700, marginBottom:'1.5rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                  <ShieldAlert size={16} color="#00D4FF"/> Savings vs DTR Standard
                </h3>
                <div style={{ flex:1, position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <div style={{ height: 220, width: '100%' }}>

                  
                  <Doughnut
                      data={{labels:['Savings','Losses'],datasets:[{data:[energySavings,100-energySavings],backgroundColor:['#00FFA3','rgba(255,255,255,0.05)'],borderColor:['rgba(0,255,163,0.5)','rgba(255,255,255,0.1)'],borderWidth:1}]}}
                      options={{cutout:'75%',maintainAspectRatio:false,plugins:{legend:{display:false}}}}
                    />
                  </div>
                  <div style={{ position:'absolute', textAlign:'center', pointerEvents:'none' }}>
                    <div style={{ fontSize:'2rem', fontWeight:900, color:'#00FFA3', fontFamily:"'JetBrains Mono',monospace", textShadow:'0 0 15px rgba(0,255,163,0.6)' }}>{Math.round(energySavings)}%</div>
                  </div>
                </div>
              </NeonCard>
              <NeonCard style={{ padding:'1.5rem' }}>
                <h3 style={{ fontSize:'1rem', color:'#F1F5F9', fontWeight:700, marginBottom:'1.5rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                  <Zap size={16} color="#BD93F9"/> Thermal Gradient — Neon Curve
                </h3>
                <div style={{ height:220 }}>


                  <Line
                    data={{...gradientData, datasets:[{...gradientData.datasets[0], borderColor:'#00FFA3', backgroundColor:'rgba(0,255,163,0.05)', pointBackgroundColor:'#00FFA3', pointRadius:5, borderWidth:3, tension:0.4}]}} options={{
                    responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}},
                    scales:{y:{min:0,max:100,grid:{color:'rgba(255,255,255,0.05)'},ticks:{color:'#94A3B8'}},x:{grid:{color:'rgba(255,255,255,0.05)'},ticks:{color:'#94A3B8'}}}
                  }}/>
                </div>
              </NeonCard>
            </div>

            <NeonCard style={{ padding:'2rem' }}>
              <h3 style={{ fontSize:'1.1rem', color:'#F1F5F9', fontWeight:700, marginBottom:'1.5rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                <Lightbulb size={18} color="#FFB800"/> Intelligent Assistant
              </h3>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:'1rem' }}>



                {recommendations.map((r,i)=>{
                  const s=parseStyle(r.type);
                  return (
                    <div key={i} style={{ background:s.bg, border:`1px solid ${s.border}`, borderLeft:`4px solid ${s.color}`, borderRadius:'0.75rem', padding:'1.25rem' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.75rem' }}>
                        <span style={{ fontSize:'1.25rem' }}>{r.icon}</span>
                        <span style={{ fontWeight:800, fontSize:'0.9rem', color:s.color }}>{r.title}</span>
                      </div>
                      <p style={{ fontSize:'0.85rem', color:'#94A3B8', lineHeight:1.6, marginBottom:r.action?'1rem':0 }}>{r.text}</p>
                      {r.action && (
                        <div style={{ fontSize:'0.75rem', fontWeight:700, color:s.color, background:'rgba(255,255,255,0.05)', padding:'0.4rem 0.75rem', borderRadius:'0.5rem', display:'inline-block', border:`1px solid ${s.border}` }}>
                          → {r.action}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </NeonCard>

          </div>
        )}
      </div>



      {/* ── Project Manager Modal ── */}
      {showProjects && (//affiché conditionnelement
        <ProjectManager
          currentState={currentState}//passe l'état courant pour sauvegarder
          onLoad={handleLoadProject}//fonction de chargement
          onClose={() => setShowProjects(false)}
          user={user}
          uValue={uValue}//les valeurs thermiques pour affichage dans la liste des projets
          rValue={rValue}
        />
      )}
    </div>
  );
}
