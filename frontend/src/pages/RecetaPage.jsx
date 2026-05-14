import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReceta, getPrecio } from '../api/recetas';
import { addReceta } from '../api/lista';
import { toggleFavorito } from '../api/favoritos';
import { PageSpinner, Spinner } from '../components/ui/Spinner';
import { ToastContainer } from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';

const CARD_COLORS = ['#FFF3E0','#E8F5E9','#E3F2FD','#FCE4EC','#F3E5F5','#E0F7FA','#FFF8E1'];
const FOOD_EMOJIS = ['🍳','🥘','🍝','🍲','🥗','🍖','🥙','🍱','🥣','🫕','🍜','🥞'];

const TAG_LABELS = {
  VEGANO: '🌱 Vegano', VEGETARIANO: '🥦 Vegetariano',
  SIN_GLUTEN: '🌾 Sin gluten', SIN_LACTOSA: '🥛 Sin lactosa', SIN_HUEVO: '🥚 Sin huevo',
};

export default function RecetaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toasts, addToast } = useToast();

  const [receta,   setReceta]   = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [raciones, setRaciones] = useState(4);
  const [precio,   setPrecio]   = useState(null);
  const [fav,      setFav]      = useState(false);
  const [adding,   setAdding]   = useState(false);

  useEffect(() => {
    getReceta(id)
      .then(r => { setReceta(r); setRaciones(r.raciones_base); })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!receta) return;
    getPrecio(id, raciones).then(setPrecio).catch(() => {});
  }, [id, raciones, receta]);

  const handleAddToList = async () => {
    setAdding(true);
    try {
      await addReceta(id, raciones);
      addToast(`¡Ingredientes añadidos a tu lista! (${raciones} raciones)`, 'success');
    } catch {
      addToast('Error al añadir a la lista. Inténtalo de nuevo.', 'error');
    } finally {
      setAdding(false);
    }
  };

  const handleFav = async () => {
    try {
      const res = await toggleFavorito(id);
      setFav(res.favorito);
      addToast(res.favorito ? 'Añadida a favoritas ❤️' : 'Eliminada de favoritas', 'success');
    } catch {}
  };

  if (loading) return <div style={{ paddingTop: 100 }}><PageSpinner /></div>;
  if (!receta) return null;

  const colorIdx = receta.nombre.charCodeAt(0) % CARD_COLORS.length;
  const emojiIdx = receta.nombre.charCodeAt(0) % FOOD_EMOJIS.length;

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Hero */}
      <div style={{
        height: 320, background: CARD_COLORS[colorIdx],
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 96, position: 'relative', overflow: 'hidden',
      }}>
        {receta.foto_url
          ? <img src={receta.foto_url} alt={receta.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
          : <span style={{ filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.15))' }}>{FOOD_EMOJIS[emojiIdx]}</span>
        }
        {/* Gradiente inferior */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(transparent, rgba(0,0,0,0.08))' }} />
      </div>

      <div className="container" style={{ paddingTop: 28 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 40, alignItems: 'start' }}>

          {/* COLUMNA IZQUIERDA */}
          <div>
            {/* Tags */}
            {receta.tags?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                {receta.tags.map(t => (
                  <span key={t} style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', background: 'var(--green-light)', color: 'var(--green-dark)', borderRadius: 'var(--radius-full)' }}>
                    {TAG_LABELS[t] || t}
                  </span>
                ))}
              </div>
            )}

            {/* Título */}
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 12 }}>
              {receta.nombre}
            </h1>

            {/* Meta */}
            <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
              <span style={{ fontSize: 14, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                ⏱ <strong style={{ color: 'var(--text-primary)' }}>{receta.tiempo_minutos} min</strong>
              </span>
              <span style={{ fontSize: 14, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                👥 <strong style={{ color: 'var(--text-primary)' }}>{receta.raciones_base} raciones base</strong>
              </span>
            </div>

            {receta.descripcion && (
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 28, maxWidth: 600 }}>
                {receta.descripcion}
              </p>
            )}

            <div className="divider" />

            {/* Ingredientes */}
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              🧺 Ingredientes
              <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-muted)' }}>para {raciones} personas</span>
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', marginBottom: 32 }}>
              {receta.ingredientes.map((ing, i) => {
                const factor    = raciones / receta.raciones_base;
                const cantidad  = parseFloat((ing.cantidad_base * factor).toFixed(1));
                const ppu       = ing.producto_precio / ing.cantidad_por_envase;
                const costoIng  = (cantidad * ppu).toFixed(2);
                return (
                  <div key={ing.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '11px 16px',
                    background: i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-page)',
                    borderBottom: i < receta.ingredientes.length - 1 ? '1px solid var(--border)' : 'none',
                    gap: 12,
                  }}>
                    <span style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>
                      {ing.nombre_display || ing.producto_nombre}
                    </span>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
                        {cantidad} {ing.unidad}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 48, textAlign: 'right' }}>
                        ~{costoIng} €
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pasos */}
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              📋 Preparación
            </h2>
            <ol style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {receta.pasos.map(p => (
                <li key={p.orden} style={{ display: 'flex', gap: 14 }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: '50%', background: 'var(--green)',
                    color: '#fff', fontWeight: 700, fontSize: 13,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2,
                  }}>{p.orden}</span>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{p.descripcion}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* COLUMNA DERECHA — Sticky panel */}
          <div style={{ position: 'sticky', top: 110 }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, boxShadow: 'var(--shadow-card)' }}>
              {/* Precio */}
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500 }}>
                  PRECIO ESTIMADO
                </div>
                <div className="price-badge" style={{ fontSize: 26, padding: '10px 20px', justifyContent: 'center' }}>
                  💶 {precio ? precio.precio_display : '...'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                  con productos Hacendado
                </div>
              </div>

              <div className="divider" style={{ margin: '16px 0' }} />

              {/* Control de raciones */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10, textAlign: 'center' }}>
                  NÚMERO DE RACIONES
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
                  <button onClick={() => setRaciones(r => Math.max(1, r - 1))}
                    style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid var(--green)', color: 'var(--green)', fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'var(--bg-card)', transition: 'var(--transition)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--green)'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--green)'; }}>
                    −
                  </button>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{raciones}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>personas</div>
                  </div>
                  <button onClick={() => setRaciones(r => Math.min(20, r + 1))}
                    style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid var(--green)', color: 'var(--green)', fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'var(--bg-card)', transition: 'var(--transition)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--green)'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--green)'; }}>
                    +
                  </button>
                </div>
              </div>

              {/* Botones */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button className="btn btn-primary btn-full btn-lg" onClick={handleAddToList} disabled={adding}>
                  {adding ? <><Spinner /> Añadiendo...</> : '🛒 Añadir a mi lista'}
                </button>
                <button onClick={handleFav}
                  className={`btn btn-full ${fav ? 'btn-secondary' : 'btn-ghost'}`}
                  style={{ border: fav ? undefined : '1px solid var(--border)' }}>
                  {fav ? '❤️ En favoritas' : '🤍 Guardar en favoritas'}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      <ToastContainer toasts={toasts} />
    </div>
  );
}
