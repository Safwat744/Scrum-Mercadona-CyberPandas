const router = require('express').Router();
const auth   = require('../../middleware/auth.middleware');
const ctrl   = require('./lista.controller');

router.use(auth);

// GET  /api/v1/lista                  → lista plana
// GET  /api/v1/lista?agrupada=true    → agrupada por sección (HU-08)
router.get('/',              ctrl.getLista);

// POST /api/v1/lista/items            → añadir receta (suma inteligente) (HU-07)
router.post('/items',        ctrl.addReceta);

// PATCH /api/v1/lista/items/:id       → toggle cogido (HU-08)
router.patch('/items/:id',   ctrl.toggleCogido);

// DELETE /api/v1/lista/items/:id      → eliminar un item (HU-08)
router.delete('/items/:id',  ctrl.deleteItem);

// DELETE /api/v1/lista                → vaciar toda la lista (HU-08)
router.delete('/',           ctrl.vaciarLista);

module.exports = router;
