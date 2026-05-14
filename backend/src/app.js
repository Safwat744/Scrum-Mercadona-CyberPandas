const express       = require('express');
const cors          = require('cors');
const errorHandler  = require('./middleware/error.middleware');
require('dotenv').config();

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

// ── Health check ───────────────────────────────────────────────
app.get('/api/v1/health', async (req, res) => {
  const pool = require('./config/database');
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

// ── Rutas — Sprint 1 ───────────────────────────────────────────
app.use('/api/v1/auth', require('./modules/auth/auth.routes'));

// Sprint 2:
app.use('/api/v1/recetas', require('./modules/recetas/recetas.routes'));

// Sprint 3:
app.use('/api/v1/lista',     require('./modules/lista/lista.routes'));

// Sprint 4:
app.use('/api/v1/favoritos', require('./modules/favoritos/favoritos.routes'));

// ── Manejador global de errores (siempre al final) ─────────────
app.use(errorHandler);

module.exports = app;
