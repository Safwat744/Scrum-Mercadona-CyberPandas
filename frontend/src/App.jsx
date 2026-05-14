import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { getLista } from './api/lista';

import { Header }       from './components/Header';
import { SecondaryNav } from './components/SecondaryNav';
import { PageSpinner }  from './components/ui/Spinner';

import LoginPage     from './pages/LoginPage';
import RegisterPage  from './pages/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';
import CatalogoPage  from './pages/CatalogoPage';
import RecetaPage    from './pages/RecetaPage';
import ListaPage     from './pages/ListaPage';
import FavoritasPage from './pages/FavoritasPage';

// Ruta protegida
function PrivateRoute({ children }) {
  const { usuario, loading } = useAuth();
  if (loading) return <PageSpinner />;
  if (!usuario) return <Navigate to="/login" replace />;
  if (!usuario.onboarding_done) return <Navigate to="/onboarding" replace />;
  return children;
}

// Layout principal con header
function MainLayout({ children }) {
  const [search,     setSearch]     = useState('');
  const [listaCount, setListaCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    getLista(false)
      .then(d => setListaCount(d.total || 0))
      .catch(() => {});
  }, [location.pathname]);

  return (
    <>
      <Header searchValue={search} onSearchChange={setSearch} listaCount={listaCount} />
      <SecondaryNav />
      <div className="page-wrapper">
        {/* Pasar searchValue a CatalogoPage mediante el árbol */}
        {children({ search })}
      </div>
    </>
  );
}

export default function App() {
  const { loading } = useAuth();
  if (loading) return <PageSpinner />;

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />

      {/* Rutas privadas con layout */}
      <Route path="/*" element={
        <PrivateRoute>
          <MainLayout>
            {({ search }) => (
              <Routes>
                <Route path="/"          element={<CatalogoPage searchValue={search} />} />
                <Route path="/catalogo"  element={<CatalogoPage searchValue={search} />} />
                <Route path="/recetas/:id" element={<RecetaPage />} />
                <Route path="/lista"     element={<ListaPage />} />
                <Route path="/favoritas" element={<FavoritasPage />} />
                <Route path="*"          element={<Navigate to="/" replace />} />
              </Routes>
            )}
          </MainLayout>
        </PrivateRoute>
      } />
    </Routes>
  );
}
