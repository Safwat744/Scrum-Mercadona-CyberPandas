require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const axios = require('axios');
const cheerio = require('cheerio');
const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const TEXT_MODEL = process.env.GROQ_TEXT_MODEL || 'llama-3.3-70b-versatile';
const pool = require('../config/database');
const limitArg = process.argv.find((arg) => arg.startsWith('--limit='));
const limitValue = limitArg ? Number(limitArg.split('=')[1]) : Number(process.env.HOGARMANIA_LIMIT || 0);
const maxRecipes = Number.isFinite(limitValue) && limitValue > 0 ? limitValue : null;
const STRICT_VALIDATION = process.env.HOGARMANIA_STRICT !== 'false';

const ALLOWED_DIFFICULTY = new Set(['Fácil', 'Media', 'Difícil']);
const ALLOWED_CATEGORY = new Set(['Principal', 'Entrante', 'Postre', 'Desayuno/Merienda', 'Salsa/Acompañamiento']);
const ALLOWED_UNITS = new Set(['uds', 'g', 'kg', 'ml', 'l', 'cda', 'cdta']);
const STOPWORDS = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'y', 'a', 'al', 'con', 'sin', 'en', 'para', 'por', 'un', 'una', 'unos', 'unas']);
const BAD_WORDS = ['refresco', 'cerveza', 'postre', 'tarta', 'helado', 'golosina', 'dulce', 'snack', 'pizza', 'hamburguesa', 'bocadillo', 'lasaña', 'salsa preparada'];
const UNIT_MAP = new Map([
  ['ud', 'uds'],
  ['uds', 'uds'],
  ['unidad', 'uds'],
  ['unidades', 'uds'],
  ['gramo', 'g'],
  ['gramos', 'g'],
  ['kg', 'kg'],
  ['kilogramo', 'kg'],
  ['kilogramos', 'kg'],
  ['ml', 'ml'],
  ['mililitro', 'ml'],
  ['mililitros', 'ml'],
  ['l', 'l'],
  ['litro', 'l'],
  ['litros', 'l'],
  ['cda', 'cda'],
  ['cucharada', 'cda'],
  ['cucharadas', 'cda'],
  ['cdta', 'cdta'],
  ['cucharadita', 'cdta'],
  ['cucharaditas', 'cdta'],
]);
const VOLUME_UNITS = new Map([
  ['vaso', { unit: 'ml', factor: 250 }],
  ['vasos', { unit: 'ml', factor: 250 }],
  ['taza', { unit: 'ml', factor: 240 }],
  ['tazas', { unit: 'ml', factor: 240 }],
  ['copa', { unit: 'ml', factor: 150 }],
  ['copas', { unit: 'ml', factor: 150 }],
]);
const COUNT_UNITS = new Set([
  'diente', 'dientes', 'ramita', 'ramitas', 'hoja', 'hojas', 'lata', 'latas',
  'bote', 'botes', 'sobre', 'sobres', 'filete', 'filetes', 'loncha', 'lonchas',
  'rebanada', 'rebanadas', 'rodaja', 'rodajas', 'trozo', 'trozos', 'pizca', 'pizcas',
]);

function normalizeText(value) {
  if (!value) return '';
  return value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(value) {
  const normalized = normalizeText(value);
  if (!normalized) return [];
  return normalized
    .split(' ')
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && !STOPWORDS.has(token));
}

function normalizeUnit(value) {
  if (!value) return null;
  const key = normalizeText(value);
  return UNIT_MAP.get(key) || null;
}

function normalizeQuantityAndUnit(quantity, unitRaw) {
  const unitKey = normalizeText(unitRaw);
  if (!unitKey) return null;
  if (UNIT_MAP.has(unitKey)) {
    return { cantidad_base: quantity, unidad: UNIT_MAP.get(unitKey) };
  }
  if (VOLUME_UNITS.has(unitKey)) {
    const conversion = VOLUME_UNITS.get(unitKey);
    return { cantidad_base: quantity * conversion.factor, unidad: conversion.unit };
  }
  if (COUNT_UNITS.has(unitKey)) {
    return { cantidad_base: quantity, unidad: 'uds' };
  }
  return null;
}

function ensureNumber(value, field) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`Campo numerico invalido: ${field}`);
  return parsed;
}

function ensureString(value, field) {
  if (typeof value !== 'string') throw new Error(`Campo texto invalido: ${field}`);
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`Campo texto vacio: ${field}`);
  return trimmed;
}

function deriveSearchName(nombreDisplay) {
  const normalized = normalizeText(nombreDisplay);
  if (!normalized) return '';
  const tokens = normalized.split(' ').filter((token) => token && !STOPWORDS.has(token));
  return tokens.slice(0, 3).join(' ');
}

function validateRecipePayload(payload, rawRecipe) {
  if (!payload || typeof payload !== 'object') throw new Error('Respuesta IA invalida: no es objeto');

  const nombre = ensureString(payload.nombre || payload.name, 'nombre');
  const descripcion = typeof payload.descripcion === 'string' && payload.descripcion.trim()
    ? payload.descripcion.trim()
    : (rawRecipe?.description || nombre);

  const tiempoMinutos = ensureNumber(payload.tiempo_minutos, 'tiempo_minutos');
  const racionesBase = ensureNumber(payload.raciones_base, 'raciones_base');
  if (tiempoMinutos < 1 || tiempoMinutos > 480) throw new Error('tiempo_minutos fuera de rango');
  if (racionesBase < 1 || racionesBase > 12) throw new Error('raciones_base fuera de rango');

  const dificultad = ensureString(payload.dificultad, 'dificultad');
  if (!ALLOWED_DIFFICULTY.has(dificultad)) throw new Error('dificultad no permitida');

  const categoria = ensureString(payload.categoria, 'categoria');
  if (!ALLOWED_CATEGORY.has(categoria)) throw new Error('categoria no permitida');

  let calorias = null;
  if (payload.calorias_racion !== null && payload.calorias_racion !== undefined) {
    calorias = ensureNumber(payload.calorias_racion, 'calorias_racion');
    if (calorias < 1 || calorias > 2000) throw new Error('calorias_racion fuera de rango');
  }

  const autor = (typeof payload.autor_origen === 'string' && payload.autor_origen.trim())
    ? payload.autor_origen.trim()
    : (rawRecipe?.autor || 'Mercadona');

  const pasos = Array.isArray(payload.pasos)
    ? payload.pasos.map((step) => (typeof step === 'string' ? step.trim() : '')).filter((step) => step.length > 5)
    : [];
  if (pasos.length < 3) throw new Error('pasos insuficientes');

  const ingredientes = Array.isArray(payload.ingredientes) ? payload.ingredientes : [];
  if (ingredientes.length < 3) throw new Error('ingredientes insuficientes');

  const sanitizedIngredients = ingredientes.map((ing, idx) => {
    if (!ing || typeof ing !== 'object') throw new Error(`Ingrediente invalido en posicion ${idx}`);
    const nombreDisplay = ensureString(ing.nombre_display || ing.nombre, 'ingrediente.nombre_display');
    const cantidadBase = ensureNumber(ing.cantidad_base, 'ingrediente.cantidad_base');
    if (cantidadBase <= 0) throw new Error('ingrediente.cantidad_base <= 0');
    const normalized = normalizeQuantityAndUnit(cantidadBase, ing.unidad);
    if (!normalized || !ALLOWED_UNITS.has(normalized.unidad)) throw new Error('ingrediente.unidad no permitida');
    const nombreBusqueda = (typeof ing.nombre_busqueda === 'string' && ing.nombre_busqueda.trim())
      ? ing.nombre_busqueda.trim()
      : deriveSearchName(nombreDisplay);
    if (!nombreBusqueda) throw new Error('ingrediente.nombre_busqueda vacio');
    return {
      nombre_display: nombreDisplay,
      cantidad_base: normalized.cantidad_base,
      unidad: normalized.unidad,
      nombre_busqueda: nombreBusqueda,
    };
  });

  const tags = Array.isArray(payload.tags)
    ? [...new Set(payload.tags.map((tag) => String(tag || '').trim().toUpperCase()).filter(Boolean))]
    : [];

  return {
    nombre,
    descripcion,
    foto_url: typeof payload.foto_url === 'string' && payload.foto_url.trim() ? payload.foto_url.trim() : null,
    tiempo_minutos: tiempoMinutos,
    raciones_base: racionesBase,
    dificultad,
    categoria,
    calorias_racion: calorias,
    autor_origen: autor,
    tags,
    pasos,
    ingredientes: sanitizedIngredients,
  };
}

async function findProductoId(client, ingredient) {
  const searchName = ingredient.nombre_busqueda || ingredient.nombre_display;
  const exact = await client.query(
    'SELECT id, nombre FROM productos_hacendado WHERE lower(nombre) = lower($1) LIMIT 1',
    [searchName]
  );
  if (exact.rows.length > 0) return exact.rows[0].id;

  const tokens = tokenize(searchName);
  if (tokens.length === 0) return null;
  const queryTokens = tokens.slice(0, 3);
  const patterns = queryTokens.map((token) => `%${token}%`);
  const where = patterns.map((_, idx) => `nombre ILIKE $${idx + 1}`).join(' OR ');
  const candidates = await client.query(
    `SELECT id, nombre, marca, seccion_tienda, categoria_mercadona
     FROM productos_hacendado
     WHERE activo IS DISTINCT FROM FALSE AND (${where})
     LIMIT 80`,
    patterns
  );
  if (candidates.rows.length === 0) return null;

  const ingredientTokens = tokens;
  let best = null;
  for (const candidate of candidates.rows) {
    const candidateName = candidate.nombre || '';
    const normalizedCandidate = normalizeText(candidateName);
    const candidateTokens = tokenize(candidateName);
    let score = 0;
    for (const token of ingredientTokens) {
      if (candidateTokens.includes(token)) score += 3;
      else if (normalizedCandidate.includes(token)) score += 2;
    }
    if (normalizedCandidate.includes(normalizeText(searchName))) score += 4;
    if (ingredientTokens[0] && normalizedCandidate.startsWith(ingredientTokens[0])) score += 2;
    for (const bad of BAD_WORDS) {
      if (normalizedCandidate.includes(bad) && !ingredientTokens.includes(bad)) score -= 4;
    }
    if (ingredientTokens.includes('aceite') && normalizedCandidate.includes('aceite')) score += 3;
    if (ingredientTokens.includes('oliva') && normalizedCandidate.includes('oliva')) score += 2;
    if (ingredientTokens.includes('agua') && normalizedCandidate.includes('agua')) score += 2;
    if (ingredientTokens.includes('sal') && normalizedCandidate.includes('sal')) score += 2;

    if (!best || score > best.score) best = { id: candidate.id, score };
  }

  if (!best || best.score < 4) return null;
  return best.id;
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─────────────────────────────────────────────
// 1. EXTRAER LISTA DE URLS DE RECETAS
// ─────────────────────────────────────────────
async function scrapeHogarmaniaListing(page = 1) {
  const url = page === 1 
    ? 'https://www.hogarmania.com/cocina/recetas/' 
    : `https://www.hogarmania.com/cocina/recetas/page-${page}.html`;
  
  console.log(`\n🔍 Scrapeando listado: ${url}`);
  try {
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
    });
    const $ = cheerio.load(data);
    
    const urls = [];
    $('a').each((_, el) => {
      let href = $(el).attr('href');
      if (href && href.includes('/cocina/recetas/') && href.endsWith('.html')) {
        if (href.startsWith('/')) href = 'https://www.hogarmania.com' + href;
        if (!urls.includes(href)) urls.push(href);
      }
    });
    
    return urls;
  } catch (err) {
    console.error(`❌ Error al extraer el listado: ${err.message}`);
    return [];
  }
}

// ─────────────────────────────────────────────
// 2. EXTRAER DATOS CRUDOS DE UNA RECETA
// ─────────────────────────────────────────────
async function scrapeRecipePage(url) {
  console.log(`\n🍲 Extrayendo receta: ${url}`);
  try {
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36' }
    });
    const $ = cheerio.load(data);
    
    const title = $('h1').first().text().trim();
    const description = $('.intro p').first().text().trim() || title;
    
    let imageUrl = $('.article-image img').attr('src') || $('.main-image img').attr('src');
    if (imageUrl && imageUrl.startsWith('/')) imageUrl = 'https://www.hogarmania.com' + imageUrl;

    // Extraer meta-datos
    let raciones = 4;
    let tiempo = 30;
    
    // Extraer ingredientes
    const ingredientesRaw = [];
    $('.recipe-ingredients li, .ingredients li').each((_, el) => {
      const text = $(el).text().replace(/·/g, '').replace(/\s+/g, ' ').trim();
      if (text) ingredientesRaw.push(text);
    });
    
    // Extraer pasos
    const pasosRaw = [];
    $('.recipe-elaboration-step, .recipe-steps li, .pasos li, .elaboracion p, .step-text').each((_, el) => {
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      if (text && text.length > 5) pasosRaw.push(text);
    });

    const autor = $('.author-name').text().trim() || 'Karlos Arguiñano (Hogarmania)';
    
    if (!title || ingredientesRaw.length === 0) {
      throw new Error("No parece una receta válida o el formato ha cambiado.");
    }

    return { title, description, imageUrl, ingredientesRaw, pasosRaw, autor, rawHtml: $.html() };
  } catch (err) {
    console.error(`❌ Error en receta ${url}: ${err.message}`);
    return null;
  }
}

// ─────────────────────────────────────────────
// 3. IA TRADUCCIÓN A NUESTRO FORMATO
// ─────────────────────────────────────────────
async function translateRecipe(rawRecipe) {
  console.log(`🧠 Traducción con IA de: ${rawRecipe.title}`);
  
  const systemPrompt = `Eres un experto culinario e ingeniero de datos para 'Recetas Hacendado'.
Tu misión es transformar una receta scrapeada en nuestro modelo de base de datos exacto y estricto.

REGLAS ESTRICTAS:
1. 'dificultad' DEBE SER: "Fácil", "Media", o "Difícil".
2. 'categoria' DEBE SER una de: "Principal", "Entrante", "Postre", "Desayuno/Merienda", "Salsa/Acompañamiento".
3. 'tiempo_minutos' DEBE SER numérico. Estima un tiempo realista si no es evidente.
4. 'raciones_base' DEBE SER numérico (generalmente entre 2 y 6).
5. INGREDIENTES: Traduce el ingrediente crudo a un formato limpio. En "nombre_busqueda" pon el nombre genérico del producto (ej. "cebolla", "aceite de oliva") sin marcas ni preparados.
6. 'cantidad_base' debe ser numérico. Usa sistema métrico decimal.
7. 'unidad' DEBE SER UNA DE: uds, g, kg, ml, l, cdta, cda.

Responde SOLO en JSON válido:
{
  "nombre": "string",
  "descripcion": "string (breve, atractivo)",
  "foto_url": "string o null",
  "tiempo_minutos": number,
  "raciones_base": number,
  "dificultad": "string",
  "categoria": "string",
  "calorias_racion": number (o null si es imposible estimar),
  "autor_origen": "string",
  "tags": ["VEGANO", "SIN_GLUTEN"], 
  "pasos": [
    "Paso 1 limpio y claro",
    "Paso 2 limpio y claro"
  ],
  "ingredientes": [
    {
      "nombre_display": "Nombre natural (ej. 2 cebollas dulces)",
      "cantidad_base": number,
      "unidad": "string (uds, g, ml, cdta, cda)",
      "nombre_busqueda": "string (para buscar en bbdd)"
    }
  ]
}`;

  const userPrompt = `
RECETA ORIGINAL:
Título: ${rawRecipe.title}
Descripción: ${rawRecipe.description}
Autor: ${rawRecipe.autor}
Foto: ${rawRecipe.imageUrl}
Ingredientes:
${rawRecipe.ingredientesRaw.join('\n')}
Pasos:
${rawRecipe.pasosRaw.join('\n')}
`;

  try {
    const response = await groq.chat.completions.create({
      model: TEXT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    const payload = JSON.parse(response.choices[0].message.content);
    return validateRecipePayload(payload, rawRecipe);
  } catch (error) {
    console.error(`❌ Error en IA/validacion:`, error?.error?.message || error.message);
    return null;
  }
}

// ─────────────────────────────────────────────
// 4. GUARDAR EN BASE DE DATOS
// ─────────────────────────────────────────────
async function saveRecipe(recipe) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insertar Receta
    const res = await client.query(
      `INSERT INTO recetas (nombre, descripcion, foto_url, tiempo_minutos, raciones_base, dificultad, categoria, calorias_racion, autor_origen, semana_activa)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_DATE)
       ON CONFLICT (nombre) DO UPDATE SET 
         descripcion = EXCLUDED.descripcion,
         foto_url = EXCLUDED.foto_url
       RETURNING id`,
      [recipe.nombre, recipe.descripcion, recipe.foto_url || null, recipe.tiempo_minutos, recipe.raciones_base, recipe.dificultad, recipe.categoria, recipe.calorias_racion || null, recipe.autor_origen]
    );
    const recetaId = res.rows[0].id;

    // Tags
    if (Array.isArray(recipe.tags)) {
      for (const tag of recipe.tags) {
        await client.query(
          `INSERT INTO recetas_tags (receta_id, tag) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [recetaId, tag.toUpperCase()]
        );
      }
    }

    // Pasos
    await client.query(`DELETE FROM pasos_receta WHERE receta_id = $1`, [recetaId]);
    for (let i = 0; i < recipe.pasos.length; i++) {
      await client.query(
        `INSERT INTO pasos_receta (receta_id, orden, descripcion) VALUES ($1, $2, $3)`,
        [recetaId, i + 1, recipe.pasos[i]]
      );
    }

    // Ingredientes
    await client.query(`DELETE FROM ingredientes_receta WHERE receta_id = $1`, [recetaId]);
    for (const ing of recipe.ingredientes) {
      const productoId = await findProductoId(client, ing);
      if (!productoId) {
        throw new Error(`No se encontro producto para ingrediente: ${ing.nombre_display}`);
      }
      
      await client.query(
        `INSERT INTO ingredientes_receta (receta_id, producto_id, cantidad_base, unidad, nombre_display)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT DO NOTHING`,
        [recetaId, productoId, ing.cantidad_base || 1, ing.unidad || 'uds', ing.nombre_display]
      );
    }

    await client.query('COMMIT');
    console.log(`   ✅ Guardada en BD: ${recipe.nombre}`);
    return true;
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`   ❌ Error BD guardando ${recipe.nombre}:`, err.message);
    return false;
  } finally {
    client.release();
  }
}

// ─────────────────────────────────────────────
// PROCESO PRINCIPAL
// ─────────────────────────────────────────────
async function main() {
  console.log("🚀 Iniciando Scraping de Hogarmania...");
  if (maxRecipes) {
    console.log(`🔒 Límite activo: ${maxRecipes} receta${maxRecipes === 1 ? '' : 's'}.`);
  }

  const urls = await scrapeHogarmaniaListing(1);
  console.log(`Encontradas ${urls.length} recetas en la primera página.`);

  // Vamos a procesar secuencialmente para no saturar Rate Limits de Groq
  let savedCount = 0;
  for (const url of urls) {
    if (maxRecipes && savedCount >= maxRecipes) break;
    const rawRecipe = await scrapeRecipePage(url);
    if (!rawRecipe) continue;

    const translatedRecipe = await translateRecipe(rawRecipe);
    if (!translatedRecipe) {
      await delay(2000);
      continue;
    }

    // Fix image fallback si la IA lo pierde
    if (!translatedRecipe.foto_url && rawRecipe.imageUrl) {
      translatedRecipe.foto_url = rawRecipe.imageUrl;
    }

    const saved = await saveRecipe(translatedRecipe);
    if (saved) savedCount += 1;
    
    // Pausa para evitar rate-limits de la API de Groq y de Hogarmania
    console.log("   ⏳ Esperando 3 segundos...");
    await delay(3000);
  }

  console.log("\n🎉 Scraping completado.");
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
