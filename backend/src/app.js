const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

// Health check — útil para verificar que el servidor y la BD están operativos
app.get('/api/v1/health', async (req, res) => {
  const pool = require('./config/database');
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

// Los routers de cada módulo se añadirán aquí en los sprints siguientes:
// app.use('/api/v1/auth',      require('./modules/auth/auth.routes'));
// app.use('/api/v1/recetas',   require('./modules/recetas/recetas.routes'));
// app.use('/api/v1/lista',     require('./modules/lista/lista.routes'));
// app.use('/api/v1/favoritos', require('./modules/favoritos/favoritos.routes'));

// Manejador global de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    code:  err.code    || 'INTERNAL_ERROR',
  });
});

module.exports = app;
