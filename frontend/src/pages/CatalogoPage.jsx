import { useState, useEffect } from 'react';
import { getCatalogo } from '../api/recetas';
import { RecipeCard, RecipeCardSkeleton } from '../components/RecipeCard';
import { RecipeFilters } from '../components/RecipeFilters';
import { useDebounce } from '../hooks/useDebounce';
import { useAuth } from '../context/AuthContext';

export default function CatalogoPage({ searchValue }) {
  const { usuario } = useAuth();
  const [recetas, setRecetas]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filters, setFilters]   = useState(usuario?.preferencias || []);

  const debouncedQ = useDebounce(searchValue, 300);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (debouncedQ) params.q = debouncedQ;
    if (filters.length) params.tags = filters.join(',');

    getCatalogo(params)
      .then(data => setRecetas(data.recetas))
      .catch(() => setRecetas([]))
      .finally(() => setLoading(false));
  }, [debouncedQ, filters]);

  const hoje = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="container" style={{ paddingTop: 28, paddingBottom: 48 }}>
      {/* Encabezado */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="section-title">Recetas de la semana</h1>
          <p className="section-subtitle">{hoje}</p>
        </div>
        {!loading && (
          <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
            {recetas.length} receta{recetas.length !== 1 ? 's' : ''} encontrada{recetas.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Filtros */}
      <div style={{ marginBottom: 24 }}>
        <RecipeFilters active={filters} onChange={setFilters} />
      </div>

      {/* Búsqueda activa */}
      {debouncedQ && (
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Resultados para:</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', background: 'var(--green-light)', padding: '2px 10px', borderRadius: 'var(--radius-full)' }}>
            "{debouncedQ}"
          </span>
        </div>
      )}

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <RecipeCardSkeleton key={i} />)
          : recetas.length > 0
            ? recetas.map(r => <RecipeCard key={r.id} receta={r} />)
            : (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                <span className="empty-state-icon">🔍</span>
                <p className="empty-state-title">No encontramos recetas</p>
                <p className="empty-state-desc">
                  {debouncedQ
                    ? `No hay recetas con "${debouncedQ}". Prueba con otro término.`
                    : 'Prueba cambiando los filtros activos.'}
                </p>
                {(filters.length > 0 || debouncedQ) && (
                  <button className="btn btn-secondary btn-sm" style={{ marginTop: 8 }}
                    onClick={() => { setFilters([]); }}>
                    Limpiar filtros
                  </button>
                )}
              </div>
            )
        }
      </div>
    </div>
  );
}
