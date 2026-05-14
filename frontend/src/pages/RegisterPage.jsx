import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/ui/Spinner';

export default function RegisterPage() {
  const { signIn } = useAuth();
  const navigate   = useNavigate();
  const [form, setForm]     = useState({ nombre: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio.';
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email no válido.';
    if (form.password.length < 8) e.password = 'Mínimo 8 caracteres.';
    return e;
  };

  const handle = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const data = await register(form);
      signIn(data);
      navigate('/onboarding');
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al registrarse.';
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  const field = (key) => ({
    value: form[key],
    onChange: e => setForm(p => ({ ...p, [key]: e.target.value })),
    className: `input-field${errors[key] ? ' error' : ''}`,
  });

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-page)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, background: 'var(--green)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <span style={{ fontSize: 28 }}>🍳</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Recetas <span style={{ color: 'var(--green-dark)' }}>Hacendado</span>
          </h1>
        </div>

        <div style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)', padding: 32, boxShadow: 'var(--shadow-card)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Crear cuenta</h2>

          <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="input-group">
              <label className="input-label">Nombre</label>
              <input type="text" placeholder="Tu nombre" {...field('nombre')} />
              {errors.nombre && <span className="input-error">{errors.nombre}</span>}
            </div>

            <div className="input-group">
              <label className="input-label">Email</label>
              <input type="email" placeholder="tu@email.com" {...field('email')} />
              {errors.email && <span className="input-error">{errors.email}</span>}
            </div>

            <div className="input-group">
              <label className="input-label">Contraseña</label>
              <input type="password" placeholder="Mínimo 8 caracteres" {...field('password')} />
              {errors.password && <span className="input-error">{errors.password}</span>}
            </div>

            {errors.general && (
              <div style={{ background: '#FFF5F5', border: '1px solid #FCA5A5', borderRadius: 6, padding: '10px 14px', fontSize: 13, color: '#D93025' }}>
                ⚠️ {errors.general}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full" style={{ height: 46, marginTop: 4 }} disabled={loading}>
              {loading ? <><Spinner /> Creando cuenta...</> : 'Crear cuenta'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" style={{ color: 'var(--green-dark)', fontWeight: 600 }}>Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
