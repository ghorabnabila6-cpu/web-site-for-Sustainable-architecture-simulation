import React, { useState, useEffect } from 'react';
import { FolderOpen, Save, Plus, Trash2, X, Edit2, Check, UserPlus, UserMinus } from 'lucide-react';

const API_URL       = '/simarch-backend/projects.php';
const WALLS_API_URL = '/simarch-backend/walls.php';

/* ── Wall / Layer DB helpers ── */
const saveWallToDB = async (projectId, currentState, uValue, rValue) => {
  try {
    const layers = (currentState.layers || []).map((l, i) => ({
      materialId: l.materialId,
      thickness:  l.thickness,
      ordre:      i,
    }));
    await fetch(WALLS_API_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: projectId,
        u_value:    uValue  || 0,
        r_value:    rValue  || 0,
        layers,
      }),
    });
  } catch (e) {
    console.warn('Wall save failed (backend unavailable):', e);
  }
};

const loadWallFromDB = async (projectId) => {
  try {
    const res  = await fetch(`${WALLS_API_URL}?project_id=${encodeURIComponent(projectId)}`);
    const json = await res.json();
    if (json.success && json.layers && json.layers.length > 0) {
      // Retourner les layers au format attendu par Simulator
      return json.layers.map(l => ({
        id:         l.id,
        materialId: l.materialId,
        thickness:  l.thickness,
      }));
    }
  } catch (e) {
    console.warn('Wall load failed (backend unavailable):', e);
  }
  return null; // null = utiliser les données JSON du projet comme fallback
};

/* ── Project Management Modal ── */
export default function ProjectManager({ currentState, onLoad, onClose, user, uValue, rValue }) {
  const [projects, setProjects]       = useState([]);
  const [newName, setNewName]         = useState('');
  const [editingId, setEditingId]     = useState(null);
  const [editName, setEditName]       = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [loading, setLoading]         = useState(true);

  // Sharing state — now supports adding multiple promoteurs
  const [sharingId, setSharingId]     = useState(null);
  const [shareEmail, setShareEmail]   = useState('');

  // Charger les projets depuis le backend PHP
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(`${API_URL}?email=${encodeURIComponent(user.email)}&role=${encodeURIComponent(user.role)}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProjects(data);
      })
      .catch(() => {
        // Fallback localStorage si XAMPP est éteint
        try {
          const local = JSON.parse(localStorage.getItem('simarch_projects')) || [];
          setProjects(user.role === 'architect'
            ? local
            : local.filter(p => Array.isArray(p.sharedWith) && p.sharedWith.includes(user.email))
          );
        } catch (e) {}
      })
      .finally(() => setLoading(false));
  }, [user]);

  // Réinitialiser l'UI locale et envoyer au serveur
  const syncProjects = async (action, dataObj, localUpdatedArray) => {
    setProjects(localUpdatedArray);
    localStorage.setItem('simarch_projects', JSON.stringify(localUpdatedArray));

    try {
      const options = {
        method: (action === 'CREATE' || action === 'UPDATE') ? 'POST'
               : action === 'DELETE' ? 'DELETE'
               : 'PUT',
        headers: { 'Content-Type': 'application/json' },
      };

      if (action === 'DELETE') {
        await fetch(`${API_URL}?id=${dataObj.id}`, options);
      } else {
        options.body = JSON.stringify(dataObj);
        await fetch(API_URL, options);
      }
    } catch {
      console.warn('Backend unavailable — local save only.');
    }
  };

  /* ── Save current simulation as new project ── */
  const handleSave = async () => {
    const name = newName.trim();
    if (!name) return;
    const projet = {
      id:         Date.now().toString(),
      name,
      owner:      user?.email || 'anonymous',
      role:       user?.role  || 'promoteur',
      date:       new Date().toLocaleDateString('en-US'),
      data:       currentState,
      sharedWith: [],
    };
    syncProjects('CREATE', projet, [projet, ...projects]);
    // Sauvegarder le mur et les couches dans les tables dédiées
    await saveWallToDB(projet.id, currentState, uValue, rValue);
    setNewName('');
  };

  /* ── Overwrite existing project with current simulation ── */
  const handleUpdate = async (id) => {
    const pTarget = projects.find(p => p.id === id);
    if (!pTarget) return;
    const projet  = { ...pTarget, data: currentState, date: new Date().toLocaleDateString('en-US') };
    syncProjects('UPDATE', projet, projects.map(p => p.id === id ? projet : p));
    // Mettre à jour le mur et les couches dans les tables dédiées
    await saveWallToDB(id, currentState, uValue, rValue);
  };

  /* ── Rename ── */
  const handleRename = (id) => {
    if (!editName.trim()) return;
    const updated = projects.map(p => p.id === id ? { ...p, name: editName.trim() } : p);
    syncProjects('RENAME', { id, action: 'rename', name: editName.trim() }, updated);
    setEditingId(null);
  };

  /* ── Delete ── */
  const handleDelete = (id) => {
    syncProjects('DELETE', { id }, projects.filter(p => p.id !== id));
    setConfirmDelete(null);
  };

  /* ── Add a promoteur to sharedWith list ── */
  const handleAddShare = (id) => {
    const email = shareEmail.trim();
    if (!email) { setSharingId(null); return; }

    const updated = projects.map(p => {
      if (p.id !== id) return p;
      const already = Array.isArray(p.sharedWith) ? p.sharedWith : [];
      if (already.includes(email)) return p; // Already shared
      return { ...p, sharedWith: [...already, email] };
    });

    syncProjects('SHARE', { id, action: 'share', promoteurEmail: email }, updated);
    setShareEmail('');
    setSharingId(null);
  };

  /* ── Remove a promoteur from sharedWith list ── */
  const handleRemoveShare = (id, emailToRemove) => {
    const updated = projects.map(p => {
      if (p.id !== id) return p;
      return { ...p, sharedWith: (p.sharedWith || []).filter(e => e !== emailToRemove) };
    });
    syncProjects('UNSHARE', { id, action: 'unshare', promoteurEmail: emailToRemove }, updated);
  };

  /* ── Load project: fetch wall layers from DB, fallback to JSON ── */
  const handleLoad = async (projet) => {
    // 1. Charger les couches depuis la table 'layer' (source principale)
    const dbLayers = await loadWallFromDB(projet.id);
    
    let finalData = projet.data || {};
    if (typeof finalData === 'string') {
      try { finalData = JSON.parse(finalData); } catch(e) {}
    }

    if (dbLayers) {
      // Priorité aux données relationnelles de la BD
      finalData = { ...finalData, layers: dbLayers };
    }
    // Si pas de données en BD, on garde les layers du JSON (fallback)

    onLoad(finalData);
    onClose();
  };

  const isArchitect    = user?.role === 'architect';
  const visibleProjects = projects;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1rem'
    }}>
      <div style={{
        background: 'white', borderRadius: '1rem', width: '100%', maxWidth: '640px',
        maxHeight: '88vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>

        {/* ── Header ── */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>📁 My Projects (Cloud)</h2>
            <p style={{ color: '#6b7280', fontSize: '0.8rem', margin: '0.2rem 0 0' }}>
              Logged in as <strong style={{ color: isArchitect ? '#10b981' : '#3b82f6' }}>
                {user?.email}
              </strong> · <span style={{ fontWeight: 700, color: isArchitect ? '#10b981' : '#3b82f6', textTransform: 'capitalize' }}>
                {isArchitect ? '⚡ Architect' : '🏛️ Promoteur'}
              </span>
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
            <X size={22} />
          </button>
        </div>

        {/* ── New project (Architect only) ── */}
        {isArchitect && (
          <div style={{ padding: '1.25rem', borderBottom: '1px solid #f3f4f6', background: '#f9fafb' }}>
            <label className="form-label">Save current simulation as a new project:</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
              <input
                type="text"
                className="form-input"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Ex: Villa Sahara — Isolated Wall"
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                style={{ flex: 1 }}
              />
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={!newName.trim()}
                style={{ gap: '0.4rem', whiteSpace: 'nowrap' }}
              >
                <Save size={16}/> Save to Server
              </button>
            </div>
          </div>
        )}

        {/* ── Project list ── */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '1rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9ca3af' }}>
              Loading projects from server...
            </div>
          ) : visibleProjects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9ca3af' }}>
              <FolderOpen size={40} style={{ opacity: 0.4, marginBottom: '0.75rem' }} />
              <p style={{ fontWeight: 600 }}>No projects available</p>
              <p style={{ fontSize: '0.8rem' }}>
                {isArchitect
                  ? 'Create your first simulation above.'
                  : 'No project has been shared with you by an architect yet.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {visibleProjects.map(p => {
                const sharedList = Array.isArray(p.sharedWith) ? p.sharedWith : [];
                return (
                  <div key={p.id} style={{
                    border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1rem',
                    background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}>
                    {/* Top row: icon + name + actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>

                      {/* Role icon */}
                      <div style={{
                        width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
                        background: p.role === 'architect' ? '#ecfdf5' : '#eff6ff'
                      }}>
                        {p.role === 'architect' ? '👩‍💻' : '🏛️'}
                      </div>

                      {/* Name + meta */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {editingId === p.id ? (
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <input
                              className="form-input"
                              value={editName}
                              onChange={e => setEditName(e.target.value)}
                              style={{ fontSize: '0.85rem', padding: '0.3rem 0.5rem' }}
                              autoFocus
                              onKeyDown={e => e.key === 'Enter' && handleRename(p.id)}
                            />
                            <button onClick={() => handleRename(p.id)} style={{ background: '#10b981', border: 'none', borderRadius: '0.375rem', color: 'white', cursor: 'pointer', padding: '0.3rem 0.5rem' }}>
                              <Check size={14}/>
                            </button>
                          </div>
                        ) : (
                          <div style={{ fontWeight: 700, fontSize: '0.925rem', color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {p.name}
                          </div>
                        )}
                        <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.1rem' }}>
                          Saved on {p.date_created || p.date} · {p.owner}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
                        <button onClick={() => handleLoad(p)} className="btn btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', gap: '0.3rem' }}>
                          <FolderOpen size={13}/> {isArchitect ? 'Open' : 'View (Read-Only)'}
                        </button>

                        {isArchitect && (
                          <>
                            <button onClick={() => handleUpdate(p.id)} className="btn btn-outline" style={{ padding: '0.4rem 0.6rem' }} title="Overwrite with current simulation">
                              <Save size={13}/>
                            </button>
                            <button onClick={() => { setEditingId(p.id); setEditName(p.name); }} className="btn btn-outline" style={{ padding: '0.4rem 0.6rem' }} title="Rename">
                              <Edit2 size={13}/>
                            </button>
                            {confirmDelete === p.id ? (
                              <button onClick={() => handleDelete(p.id)} style={{ background: '#ef4444', border: 'none', borderRadius: '0.375rem', color: 'white', cursor: 'pointer', padding: '0.4rem 0.6rem', fontSize: '0.72rem', fontWeight: 700 }}>
                                Confirm?
                              </button>
                            ) : (
                              <button onClick={() => setConfirmDelete(p.id)} className="btn btn-outline" style={{ padding: '0.4rem 0.6rem', color: '#ef4444', borderColor: '#fecaca' }} title="Delete">
                                <Trash2 size={13}/>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* ── Sharing Section (Architect only) ── */}
                    {isArchitect && (
                      <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #f3f4f6' }}>

                        {/* List of promoteurs already shared with */}
                        {sharedList.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.6rem' }}>
                            {sharedList.map(email => (
                              <span key={email} style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                                background: '#ecfdf5', border: '1px solid #a7f3d0',
                                borderRadius: '999px', padding: '0.2rem 0.6rem',
                                fontSize: '0.72rem', fontWeight: 600, color: '#065f46'
                              }}>
                                🏛️ {email}
                                <button
                                  onClick={() => handleRemoveShare(p.id, email)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 0, lineHeight: 1 }}
                                  title={`Revoke access for ${email}`}
                                >
                                  <UserMinus size={11}/>
                                </button>
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Add promoteur input */}
                        {sharingId === p.id ? (
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <input
                              className="form-input"
                              placeholder="Promoteur email address..."
                              value={shareEmail}
                              onChange={e => setShareEmail(e.target.value)}
                              style={{ fontSize: '0.78rem', padding: '0.35rem 0.5rem', flex: 1 }}
                              autoFocus
                              onKeyDown={e => e.key === 'Enter' && handleAddShare(p.id)}
                            />
                            <button onClick={() => handleAddShare(p.id)} style={{ background: '#10b981', border: 'none', borderRadius: '0.375rem', color: 'white', cursor: 'pointer', padding: '0.35rem 0.6rem' }}>
                              <Check size={14}/>
                            </button>
                            <button onClick={() => setSharingId(null)} style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '0.375rem', color: '#6b7280', cursor: 'pointer', padding: '0.35rem 0.6rem' }}>
                              <X size={14}/>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setSharingId(p.id); setShareEmail(''); }}
                            className="btn btn-outline"
                            style={{ padding: '0.35rem 0.75rem', color: '#10b981', borderColor: '#a7f3d0', fontSize: '0.75rem', gap: '0.4rem' }}
                          >
                            <UserPlus size={13}/> Share with a Promoteur
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ padding: '0.875rem 1.25rem', borderTop: '1px solid #f3f4f6', fontSize: '0.72rem', color: '#10b981', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}>
          <Check size={14}/> Synchronized with XAMPP server (MySQL)
        </div>
      </div>
    </div>
  );
}
