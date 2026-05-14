/**
 * Runner de seeds
 * Inserta los datos iniciales en la base de datos.
 * Uso: node src/database/seeds/run-seeds.js
 *
 * Es idempotente: usa INSERT ... ON CONFLICT DO NOTHING
 * para que pueda ejecutarse varias veces sin duplicar datos.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../..', '.env') });

const pool      = require('../../config/database');
const productos = require('./01_productos.seed');
const recetas   = require('./02_recetas.seed');

async function seedProductos(client) {
  console.log('\n📦 Insertando productos Hacendado...');
  let insertados = 0;

  for (const p of productos) {
    const res = await client.query(
      `INSERT INTO productos_hacendado
         (nombre, categoria, seccion_tienda, precio, unidad_venta, cantidad_por_envase, unidad_base)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT DO NOTHING
       RETURNING id`,
      [p.nombre, p.categoria, p.seccion_tienda, p.precio, p.unidad_venta, p.cantidad_por_envase, p.unidad_base]
    );
    if (res.rows.length > 0) insertados++;
  }

  console.log(`   ✅ ${insertados} productos insertados (${productos.length - insertados} ya existían)`);
}

async function seedRecetas(client) {
  console.log('\n🍳 Insertando recetas...');
  let insertadas = 0;

  for (const r of recetas) {
    // 1. Insertar receta principal
    const recetaRes = await client.query(
      `INSERT INTO recetas (nombre, descripcion, foto_url, tiempo_minutos, raciones_base, semana_activa)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT DO NOTHING
       RETURNING id`,
      [r.nombre, r.descripcion, r.foto_url || null, r.tiempo_minutos, r.raciones_base, r.semana_activa]
    );

    if (recetaRes.rows.length === 0) {
      // Ya existía, obtener el id
      const existing = await client.query('SELECT id FROM recetas WHERE nombre = $1', [r.nombre]);
      if (existing.rows.length === 0) continue;
      var recetaId = existing.rows[0].id;
    } else {
      var recetaId = recetaRes.rows[0].id;
      insertadas++;
    }

    // 2. Insertar tags
    for (const tag of r.tags) {
      await client.query(
        `INSERT INTO recetas_tags (receta_id, tag) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [recetaId, tag]
      );
    }

    // 3. Insertar pasos
    for (let i = 0; i < r.pasos.length; i++) {
      await client.query(
        `INSERT INTO pasos_receta (receta_id, orden, descripcion) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
        [recetaId, i + 1, r.pasos[i]]
      );
    }

    // 4. Insertar ingredientes (mapeando por nombre de producto)
    for (const ing of r.ingredientes) {
      const productoRes = await client.query(
        'SELECT id FROM productos_hacendado WHERE nombre = $1',
        [ing.producto]
      );

      if (productoRes.rows.length === 0) {
        console.warn(`   ⚠️  Producto no encontrado: "${ing.producto}" (receta: ${r.nombre})`);
        continue;
      }

      const productoId = productoRes.rows[0].id;
      await client.query(
        `INSERT INTO ingredientes_receta
           (receta_id, producto_id, cantidad_base, unidad, nombre_display)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT DO NOTHING`,
        [recetaId, productoId, ing.cantidad_base, ing.unidad, ing.nombre_display]
      );
    }
  }

  console.log(`   ✅ ${insertadas} recetas insertadas (${recetas.length - insertadas} ya existían)`);
}

async function runSeeds() {
  const client = await pool.connect();

  try {
    console.log('🌱 Iniciando proceso de seed...');

    await client.query('BEGIN');
    await seedProductos(client);
    await seedRecetas(client);
    await client.query('COMMIT');

    console.log('\n🎉 Seed completado con éxito.');
    console.log(`   • ${productos.length} productos Hacendado disponibles`);
    console.log(`   • ${recetas.length} recetas con ingredientes y pasos`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n❌ Error durante el seed:', err.message);
    console.error('   Detalle:', err.detail || '');
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runSeeds();
