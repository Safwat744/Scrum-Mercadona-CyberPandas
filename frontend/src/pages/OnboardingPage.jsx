import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setPrefs } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/ui/Spinner';

const OPCIONES = [
  { key: 'VEGANO',      label: 'Vegano',       emoji: '🌱', desc: 'Sin productos de origen animal' },
  { key: 'VEGETARIANO', label: 'Vegetariano',  emoji: '🥦', desc: 'Sin carne ni pescado' },
  { key: 'SIN_GLUTEN',  label: 'Sin gluten',   emoji: '🌾', desc: 'Apto para celíacos' },
  { key: 'SIN_LACTOSA', label: 'Sin lactosa',  emoji: '🥛', desc: 'Sin lácteos' },
  { key: 'SIN_HUEVO',   label: 'Sin huevo',    emoji: '🥚', desc: 'Apto para alérgicos al huevo' },
];

export default function OnboardingPage() {
  const { usuario, updateUsuario } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState([]);
  const [loading,  setLoading]  = useState(false);

  const toggle = (key) =>
    setSelected(s => s.includes(key) ? s.filter(k => k !== key) : [...s, key]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await setPrefs(selected);
      updateUsuario({ onboarding_done: true, preferencias: selected });
      navigate('/');
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, var(--green-subtle) 0%, #fff 60%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 520 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>👋</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            ¡Hola{usuario?.nombre ? `, ${usuario.nombre}` : ''}!
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.5 }}>
            ¿Tienes alguna preferencia alimentaria?<br />
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Personalizaremos las recetas para ti. Puedes cambiarlas después.</span>
          </p>
        </div>

        {/* Opciones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
          {OPCIONES.map(op => {
            const isActive = selected.includes(op.key);
            return (
              <button key={op.key} onClick={() => toggle(op.key)} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 18px', borderRadius: 10,
                border: `2px solid ${isActive ? 'var(--green)' : 'var(--border)'}`,
                background: isActive ? 'var(--green-light)' : 'var(--bg-card)',
                cursor: 'pointer', transition: 'var(--transition)', textAlign: 'left',
              }}>
                <span style={{ fontSize: 28, width: 36, textAlign: 'center' }}>{op.emoji}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: isActive ? 'var(--green-dark)' : 'var(--text-primary)' }}>{op.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{op.desc}</div>
                </div>
                <div style={{ marginLeft: 'auto', width: 20, height: 20, borderRadius: '50%', border: `2px solid ${isActive ? 'var(--green)' : 'var(--border)'}`, background: isActive ? 'var(--green)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {isActive && <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>✓</span>}
                </div>
              </button>
            );
          })}
        </div>

        {/* Acciones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button className="btn btn-primary btn-full btn-lg" onClick={handleSave} disabled={loading}>
            {loading ? <><Spinner /> Guardando...</> : selected.length > 0 ? `Guardar preferencias (${selected.length})` : 'Continuar sin preferencias'}
          </button>
        </div>
      </div>
    </div>
  );
}
