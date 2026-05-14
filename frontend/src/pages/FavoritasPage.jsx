import { useState, useEffect } from 'react';
import { getFavoritos } from '../api/favoritos';
import { RecipeCard, RecipeCardSkeleton } from '../components/RecipeCard';
import { Link } from 'react-router-dom';

export default function FavoritasPage() {
  const [favoritos, setFavoritos] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    getFavoritos()
      .then(d => setFavoritos(d.favoritos))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleFavChange = (recetaId, isFav) => {
    if (!isFav) setFavoritos(prev => prev.filter(r => r.id !== recetaId));
  };

  return (
    <div className="container" style={{ paddingTop: 28, paddingBottom: 60 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 className="section-title">❤️ Mis favoritas</h1>
        {!loading && <p className="section-subtitle">{favoritos.length} receta{favoritos.length !== 1 ? 's' : ''} guardada{favoritos.length !== 1 ? 's' : ''}</p>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <RecipeCardSkeleton key={i} />)
          : favoritos.length > 0
            ? favoritos.map(r => <RecipeCard key={r.id} receta={r} isFavorito={true} onFavChange={handleFavChange} />)
            : (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                <span className="empty-state-icon">🤍</span>
                <p className="empty-state-title">Aún no tienes favoritas</p>
                <p className="empty-state-desc">Pulsa el corazón en cualquier receta para guardarla aquí.</p>
                <Link to="/" className="btn btn-primary" style={{ marginTop: 8 }}>Explorar recetas</Link>
              </div>
            )
        }
      </div>
    </div>
  );
}
