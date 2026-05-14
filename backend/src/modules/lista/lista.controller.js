const listaService = require('./lista.service');

async function getLista(req, res, next) {
  try {
    const agrupada = req.query.agrupada === 'true';
    const lista    = await listaService.getLista(req.usuario.id, agrupada);
    res.json(agrupada ? { agrupada: lista } : { items: lista, total: lista.length });
  } catch (err) {
    next(err);
  }
}

async function addReceta(req, res, next) {
  try {
    const { receta_id, raciones = 4 } = req.body;

    if (!receta_id) {
      return res.status(400).json({ error: 'El campo receta_id es obligatorio.', code: 'MISSING_RECETA_ID' });
    }

    const racionesNum = parseInt(raciones, 10);
    if (isNaN(racionesNum) || racionesNum < 1 || racionesNum > 20) {
      return res.status(400).json({ error: 'Las raciones deben ser un número entre 1 y 20.', code: 'INVALID_RACIONES' });
    }

    const lista = await listaService.addRecetaToLista(req.usuario.id, receta_id, racionesNum);
    res.status(201).json({ message: 'Ingredientes añadidos a tu lista.', items: lista, total: lista.length });
  } catch (err) {
    next(err);
  }
}

async function toggleCogido(req, res, next) {
  try {
    const result = await listaService.toggleCogido(req.usuario.id, req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function deleteItem(req, res, next) {
  try {
    await listaService.deleteItem(req.usuario.id, req.params.id);
    res.json({ message: 'Item eliminado de la lista.' });
  } catch (err) {
    next(err);
  }
}

async function vaciarLista(req, res, next) {
  try {
    await listaService.vaciarLista(req.usuario.id);
    res.json({ message: 'Lista vaciada correctamente.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getLista, addReceta, toggleCogido, deleteItem, vaciarLista };
