const pool = require('../../config/database');

// ─────────────────────────────────────────────
// HELPER — obtener o crear la lista del usuario
// ─────────────────────────────────────────────
async function getOrCreateLista(usuarioId, client) {
  const db = client || pool;

  let res = await db.query(
    'SELECT id FROM listas_compra WHERE usuario_id = $1',
    [usuarioId]
  );

  if (res.rows.length === 0) {
    res = await db.query(
      'INSERT INTO listas_compra (usuario_id) VALUES ($1) RETURNING id',
      [usuarioId]
    );
  }

  return res.rows[0].id;
}

// ─────────────────────────────────────────────
// AÑADIR RECETA A LA LISTA (HU-07)
// Suma inteligente: ON CONFLICT (lista_id, producto_id) DO UPDATE
// ─────────────────────────────────────────────
async function addRecetaToLista(usuarioId, recetaId, raciones) {
  // 1. Obtener raciones_base de la receta
  const recetaRes = await pool.query(
    'SELECT raciones_base FROM recetas WHERE id = $1',
    [recetaId]
  );

  if (recetaRes.rows.length === 0) {
    const err = new Error('Receta no encontrada.');
    err.status = 404;
    err.code   = 'RECIPE_NOT_FOUND';
    throw err;
  }

  const racionesBase = recetaRes.rows[0].raciones_base;
  const factor       = raciones / racionesBase;

  // 2. Obtener ingredientes de la receta
  const ingsRes = await pool.query(
    `SELECT ir.producto_id, ir.cantidad_base, ir.unidad
     FROM ingredientes_receta ir
     WHERE ir.receta_id = $1`,
    [recetaId]
  );

  if (ingsRes.rows.length === 0) {
    const err = new Error('Esta receta no tiene ingredientes registrados.');
    err.status = 422;
    err.code   = 'RECIPE_NO_INGREDIENTS';
    throw err;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const listaId = await getOrCreateLista(usuarioId, client);

    // 3. Para cada ingrediente: INSERT o suma (ON CONFLICT)
    for (const ing of ingsRes.rows) {
      const cantidadEscalada = parseFloat((ing.cantidad_base * factor).toFixed(3));

      await client.query(
        `INSERT INTO items_lista (lista_id, producto_id, cantidad_total, unidad)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (lista_id, producto_id)
         DO UPDATE SET
           cantidad_total = items_lista.cantidad_total + EXCLUDED.cantidad_total,
           cogido         = FALSE,
           updated_at     = NOW()`,
        [listaId, ing.producto_id, cantidadEscalada, ing.unidad]
      );
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  return getLista(usuarioId, false);
}

// ─────────────────────────────────────────────
// OBTENER LISTA (HU-07 + HU-08)
// agrupada=true → agrupa por sección de tienda
// ─────────────────────────────────────────────
async function getLista(usuarioId, agrupada = false) {
  const listaRes = await pool.query(
    'SELECT id FROM listas_compra WHERE usuario_id = $1',
    [usuarioId]
  );

  if (listaRes.rows.length === 0) {
    return agrupada ? {} : [];
  }

  const listaId = listaRes.rows[0].id;

  const itemsRes = await pool.query(
    `SELECT
       il.id,
       il.cantidad_total,
       il.unidad,
       il.cogido,
       il.updated_at,
       ph.id           AS producto_id,
       ph.nombre       AS producto_nombre,
       ph.seccion_tienda,
       ph.precio       AS producto_precio,
       ph.cantidad_por_envase,
       -- Precio estimado del item en la lista
       ROUND(
         (il.cantidad_total * ph.precio / ph.cantidad_por_envase)::numeric, 2
       )               AS precio_estimado
     FROM items_lista il
     JOIN productos_hacendado ph ON ph.id = il.producto_id
     WHERE il.lista_id = $1
     ORDER BY il.cogido ASC, ph.seccion_tienda ASC, ph.nombre ASC`,
    [listaId]
  );

  const items = itemsRes.rows;

  if (!agrupada) return items;

  // Agrupar por sección de tienda (HU-08)
  const grupos = {};
  for (const item of items) {
    const seccion = item.seccion_tienda || 'Otros';
    if (!grupos[seccion]) grupos[seccion] = [];
    grupos[seccion].push(item);
  }

  return grupos;
}

// ─────────────────────────────────────────────
// MARCAR / DESMARCAR COGIDO (HU-08)
// ─────────────────────────────────────────────
async function toggleCogido(usuarioId, itemId) {
  // Verificar que el item pertenece a la lista del usuario
  const check = await pool.query(
    `SELECT il.id, il.cogido
     FROM items_lista il
     JOIN listas_compra lc ON lc.id = il.lista_id
     WHERE il.id = $1 AND lc.usuario_id = $2`,
    [itemId, usuarioId]
  );

  if (check.rows.length === 0) {
    const err = new Error('Item no encontrado en tu lista.');
    err.status = 404;
    err.code   = 'ITEM_NOT_FOUND';
    throw err;
  }

  const nuevoCogido = !check.rows[0].cogido;

  await pool.query(
    'UPDATE items_lista SET cogido = $1, updated_at = NOW() WHERE id = $2',
    [nuevoCogido, itemId]
  );

  return { id: itemId, cogido: nuevoCogido };
}

// ─────────────────────────────────────────────
// ELIMINAR ITEM (HU-08)
// ─────────────────────────────────────────────
async function deleteItem(usuarioId, itemId) {
  const result = await pool.query(
    `DELETE FROM items_lista il
     USING listas_compra lc
     WHERE il.lista_id = lc.id
       AND il.id       = $1
       AND lc.usuario_id = $2
     RETURNING il.id`,
    [itemId, usuarioId]
  );

  if (result.rows.length === 0) {
    const err = new Error('Item no encontrado en tu lista.');
    err.status = 404;
    err.code   = 'ITEM_NOT_FOUND';
    throw err;
  }
}

// ─────────────────────────────────────────────
// VACIAR LISTA COMPLETA (HU-08)
// ─────────────────────────────────────────────
async function vaciarLista(usuarioId) {
  const listaRes = await pool.query(
    'SELECT id FROM listas_compra WHERE usuario_id = $1',
    [usuarioId]
  );

  if (listaRes.rows.length === 0) return;

  await pool.query(
    'DELETE FROM items_lista WHERE lista_id = $1',
    [listaRes.rows[0].id]
  );
}

module.exports = { addRecetaToLista, getLista, toggleCogido, deleteItem, vaciarLista };
