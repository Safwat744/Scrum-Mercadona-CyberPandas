export const TAG_LABELS = {
  VEGANO: 'Vegano',
  VEGETARIANO: 'Vegetariana',
  SIN_GLUTEN: 'Sin gluten',
  SIN_LACTOSA: 'Sin lactosa',
  SIN_HUEVO: 'Sin huevo',
};

export const TAG_OPTIONS = [
  { id: 'VEGANO', label: 'Vegano' },
  { id: 'VEGETARIANO', label: 'Vegetariana' },
  { id: 'SIN_GLUTEN', label: 'Sin gluten' },
  { id: 'SIN_LACTOSA', label: 'Sin lactosa' },
  { id: 'SIN_HUEVO', label: 'Sin huevo' },
];

export const PREFERENCE_OPTIONS = [
  { key: 'VEGANO', label: 'Vegano' },
  { key: 'VEGETARIANO', label: 'Vegetariano' },
  { key: 'SIN_GLUTEN', label: 'Sin gluten' },
  { key: 'SIN_LACTOSA', label: 'Sin lactosa' },
  { key: 'SIN_HUEVO', label: 'Sin huevo' },
];

function toNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const normalized = value.replace(',', '.').trim();
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function getPrimaryTag(tags = []) {
  return tags.find((tag) => TAG_LABELS[tag]) || tags[0] || null;
}

export function getRecipeEyebrow(tags = []) {
  const primaryTag = getPrimaryTag(tags);
  return primaryTag ? TAG_LABELS[primaryTag] || primaryTag : 'Receta Hacendado';
}

export function normalizeCatalogRecipe(recipe) {
  return {
    id: recipe.id,
    title: recipe.nombre,
    description: recipe.descripcion,
    image: recipe.foto_url,
    time: recipe.tiempo_minutos,
    servings: recipe.raciones_base,
    difficulty: recipe.dificultad || null,
    category: recipe.categoria || null,
    calories: recipe.calorias_racion || null,
    author: recipe.autor_origen || null,
    tags: Array.isArray(recipe.tags) ? recipe.tags : [],
    eyebrow: recipe.categoria || getRecipeEyebrow(recipe.tags),
  };
}

export function normalizeFavoriteRecipe(recipe) {
  return normalizeCatalogRecipe(recipe);
}

export function normalizeDetailRecipe(recipe, precio = null) {
  return {
    id: recipe.id,
    title: recipe.nombre,
    description: recipe.descripcion,
    image: recipe.foto_url,
    time: toNumber(recipe.tiempo_minutos),
    servings: toNumber(recipe.raciones_base),
    difficulty: recipe.dificultad || null,
    category: recipe.categoria || null,
    calories: recipe.calorias_racion || null,
    author: recipe.autor_origen || null,
    tags: Array.isArray(recipe.tags) ? recipe.tags : [],
    eyebrow: recipe.categoria || getRecipeEyebrow(recipe.tags),
    priceDisplay: precio?.precio_display || null,
    ingredients: Array.isArray(recipe.ingredientes)
      ? recipe.ingredientes.map((ingredient) => ({
          id: ingredient.id,
          name: ingredient.nombre_display || ingredient.producto_nombre,
          qty: toNumber(ingredient.cantidad_base),
          unit: ingredient.unidad,
          section: ingredient.seccion_tienda,
          hacendado: ingredient.producto_id
            ? {
                id: ingredient.producto_id,
                name: ingredient.producto_nombre,
                brand: ingredient.producto_marca || 'Mercadona',
                price: toNumber(ingredient.producto_precio),
                packageQuantity: toNumber(ingredient.cantidad_por_envase),
                baseUnit: ingredient.producto_unidad_base,
                section: ingredient.seccion_tienda,
                thumbnail: ingredient.producto_thumbnail_url || ingredient.producto_image_url || null,
                image: ingredient.producto_image_url || ingredient.producto_thumbnail_url || null,
                shareUrl: ingredient.producto_share_url || null,
              }
            : null,
        }))
      : [],
    steps: Array.isArray(recipe.pasos)
      ? recipe.pasos.map((step) => ({
          orden: step.orden,
          descripcion: step.descripcion,
        }))
      : [],
  };
}

export function buildMealAssistantPrompt({ text, time, mood, people }) {
  const fragments = [];

  if (people) {
    fragments.push(`Quiero una propuesta para ${people} persona${people === 1 ? '' : 's'}.`);
  }
  if (time) {
    fragments.push(`Tengo aproximadamente ${time} minutos disponibles.`);
  }
  if (mood) {
    fragments.push(`Me apetece una comida ${mood}.`);
  }

  if (text?.trim()) {
    fragments.push(`Contexto adicional del usuario: ${text.trim()}`);
  }

  fragments.push('Devuélveme recetas reales del catálogo que encajen bien y explica por qué.');

  return fragments.join(' ');
}
