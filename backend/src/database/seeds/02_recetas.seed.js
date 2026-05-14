// Seed de recetas con ingredientes mapeados a productos Hacendado reales
// Los nombres de producto en 'ingredientes' deben coincidir EXACTAMENTE
// con el campo 'nombre' del seed de productos.

const recetas = [
  // ─────────────────────────────────────────────────────────
  // 1. TORTILLA DE PATATAS
  // ─────────────────────────────────────────────────────────
  {
    nombre: 'Tortilla de patatas',
    descripcion: 'El plato más icónico de la cocina española. Tierna por dentro, doradita por fuera, con o sin cebolla.',
    foto_url: null,
    tiempo_minutos: 40,
    raciones_base: 4,
    semana_activa: '2026-05-12',
    tags: [],
    ingredientes: [
      { producto: 'Patatas Hacendado',                cantidad_base: 600,  unidad: 'g',  nombre_display: 'Patatas' },
      { producto: 'Huevos Hacendado M',               cantidad_base: 5,    unidad: 'ud', nombre_display: 'Huevos' },
      { producto: 'Cebolla Hacendado',                cantidad_base: 150,  unidad: 'g',  nombre_display: 'Cebolla' },
      { producto: 'Aceite de oliva virgen extra Hacendado', cantidad_base: 150, unidad: 'ml', nombre_display: 'Aceite de oliva' },
      { producto: 'Sal marina Hacendado',             cantidad_base: 5,    unidad: 'g',  nombre_display: 'Sal' },
    ],
    pasos: [
      'Pela las patatas y córtalas en láminas finas (2-3mm). Corta la cebolla en juliana.',
      'Calienta el aceite en una sartén a fuego medio. Añade las patatas y la cebolla con sal. Fríe a fuego lento durante 20 minutos, dando vueltas, hasta que estén tiernas pero no doradas.',
      'Escurre bien el aceite de las patatas y la cebolla. Reserva el aceite.',
      'Bate los huevos con una pizca de sal en un bol grande. Añade las patatas y la cebolla. Mezcla bien y deja reposar 5 minutos.',
      'Calienta una cucharada del aceite reservado en la sartén limpia a fuego medio-alto. Vierte la mezcla y cuaja 2-3 minutos hasta que los bordes estén firmes.',
      'Cubre con un plato llano y dale la vuelta con un movimiento rápido y seguro. Desliza la tortilla de nuevo a la sartén y cuaja 2 minutos más. Sirve caliente o templada.',
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 2. ESPAGUETIS A LA BOLOÑESA
  // ─────────────────────────────────────────────────────────
  {
    nombre: 'Espaguetis a la boloñesa',
    descripcion: 'Salsa de carne rica y sabrosa, cocinada a fuego lento para concentrar todo el sabor. Un clásico que nunca falla.',
    foto_url: null,
    tiempo_minutos: 50,
    raciones_base: 4,
    semana_activa: '2026-05-12',
    tags: [],
    ingredientes: [
      { producto: 'Espaguetis Hacendado',             cantidad_base: 400,  unidad: 'g',  nombre_display: 'Espaguetis' },
      { producto: 'Carne picada mixta Hacendado',     cantidad_base: 500,  unidad: 'g',  nombre_display: 'Carne picada' },
      { producto: 'Tomate triturado Hacendado',       cantidad_base: 400,  unidad: 'g',  nombre_display: 'Tomate triturado' },
      { producto: 'Cebolla Hacendado',                cantidad_base: 100,  unidad: 'g',  nombre_display: 'Cebolla' },
      { producto: 'Aceite de oliva virgen extra Hacendado', cantidad_base: 30, unidad: 'ml', nombre_display: 'Aceite' },
      { producto: 'Ajo en polvo Hacendado',           cantidad_base: 3,    unidad: 'g',  nombre_display: 'Ajo en polvo' },
      { producto: 'Orégano Hacendado',                cantidad_base: 2,    unidad: 'g',  nombre_display: 'Orégano' },
      { producto: 'Sal marina Hacendado',             cantidad_base: 5,    unidad: 'g',  nombre_display: 'Sal' },
      { producto: 'Queso rallado Hacendado',          cantidad_base: 50,   unidad: 'g',  nombre_display: 'Queso rallado' },
    ],
    pasos: [
      'Pica la cebolla finamente. Calienta el aceite en una sartén grande a fuego medio y sofríe la cebolla 5 minutos hasta que esté transparente.',
      'Añade la carne picada. Cocina a fuego medio-alto, removiendo para desmenuzarla, hasta que cambie de color (unos 8 minutos).',
      'Incorpora el tomate triturado, el ajo en polvo y el orégano. Mezcla bien. Baja el fuego y deja cocer tapado 25-30 minutos, removiendo ocasionalmente.',
      'Mientras la salsa reduce, cuece los espaguetis en abundante agua con sal siguiendo las instrucciones del paquete (normalmente 8-10 min). Escúrrelos al dente.',
      'Sirve los espaguetis con la salsa boloñesa por encima. Espolvorea queso rallado al gusto.',
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 3. ARROZ CON POLLO
  // ─────────────────────────────────────────────────────────
  {
    nombre: 'Arroz con pollo al pimentón',
    descripcion: 'Un guiso reconfortante de toda la vida. El arroz absorbe todos los jugos del pollo y el pimentón, quedando lleno de sabor.',
    foto_url: null,
    tiempo_minutos: 55,
    raciones_base: 4,
    semana_activa: '2026-05-12',
    tags: [],
    ingredientes: [
      { producto: 'Arroz redondo Hacendado',          cantidad_base: 320,  unidad: 'g',  nombre_display: 'Arroz' },
      { producto: 'Muslos de pollo Hacendado',        cantidad_base: 800,  unidad: 'g',  nombre_display: 'Muslos de pollo' },
      { producto: 'Pimiento rojo Hacendado',          cantidad_base: 150,  unidad: 'g',  nombre_display: 'Pimiento rojo' },
      { producto: 'Cebolla Hacendado',                cantidad_base: 100,  unidad: 'g',  nombre_display: 'Cebolla' },
      { producto: 'Tomate triturado Hacendado',       cantidad_base: 200,  unidad: 'g',  nombre_display: 'Tomate triturado' },
      { producto: 'Caldo de pollo Hacendado',         cantidad_base: 800,  unidad: 'ml', nombre_display: 'Caldo de pollo' },
      { producto: 'Pimentón dulce Hacendado',         cantidad_base: 5,    unidad: 'g',  nombre_display: 'Pimentón dulce' },
      { producto: 'Aceite de oliva virgen extra Hacendado', cantidad_base: 40, unidad: 'ml', nombre_display: 'Aceite' },
      { producto: 'Sal marina Hacendado',             cantidad_base: 5,    unidad: 'g',  nombre_display: 'Sal' },
    ],
    pasos: [
      'Salpimienta los muslos de pollo. En una cazuela grande, calienta el aceite a fuego alto y dora los muslos por todos lados (5-6 min). Retíralos y reserva.',
      'En el mismo aceite, sofríe la cebolla y el pimiento rojo picados durante 8 minutos a fuego medio.',
      'Añade el pimentón dulce y remueve 30 segundos. Incorpora el tomate triturado y cocina 5 minutos más.',
      'Vuelve a poner el pollo en la cazuela. Vierte el caldo caliente y ajusta de sal. Lleva a ebullición, tapa y cocina 20 minutos a fuego lento.',
      'Añade el arroz, mezcla bien y cocina destapado a fuego medio 18-20 minutos, hasta que el arroz esté en su punto y haya absorbido el caldo.',
      'Deja reposar 5 minutos tapado antes de servir.',
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 4. LENTEJAS ESTOFADAS (VEGANA)
  // ─────────────────────────────────────────────────────────
  {
    nombre: 'Lentejas estofadas con verduras',
    descripcion: 'Un plato de cuchara completo, nutritivo y 100% vegano. Las lentejas se cocinan con zanahoria, pimiento y especias hasta quedar cremosas.',
    foto_url: null,
    tiempo_minutos: 45,
    raciones_base: 4,
    semana_activa: '2026-05-12',
    tags: ['VEGANO', 'VEGETARIANO', 'SIN_GLUTEN', 'SIN_LACTOSA', 'SIN_HUEVO'],
    ingredientes: [
      { producto: 'Lentejas Hacendado',               cantidad_base: 400,  unidad: 'g',  nombre_display: 'Lentejas' },
      { producto: 'Zanahoria Hacendado',              cantidad_base: 150,  unidad: 'g',  nombre_display: 'Zanahoria' },
      { producto: 'Pimiento rojo Hacendado',          cantidad_base: 100,  unidad: 'g',  nombre_display: 'Pimiento rojo' },
      { producto: 'Cebolla Hacendado',                cantidad_base: 120,  unidad: 'g',  nombre_display: 'Cebolla' },
      { producto: 'Tomate triturado Hacendado',       cantidad_base: 200,  unidad: 'g',  nombre_display: 'Tomate triturado' },
      { producto: 'Pimentón dulce Hacendado',         cantidad_base: 5,    unidad: 'g',  nombre_display: 'Pimentón' },
      { producto: 'Aceite de oliva virgen extra Hacendado', cantidad_base: 40, unidad: 'ml', nombre_display: 'Aceite' },
      { producto: 'Sal marina Hacendado',             cantidad_base: 5,    unidad: 'g',  nombre_display: 'Sal' },
    ],
    pasos: [
      'Lava las lentejas y ponlas a remojo 30 minutos si son secas (no necesario si son de bote cocidas — en ese caso, añade en el último paso).',
      'Pica la cebolla, el pimiento y la zanahoria en dados pequeños. Sofríe en una cazuela con el aceite a fuego medio durante 10 minutos.',
      'Añade el pimentón, remueve 30 segundos y agrega el tomate triturado. Cocina 5 minutos.',
      'Incorpora las lentejas escurridas y cubre con agua fría (unos 800 ml). Sala y lleva a ebullición.',
      'Baja el fuego, tapa y cocina 30-35 minutos hasta que las lentejas estén tiernas. Ajusta de agua si fuera necesario.',
      'Sirve caliente. Añade unas gotas de aceite de oliva crudo por encima al emplatar.',
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 5. POLLO AL HORNO CON VERDURAS
  // ─────────────────────────────────────────────────────────
  {
    nombre: 'Pollo al horno con patatas y pimiento',
    descripcion: 'La receta de pollo más clásica y fácil. Jugoso por dentro, con la piel crujiente, acompañado de unas patatas y pimientos asados en su propio jugo.',
    foto_url: null,
    tiempo_minutos: 75,
    raciones_base: 4,
    semana_activa: '2026-05-19',
    tags: ['SIN_GLUTEN', 'SIN_LACTOSA'],
    ingredientes: [
      { producto: 'Muslos de pollo Hacendado',        cantidad_base: 1000, unidad: 'g',  nombre_display: 'Muslos de pollo' },
      { producto: 'Patatas Hacendado',                cantidad_base: 600,  unidad: 'g',  nombre_display: 'Patatas' },
      { producto: 'Pimiento rojo Hacendado',          cantidad_base: 200,  unidad: 'g',  nombre_display: 'Pimiento rojo' },
      { producto: 'Cebolla Hacendado',                cantidad_base: 150,  unidad: 'g',  nombre_display: 'Cebolla' },
      { producto: 'Aceite de oliva virgen extra Hacendado', cantidad_base: 50, unidad: 'ml', nombre_display: 'Aceite' },
      { producto: 'Ajo en polvo Hacendado',           cantidad_base: 5,    unidad: 'g',  nombre_display: 'Ajo en polvo' },
      { producto: 'Pimentón dulce Hacendado',         cantidad_base: 5,    unidad: 'g',  nombre_display: 'Pimentón' },
      { producto: 'Sal marina Hacendado',             cantidad_base: 8,    unidad: 'g',  nombre_display: 'Sal' },
      { producto: 'Pimienta negra molida Hacendado',  cantidad_base: 3,    unidad: 'g',  nombre_display: 'Pimienta' },
    ],
    pasos: [
      'Precalienta el horno a 200°C (calor arriba y abajo).',
      'Pela las patatas y córtalas en rodajas de 1cm. Corta el pimiento y la cebolla en tiras.',
      'Coloca las patatas, pimiento y cebolla en una bandeja de horno. Aliña con la mitad del aceite, sal y pimienta. Hornea 15 minutos.',
      'Mezcla el resto del aceite con el ajo en polvo, el pimentón, sal y pimienta. Unta los muslos de pollo con esta mezcla.',
      'Coloca el pollo sobre las verduras. Hornea 50-55 minutos, dando la vuelta al pollo a mitad del tiempo.',
      'Comprueba que el pollo está bien hecho (jugos claros al pinchar). Si no está dorado, sube a grill 5 minutos. Sirve inmediatamente.',
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 6. MACARRONES CON TOMATE GRATINADOS (VEGETARIANA)
  // ─────────────────────────────────────────────────────────
  {
    nombre: 'Macarrones con tomate gratinados',
    descripcion: 'El clásico favorito de pequeños y mayores. Macarrones con salsa de tomate casera y una capa de queso gratinado irresistible.',
    foto_url: null,
    tiempo_minutos: 35,
    raciones_base: 4,
    semana_activa: '2026-05-19',
    tags: ['VEGETARIANO'],
    ingredientes: [
      { producto: 'Macarrones Hacendado',             cantidad_base: 400,  unidad: 'g',  nombre_display: 'Macarrones' },
      { producto: 'Tomate frito Hacendado',           cantidad_base: 350,  unidad: 'g',  nombre_display: 'Tomate frito' },
      { producto: 'Queso rallado Hacendado',          cantidad_base: 120,  unidad: 'g',  nombre_display: 'Queso rallado' },
      { producto: 'Cebolla Hacendado',                cantidad_base: 80,   unidad: 'g',  nombre_display: 'Cebolla' },
      { producto: 'Aceite de oliva virgen extra Hacendado', cantidad_base: 20, unidad: 'ml', nombre_display: 'Aceite' },
      { producto: 'Orégano Hacendado',                cantidad_base: 2,    unidad: 'g',  nombre_display: 'Orégano' },
      { producto: 'Sal marina Hacendado',             cantidad_base: 5,    unidad: 'g',  nombre_display: 'Sal' },
    ],
    pasos: [
      'Cuece los macarrones en abundante agua con sal según las instrucciones del envase. Escurre y reserva.',
      'Sofríe la cebolla picada en el aceite hasta que esté dorada (8 min). Añade el tomate frito y el orégano. Calienta 3 minutos.',
      'Mezcla la salsa con los macarrones escurridos.',
      'Vierte todo en una fuente de horno. Cubre generosamente con queso rallado.',
      'Gratina en el horno a 220°C durante 8-10 minutos, hasta que el queso esté fundido y dorado. Sirve inmediatamente.',
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 7. ENSALADA DE GARBANZOS (VEGANA / SIN GLUTEN)
  // ─────────────────────────────────────────────────────────
  {
    nombre: 'Ensalada de garbanzos con espinacas',
    descripcion: 'Una ensalada fresca, nutritiva y completa. Los garbanzos aportan proteína vegetal y las espinacas frescas dan color y vitaminas.',
    foto_url: null,
    tiempo_minutos: 15,
    raciones_base: 2,
    semana_activa: '2026-05-19',
    tags: ['VEGANO', 'VEGETARIANO', 'SIN_GLUTEN', 'SIN_LACTOSA', 'SIN_HUEVO'],
    ingredientes: [
      { producto: 'Garbanzos cocidos Hacendado',      cantidad_base: 400,  unidad: 'g',  nombre_display: 'Garbanzos' },
      { producto: 'Espinacas frescas Hacendado',      cantidad_base: 150,  unidad: 'g',  nombre_display: 'Espinacas' },
      { producto: 'Pimiento rojo Hacendado',          cantidad_base: 100,  unidad: 'g',  nombre_display: 'Pimiento rojo' },
      { producto: 'Cebolla Hacendado',                cantidad_base: 50,   unidad: 'g',  nombre_display: 'Cebolla morada' },
      { producto: 'Aceite de oliva virgen extra Hacendado', cantidad_base: 30, unidad: 'ml', nombre_display: 'Aceite' },
      { producto: 'Limón Hacendado',                  cantidad_base: 50,   unidad: 'g',  nombre_display: 'Limón' },
      { producto: 'Sal marina Hacendado',             cantidad_base: 3,    unidad: 'g',  nombre_display: 'Sal' },
      { producto: 'Pimienta negra molida Hacendado',  cantidad_base: 2,    unidad: 'g',  nombre_display: 'Pimienta' },
    ],
    pasos: [
      'Escurre y enjuaga bien los garbanzos.',
      'Lava y seca las espinacas. Corta el pimiento y la cebolla en dados pequeños.',
      'En un bol grande, combina los garbanzos, espinacas, pimiento y cebolla.',
      'Prepara el aliño: exprime el limón y mezcla el zumo con el aceite, sal y pimienta.',
      'Vierte el aliño sobre la ensalada y mezcla con suavidad. Sirve inmediatamente o refrigera 15 minutos para que los sabores se integren.',
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 8. POLLO CON NATA Y CHAMPIÑONES → usando nata
  // ─────────────────────────────────────────────────────────
  {
    nombre: 'Pechuga de pollo en salsa de nata',
    descripcion: 'Pechuga de pollo tierna en una salsa cremosa de nata con un toque de pimienta. Lista en 25 minutos, perfecta para cualquier día de semana.',
    foto_url: null,
    tiempo_minutos: 25,
    raciones_base: 4,
    semana_activa: '2026-05-26',
    tags: ['SIN_GLUTEN'],
    ingredientes: [
      { producto: 'Pechuga de pollo Hacendado',       cantidad_base: 800,  unidad: 'g',  nombre_display: 'Pechuga de pollo' },
      { producto: 'Nata para cocinar Hacendado',      cantidad_base: 200,  unidad: 'ml', nombre_display: 'Nata' },
      { producto: 'Cebolla Hacendado',                cantidad_base: 100,  unidad: 'g',  nombre_display: 'Cebolla' },
      { producto: 'Aceite de oliva virgen extra Hacendado', cantidad_base: 30, unidad: 'ml', nombre_display: 'Aceite' },
      { producto: 'Ajo en polvo Hacendado',           cantidad_base: 3,    unidad: 'g',  nombre_display: 'Ajo en polvo' },
      { producto: 'Sal marina Hacendado',             cantidad_base: 5,    unidad: 'g',  nombre_display: 'Sal' },
      { producto: 'Pimienta negra molida Hacendado',  cantidad_base: 3,    unidad: 'g',  nombre_display: 'Pimienta' },
    ],
    pasos: [
      'Corta la pechuga en filetes o tiras. Sala y pimenta.',
      'Calienta el aceite en una sartén a fuego alto. Dora el pollo 3-4 minutos por lado hasta que esté bien cocinado. Retira y reserva.',
      'En la misma sartén, sofríe la cebolla picada 5 minutos a fuego medio.',
      'Añade el ajo en polvo, remueve 30 segundos y vierte la nata. Lleva a ebullición suave y cocina 3 minutos hasta que espese ligeramente.',
      'Vuelve a poner el pollo en la sartén. Calienta 2 minutos en la salsa. Sirve con arroz blanco o verduras.',
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 9. TORTILLA FRANCESA CON JAMÓN
  // ─────────────────────────────────────────────────────────
  {
    nombre: 'Tortilla francesa con jamón',
    descripcion: 'La más rápida y versátil de las recetas. Esponjosa por dentro, ligeramente dorada por fuera, con taquitos de jamón serrano.',
    foto_url: null,
    tiempo_minutos: 10,
    raciones_base: 2,
    semana_activa: '2026-05-26',
    tags: ['SIN_GLUTEN'],
    ingredientes: [
      { producto: 'Huevos Hacendado M',               cantidad_base: 4,    unidad: 'ud', nombre_display: 'Huevos' },
      { producto: 'Jamón serrano loncheado Hacendado', cantidad_base: 50,  unidad: 'g',  nombre_display: 'Jamón serrano' },
      { producto: 'Aceite de oliva virgen extra Hacendado', cantidad_base: 15, unidad: 'ml', nombre_display: 'Aceite' },
      { producto: 'Sal marina Hacendado',             cantidad_base: 2,    unidad: 'g',  nombre_display: 'Sal' },
    ],
    pasos: [
      'Corta el jamón en taquitos pequeños.',
      'Bate bien los huevos con una pizca de sal hasta que estén espumosos. Mezcla con el jamón.',
      'Calienta el aceite en una sartén antiadherente a fuego medio-alto. Vierte la mezcla de huevo.',
      'Mueve los bordes hacia el centro con una espátula durante 1 minuto. Cuando los bordes estén cuajados, dobla la tortilla por la mitad y sirve.',
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 10. ATÚN CON TOMATE
  // ─────────────────────────────────────────────────────────
  {
    nombre: 'Atún con tomate al estilo casero',
    descripcion: 'Un clásico de los tupers y las comidas de semana. El atún se guisa suavemente en salsa de tomate con cebolla y especias.',
    foto_url: null,
    tiempo_minutos: 25,
    raciones_base: 4,
    semana_activa: '2026-05-26',
    tags: ['SIN_GLUTEN', 'SIN_LACTOSA'],
    ingredientes: [
      { producto: 'Atún en aceite de oliva Hacendado', cantidad_base: 240, unidad: 'g',  nombre_display: 'Atún en aceite' },
      { producto: 'Tomate triturado Hacendado',        cantidad_base: 400, unidad: 'g',  nombre_display: 'Tomate triturado' },
      { producto: 'Cebolla Hacendado',                 cantidad_base: 120, unidad: 'g',  nombre_display: 'Cebolla' },
      { producto: 'Pimiento rojo Hacendado',           cantidad_base: 100, unidad: 'g',  nombre_display: 'Pimiento rojo' },
      { producto: 'Aceite de oliva virgen extra Hacendado', cantidad_base: 25, unidad: 'ml', nombre_display: 'Aceite' },
      { producto: 'Orégano Hacendado',                 cantidad_base: 2,   unidad: 'g',  nombre_display: 'Orégano' },
      { producto: 'Sal marina Hacendado',              cantidad_base: 3,   unidad: 'g',  nombre_display: 'Sal' },
    ],
    pasos: [
      'Pica la cebolla y el pimiento finamente. Sofríe en el aceite a fuego medio durante 10 minutos hasta que estén blandos.',
      'Añade el tomate triturado, el orégano y la sal. Cocina 10 minutos a fuego medio-bajo, removiendo ocasionalmente.',
      'Escurre el atún y añádelo a la salsa. Mezcla con cuidado para no desmenuzarlo demasiado. Calienta 2-3 minutos.',
      'Sirve caliente sobre arroz blanco o con pan de molde tostado.',
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 11. CREMA DE ZANAHORIAS (VEGANA / SIN GLUTEN)
  // ─────────────────────────────────────────────────────────
  {
    nombre: 'Crema de zanahorias',
    descripcion: 'Una sopa cremosa, suave y reconfortante. El sabor dulce natural de la zanahoria combinado con el caldo hace una crema irresistible.',
    foto_url: null,
    tiempo_minutos: 30,
    raciones_base: 4,
    semana_activa: '2026-05-26',
    tags: ['VEGANO', 'VEGETARIANO', 'SIN_GLUTEN', 'SIN_LACTOSA', 'SIN_HUEVO'],
    ingredientes: [
      { producto: 'Zanahoria Hacendado',              cantidad_base: 600,  unidad: 'g',  nombre_display: 'Zanahoria' },
      { producto: 'Cebolla Hacendado',                cantidad_base: 100,  unidad: 'g',  nombre_display: 'Cebolla' },
      { producto: 'Patatas Hacendado',                cantidad_base: 200,  unidad: 'g',  nombre_display: 'Patatas' },
      { producto: 'Caldo de pollo Hacendado',         cantidad_base: 800,  unidad: 'ml', nombre_display: 'Caldo' },
      { producto: 'Aceite de oliva virgen extra Hacendado', cantidad_base: 30, unidad: 'ml', nombre_display: 'Aceite' },
      { producto: 'Sal marina Hacendado',             cantidad_base: 4,    unidad: 'g',  nombre_display: 'Sal' },
    ],
    pasos: [
      'Pela y trocea las zanahorias y las patatas. Pica la cebolla.',
      'Sofríe la cebolla en el aceite 5 minutos en una olla. Añade las zanahorias y las patatas, remueve.',
      'Vierte el caldo, sala y lleva a ebullición. Cuece tapado a fuego medio 20 minutos hasta que las verduras estén muy tiernas.',
      'Tritura con una batidora de mano hasta obtener una crema lisa. Ajusta la densidad con más caldo si fuera necesario.',
      'Rectifica de sal y sirve caliente. Añade un hilo de aceite de oliva crudo por encima.',
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 12. PIZZA CASERA (VEGETARIANA)
  // ─────────────────────────────────────────────────────────
  {
    nombre: 'Pizza casera Margherita',
    descripcion: 'Masa casera crujiente con tomate, queso fundido y orégano. Más sencilla de lo que parece y mucho más rica que las congeladas.',
    foto_url: null,
    tiempo_minutos: 45,
    raciones_base: 4,
    semana_activa: '2026-05-19',
    tags: ['VEGETARIANO'],
    ingredientes: [
      { producto: 'Harina de trigo Hacendado',        cantidad_base: 300,  unidad: 'g',  nombre_display: 'Harina de trigo' },
      { producto: 'Tomate frito Hacendado',           cantidad_base: 200,  unidad: 'g',  nombre_display: 'Tomate frito' },
      { producto: 'Queso rallado Hacendado',          cantidad_base: 150,  unidad: 'g',  nombre_display: 'Queso mozzarella rallado' },
      { producto: 'Aceite de oliva virgen extra Hacendado', cantidad_base: 30, unidad: 'ml', nombre_display: 'Aceite' },
      { producto: 'Orégano Hacendado',                cantidad_base: 3,    unidad: 'g',  nombre_display: 'Orégano' },
      { producto: 'Sal marina Hacendado',             cantidad_base: 5,    unidad: 'g',  nombre_display: 'Sal' },
    ],
    pasos: [
      'Mezcla la harina con una pizca de sal y el aceite. Añade 150ml de agua tibia poco a poco y amasa 8-10 minutos hasta obtener una masa suave y elástica. Deja reposar 20 min tapada.',
      'Precalienta el horno a 220°C. Estira la masa con un rodillo en forma redonda o rectangular (2-3mm de grosor).',
      'Coloca la masa en una bandeja con papel de horno. Extiende el tomate frito dejando 1cm de borde.',
      'Reparte el queso rallado de forma uniforme. Espolvorea con orégano.',
      'Hornea 12-15 minutos hasta que los bordes estén dorados y el queso burbujeante. Sirve inmediatamente.',
    ],
  },
];

module.exports = recetas;
