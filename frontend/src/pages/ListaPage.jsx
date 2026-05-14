import { useState, useEffect } from 'react';
import { getLista, toggleCogido, deleteItem, vaciarLista } from '../api/lista';
import { PageSpinner, Spinner } from '../components/ui/Spinner';
import { ToastContainer } from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import { Link } from 'react-router-dom';

const SECCION_ICONS = {
  'Frutas y Verduras':        '🥦',
  'Carnes y Aves':            '🍗',
  'Pescados y Mariscos':      '🐟',
  'Lácteos y Huevos':         '🥛',
  'Panadería y Bollería':     '🍞',
  'Aceites y Conservas':      '🫙',
  'Pasta, Arroz y Legumbres': '🍝',
  'Condimentos y Especias':   '🧂',
  'Bebidas':                  '🧃',
  'Congelados':               '🧊',
  'Otros':                    '🛒',
};

export default function ListaPage() {
  const { toasts, addToast } = useToast();
  const [secciones, setSecciones] = useState({});
  const [loading,   setLoading]   = useState(true);
  const [vaciando,  setVaciando]  = useState(false);
  const [collapsed, setCollapsed] = useState({});

  const cargar = () =>
    getLista(true)
      .then(d => setSecciones(d.agrupada || {}))
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => { cargar(); }, []);

  const totalItems  = Object.values(secciones).flat().length;
  const cogidos     = Object.values(secciones).flat().filter(i => i.cogido).length;
  const totalPrecio = Object.values(secciones).flat()
    .reduce((s, i) => s + parseFloat(i.precio_estimado || 0), 0);

  const handleToggle = async (id) => {
    try {
      const res = await toggleCogido(id);
      setSecciones(prev => {
        const next = {};
        for (const [sec, items] of Object.entries(prev)) {
          next[sec] = items.map(i => i.id === id ? { ...i, cogido: res.cogido } : i);
        }
        return next;
      });
    } catch {}
  };

  const handleDelete = async (id) => {
    try {
      await deleteItem(id);
      setSecciones(prev => {
        const next = {};
        for (const [sec, items] of Object.entries(prev)) {
          const filtered = items.filter(i => i.id !== id);
          if (filtered.length) next[sec] = filtered;
        }
        return next;
      });
      addToast('Producto eliminado de la lista.', 'success');
    } catch {}
  };

  const handleVaciar = async () => {
    if (!window.confirm('¿Vaciar toda la lista de la compra?')) return;
    setVaciando(true);
    try {
      await vaciarLista();
      setSecciones({});
      addToast('Lista vaciada.', 'success');
    } catch {}
    finally { setVaciando(false); }
  };

  if (loading) return <div style={{ paddingTop: 100 }}><PageSpinner /></div>;

  return (
    <div className="container" style={{ paddingTop: 28, paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="section-title">Mi lista de la compra</h1>
          {totalItems > 0 && (
            <p className="section-subtitle">{totalItems} producto{totalItems !== 1 ? 's' : ''} · {cogidos} cogido{cogidos !== 1 ? 's' : ''}</p>
          )}
        </div>
        {totalItems > 0 && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div className="price-badge">💶 ~{totalPrecio.toFixed(2).replace('.', ',')} €</div>
            <button className="btn btn-ghost btn-sm" onClick={handleVaciar} disabled={vaciando}
              style={{ color: '#D93025', border: '1px solid #FCA5A5' }}
              onMouseEnter={e => e.currentTarget.style.background = '#FFF5F5'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              {vaciando ? <Spinner /> : '🗑 Vaciar lista'}
            </button>
          </div>
        )}
      </div>

      {/* Progreso */}
      {totalItems > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ height: 6, background: 'var(--border)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'var(--green)', borderRadius: 'var(--radius-full)', width: `${(cogidos / totalItems) * 100}%`, transition: 'width 0.4s ease' }} />
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
            {Math.round((cogidos / totalItems) * 100)}% completado
          </div>
        </div>
      )}

      {totalItems === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">🛒</span>
          <p className="empty-state-title">Tu lista está vacía</p>
          <p className="empty-state-desc">Busca una receta y añade sus ingredientes con un clic.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 8 }}>Ver recetas</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {Object.entries(secciones).map(([seccion, items]) => {
            const isCollapsed = collapsed[seccion];
            const cogidosEn   = items.filter(i => i.cogido).length;
            return (
              <div key={seccion} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                {/* Cabecera sección */}
                <button onClick={() => setCollapsed(c => ({ ...c, [seccion]: !c[seccion] }))}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', background: cogidosEn === items.length ? 'var(--green-subtle)' : 'var(--bg-page)', border: 'none', cursor: 'pointer', transition: 'var(--transition)' }}
                  onMouseEnter={e => e.currentTarget.style.background = cogidosEn === items.length ? 'var(--green-light)' : '#ebebeb'}
                  onMouseLeave={e => e.currentTarget.style.background = cogidosEn === items.length ? 'var(--green-subtle)' : 'var(--bg-page)'}>
                  <span style={{ fontSize: 20 }}>{SECCION_ICONS[seccion] || '🛒'}</span>
                  <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', flex: 1, textAlign: 'left' }}>{seccion}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', marginRight: 8 }}>{cogidosEn}/{items.length}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>▼</span>
                </button>

                {/* Items */}
                {!isCollapsed && items.map((item, idx) => (
                  <div key={item.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px',
                    borderTop: '1px solid var(--border)',
                    background: item.cogido ? 'var(--green-subtle)' : 'var(--bg-card)',
                    transition: 'background 0.2s',
                  }}>
                    {/* Checkbox */}
                    <button onClick={() => handleToggle(item.id)} style={{
                      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                      border: `2px solid ${item.cogido ? 'var(--green)' : 'var(--border)'}`,
                      background: item.cogido ? 'var(--green)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', transition: 'var(--transition)',
                    }}>
                      {item.cogido && <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>✓</span>}
                    </button>

                    {/* Nombre */}
                    <span style={{ flex: 1, fontSize: 14, color: item.cogido ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: item.cogido ? 'line-through' : 'none', fontWeight: 500, transition: 'var(--transition)' }}>
                      {item.producto_nombre}
                    </span>

                    {/* Cantidad */}
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600, minWidth: 70, textAlign: 'right' }}>
                      {parseFloat(item.cantidad_total.toFixed(2))} {item.unidad}
                    </span>

                    {/* Precio */}
                    <span style={{ fontSize: 12, color: item.cogido ? 'var(--text-muted)' : 'var(--green-dark)', fontWeight: 600, minWidth: 52, textAlign: 'right' }}>
                      ~{parseFloat(item.precio_estimado).toFixed(2)} €
                    </span>

                    {/* Eliminar */}
                    <button onClick={() => handleDelete(item.id)} style={{ color: 'var(--text-disabled)', fontSize: 16, padding: '2px 6px', borderRadius: 4, transition: 'var(--transition)', background: 'none', border: 'none', cursor: 'pointer' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#D93025'; e.currentTarget.style.background = '#FFF5F5'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-disabled)'; e.currentTarget.style.background = 'transparent'; }}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      <ToastContainer toasts={toasts} />
    </div>
  );
}
