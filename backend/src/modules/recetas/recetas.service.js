const pool = require('../../config/database');

// ─────────────────────────────────────────────
// CATÁLOGO — GET /recetas
// HU-03 (catálogo) + HU-09 (filtros) + HU-11 (búsqueda)
// ─────────────────────────────────────────────
async function getCatalogo({ tags, q, semana }) {
  const conditions = [];
  const params     = [];
  let   idx        = 1;

  // Filtro por semana activa (por defecto la semana en curso)
  if (semana) {
    conditions.push(`r.semana_activa = $${idx++}`);
    params.push(semana);
  }

  // Filtro de búsqueda full-text por nombre e ingredientes (HU-11)
  if (q && q.trim()) {
    conditions.push(`(
      r.nombre ILIKE $${idx}
      OR EXISTS (
        SELECT 1 FROM ingredientes_receta ir
        JOIN productos_hacendado ph ON ph.id = ir.producto_id
        WHERE ir.receta_id = r.id AND ph.nombre ILIKE $${idx}
      )
    )`);
    params.push(`%${q.trim()}%`);
    idx++;
  }

  // Filtro por tags dietéticos (HU-09) — la receta debe tener TODOS los tags pedidos
  const tagList = tags ? tags.split(',').map((t) => t.trim().toUpperCase()).filter(Boolean) : [];
  if (tagList.length > 0) {
    for (const tag of tagList) {
      conditions.push(`EXISTS (
        SELECT 1 FROM recetas_tags rt WHERE rt.receta_id = r.id AND rt.tag = $${idx++}
      )`);
      params.push(tag);
    }
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const sql = `
    SELECT
      r.id,
      r.nombre,
      r.descripcion,
      r.foto_url,
      r.tiempo_minutos,
      r.raciones_base,
      r.semana_activa,
      COALESCE(
        json_agg(DISTINCT rt.tag) FILTER (WHERE rt.tag IS NOT NULL),
        '[]'
      ) AS tags
    FROM recetas r
    LEFT JOIN recetas_tags rt ON rt.receta_id = r.id
    ${whereClause}
    GROUP BY r.id
    ORDER BY r.semana_activa DESC, r.nombre ASC
  `;

  const result = await pool.query(sql, params);
  return result.rows;
}

// ─────────────────────────────────────────────
// FICHA COMPLETA — GET /recetas/:id
// HU-04 (ingredientes + pasos)
// ─────────────────────────────────────────────
async function getRecetaById(id) {
  // 1. Datos base + tags
  const recetaRes = await pool.query(
    `SELECT
       r.id, r.nombre, r.descripcion, r.foto_url,
       r.tiempo_minutos, r.raciones_base, r.semana_activa,
       COALESCE(
         json_agg(DISTINCT rt.tag) FILTER (WHERE rt.tag IS NOT NULL),
         '[]'
       ) AS tags
     FROM recetas r
     LEFT JOIN recetas_tags rt ON rt.receta_id = r.id
     WHERE r.id = $1
     GROUP BY r.id`,
    [id]
  );

  if (recetaRes.rows.length === 0) {
    const err = new Error('Receta no encontrada.');
    err.status = 404;
    err.code   = 'RECIPE_NOT_FOUND';
    throw err;
  }

  const receta = recetaRes.rows[0];

  // 2. Ingredientes con datos del producto (para precio y nombre)
  const ingsRes = await pool.query(
    `SELECT
       ir.id,
       ir.cantidad_base,
       ir.unidad,
       ir.nombre_display,
       ph.id           AS producto_id,
       ph.nombre       AS producto_nombre,
       ph.precio       AS producto_precio,
       ph.cantidad_por_envase,
       ph.unidad_base  AS producto_unidad_base,
       ph.seccion_tienda
     FROM ingredientes_receta ir
     JOIN productos_hacendado ph ON ph.id = ir.producto_id
     WHERE ir.receta_id = $1
     ORDER BY ir.nombre_display ASC`,
    [id]
  );

  // 3. Pasos ordenados
  const pasosRes = await pool.query(
    `SELECT orden, descripcion
     FROM pasos_receta
     WHERE receta_id = $1
     ORDER BY orden ASC`,
    [id]
  );

  return {
    ...receta,
    ingredientes: ingsRes.rows,
    pasos:        pasosRes.rows,
  };
}

// ─────────────────────────────────────────────
// PRECIO ESTIMADO — GET /recetas/:id/precio
// HU-05 — coste proporcional según raciones
// ─────────────────────────────────────────────
async function getPrecio(id, raciones) {
  const recetaRes = await pool.query(
    'SELECT raciones_base FROM recetas WHERE id = $1',
    [id]
  );

  if (recetaRes.rows.length === 0) {
    const err = new Error('Receta no encontrada.');
    err.status = 404;
    err.code   = 'RECIPE_NOT_FOUND';
    throw err;
  }

  const racionesBase = recetaRes.rows[0].raciones_base;
  const factor       = raciones / racionesBase;

  const ingsRes = await pool.query(
    `SELECT ir.cantidad_base, ph.precio, ph.cantidad_por_envase
     FROM ingredientes_receta ir
     JOIN productos_hacendado ph ON ph.id = ir.producto_id
     WHERE ir.receta_id = $1`,
    [id]
  );

  // precio_por_unidad_base = precio_envase / cantidad_por_envase
  // coste_ingrediente      = cantidad_escalada × precio_por_unidad_base
  let total = 0;
  for (const ing of ingsRes.rows) {
    const cantidadEscalada    = ing.cantidad_base * factor;
    const precioPorUnidadBase = ing.precio / ing.cantidad_por_envase;
    total += cantidadEscalada * precioPorUnidadBase;
  }

  return {
    receta_id:    id,
    raciones:     raciones,
    raciones_base: racionesBase,
    precio_total: parseFloat(total.toFixed(2)),
    precio_display: `~${total.toFixed(2).replace('.', ',')} €`,
  };
}

module.exports = { getCatalogo, getRecetaById, getPrecio };
