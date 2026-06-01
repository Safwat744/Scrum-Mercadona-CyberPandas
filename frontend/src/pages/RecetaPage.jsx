import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Heart, ShoppingBasket, Check, Package, Maximize2, X, Volume2, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { getCatalogo, getPrecio, getReceta } from "@/api/recetas";
import { getCookingMode } from "@/api/ai";
import { addReceta } from "@/api/lista";
import { getFavoritos, toggleFavorito } from "@/api/favoritos";
import Stepper from "@/components/common/Stepper";
import RecipeCard from "@/components/common/RecipeCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { normalizeCatalogRecipe, normalizeDetailRecipe } from "@/lib/recipeAdapters";

export default function RecetaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [related, setRelated] = useState([]);
  const [servings, setServings] = useState(2);
  const [favorite, setFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [price, setPrice] = useState(null);
  const [added, setAdded] = useState(false);
  const [cookingOpen, setCookingOpen] = useState(false);

  const safeParseNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getReceta(id),
      getCatalogo().catch(() => ({ recetas: [] })),
      getFavoritos().catch(() => ({ favoritos: [] })),
      getPrecio(id, 2).catch(() => null),
    ])
      .then(([recetaData, catalogData, favoritesData, priceData]) => {
        const normalizedRecipe = normalizeDetailRecipe(recetaData, priceData);
        setRecipe(normalizedRecipe);
        setServings(safeParseNumber(recetaData.raciones_base, normalizedRecipe.servings || 2));
        setPrice(priceData);
        setFavorite((favoritesData.favoritos || []).some((item) => item.id === recetaData.id));
        setRelated(
          (catalogData.recetas || [])
            .filter((item) => item.id !== recetaData.id)
            .slice(0, 3)
            .map(normalizeCatalogRecipe),
        );
      })
      .catch(() => setRecipe(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!recipe) return;
    getPrecio(id, servings)
      .then((data) => setPrice(data))
      .catch(() => setPrice(null));
  }, [id, servings, recipe]);

  if (!loading && !recipe) {
    return (
      <div className="container-app py-20 text-center">
        <h2 className="display-md">Receta no encontrada.</h2>
        <Link to="/catalogo" className="link-editorial mt-4 inline-block">Volver al catálogo</Link>
      </div>
    );
  }

  if (loading || !recipe) {
    return (
      <div className="container-app py-20">
        <div className="rounded-2xl border border-rule bg-paper-raised overflow-hidden">
          <div className="skeleton-block aspect-[16/8]" />
          <div className="p-8 space-y-4">
            <div className="skeleton-block h-4 w-24" />
            <div className="skeleton-block h-10 w-2/3" />
            <div className="skeleton-block h-5 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  const ratio = servings / recipe.servings;
  const hacendadoCount = recipe.ingredients.filter((ingredient) => ingredient.hacendado).length;
  const estimatedListPrice = recipe.ingredients.reduce(
    (acc, ingredient) => acc + (ingredient.hacendado?.price || 0),
    0
  );

  const handleAdd = async () => {
    try {
      await addReceta(id, servings);
      setAdded(true);
      toast.success(`Ingredientes añadidos a tu lista.`, {
        description: `Listos para comprar en Mercadona para ${servings} raciones.`,
      });
      window.setTimeout(() => setAdded(false), 2400);
    } catch {
      toast.error("No hemos podido añadir esta receta a tu lista.");
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const result = await toggleFavorito(id);
      setFavorite(result.favorito);
    } catch {}
  };

  return (
    <article data-testid="receta-page">
      {/* Back nav */}
      <div className="container-app pt-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink transition-colors"
          data-testid="back-btn"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>
      </div>

      {/* Editorial hero */}
      <header className="container-app mt-6 grid md:grid-cols-12 gap-8 md:gap-12 items-start">
        <div className="md:col-span-6 lg:col-span-7">
          <div className="relative aspect-[4/5] bg-paper-deep rounded-2xl overflow-hidden grain">
            <img
              src={recipe.image}
              alt=""
              className="h-full w-full object-cover"
              onError={(e) => (e.currentTarget.style.opacity = 0)}
            />
          </div>
        </div>

        <div className="md:col-span-6 lg:col-span-5 md:sticky md:top-24 self-start">
          <p className="eyebrow">{recipe.eyebrow}</p>
          <h1 className="display-xl mt-3 text-balance">{recipe.title}</h1>
          {recipe.author && (
            <p className="meta-mono mt-3 text-ink-soft">Por {recipe.author}</p>
          )}
          <p className="mt-5 text-ink-soft text-[15px] leading-relaxed max-w-md">{recipe.description}</p>

          <dl className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 hairline-t hairline-b py-5 gap-2">
            <Meta term="Tiempo" value={`${recipe.time} min`} icon={<Clock className="h-3.5 w-3.5" />} />
            <Meta term="Raciones" value={`${recipe.servings} base`} />
            <Meta term="Dificultad" value={recipe.difficulty || "—"} />
            <Meta term="Calorías" value={recipe.calories ? `${recipe.calories} kcal` : "—"} />
            <Meta term="Precio" value={price?.precio_display || "—"} highlight />
          </dl>

          <div className="mt-7 flex items-center justify-between">
            <div>
              <p className="label-cap text-ink-soft">Raciones ({recipe.servings} base)</p>
              <div className="mt-2">
                <Stepper value={servings} onChange={setServings} min={1} max={12} testid="servings-stepper" />
              </div>
            </div>
            <button
              onClick={handleToggleFavorite}
              aria-pressed={favorite}
              data-testid="fav-toggle"
              className="h-11 w-11 rounded-full border border-rule hover:border-ink grid place-items-center transition-colors"
              aria-label="Favorita"
            >
              <Heart className={`h-5 w-5 ${favorite ? "fill-tomate text-tomate" : "text-ink"}`} />
            </button>
          </div>

          <Button
            size="xl"
            onClick={handleAdd}
            className="mt-7 w-full"
            data-testid="add-to-list"
          >
            {added ? (
              <>
                <Check className="h-4 w-4" />
                Añadido a tu lista
              </>
            ) : (
              <>
                <ShoppingBasket className="h-4 w-4" />
                Añadir ingredientes a la lista
              </>
            )}
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => setCookingOpen(true)}
            className="mt-3 w-full"
            data-testid="open-cooking-mode"
          >
            <Maximize2 className="h-4 w-4" />
            Abrir modo cocina
          </Button>

          <p className="meta-mono mt-3 text-center">
            {hacendadoCount} de {recipe.ingredients.length} con producto Hacendado · ~
            <span className="text-ink">{estimatedListPrice.toFixed(2)} €</span> estimado
          </p>
        </div>
      </header>

      {/* Body: ingredients (sticky) + steps */}
      <section className="container-app mt-20 grid md:grid-cols-12 gap-12">
        {/* Ingredients */}
        <aside className="md:col-span-5 lg:col-span-4 md:sticky md:top-24 self-start" data-testid="ingredients">
          <p className="eyebrow">Ingredientes</p>
          <h2 className="display-md mt-2">Para {servings} raciones.</h2>
          <ul className="mt-6 divide-y divide-rule border-y border-rule">
            {recipe.ingredients.map((ing) => {
              const qty = typeof ing.qty === "number" ? +(ing.qty * ratio).toFixed(2) : ing.qty;
              return (
                <li key={ing.id} className="py-3.5 flex items-center gap-3" data-testid={`ing-${ing.id}`}>
                  {ing.hacendado?.thumbnail ? (
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-paper-deep border border-rule">
                      <img src={ing.hacendado.thumbnail} alt="" className="h-full w-full object-cover" loading="lazy" />
                    </div>
                  ) : (
                    <div className="h-12 w-12 shrink-0 rounded-xl bg-paper-deep border border-rule" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] text-ink">{ing.name}</p>
                    {ing.hacendado && (
                      <p className="meta-mono mt-1 inline-flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-mercadona" />
                        {ing.hacendado.brand} · {ing.hacendado.price.toFixed(2)} €
                      </p>
                    )}
                  </div>
                  <span className="num-mono text-sm text-ink whitespace-nowrap">
                    {qty} {ing.unit}
                  </span>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Steps */}
        <div className="md:col-span-7 lg:col-span-8 prose-recipe" data-testid="steps">
          <p className="eyebrow">Preparación</p>
          <h2 className="display-md mt-2">Paso a paso.</h2>
          <ol className="mt-8 space-y-10">
            {recipe.steps.map((s, i) => (
              <li key={s.orden} className="grid grid-cols-[auto_1fr] gap-6 items-start">
                <span className="display-md text-ink-soft tabular-nums leading-none pt-1" style={{ fontStyle: "italic" }}>
                  {String(s.orden).padStart(2, "0")}
                </span>
                <p className="text-[17px] leading-[1.7] text-ink">{s.descripcion}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Pairing */}
      {related.length > 0 && (
        <section className="container-app mt-24 pb-16">
          <header className="flex items-end justify-between">
            <div>
              <p className="eyebrow">Combina bien con</p>
              <h2 className="display-lg mt-2">Otras tres ideas.</h2>
            </div>
          </header>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
            {related.map((r) => (
              <RecipeCard key={r.id} recipe={r} />
            ))}
          </div>
        </section>
      )}
      <CookingModeOverlay
        open={cookingOpen}
        onOpenChange={setCookingOpen}
        recipe={recipe}
        servings={servings}
      />
    </article>
  );
}

function Meta({ term, value, icon, highlight }) {
  return (
    <div>
      <dt className="meta-mono inline-flex items-center gap-1">{icon}{term}</dt>
      <dd className={`mt-1 num-mono text-[15px] ${highlight ? "text-tomate" : "text-ink"}`}>{value}</dd>
    </div>
  );
}

function CookingModeOverlay({ open, onOpenChange, recipe, servings }) {
  const [mode, setMode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [index, setIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!open || !recipe) return;
    setLoading(true);
    getCookingMode({ recetaId: recipe.id, raciones: servings })
      .then((data) => {
        setMode(data);
        setIndex(0);
        setSecondsLeft(data.pasos?.[0]?.duracion_segundos || 60);
      })
      .catch(() => {
        setMode({
          titulo: recipe.title,
          intro_tts: `Empezamos con ${recipe.title}.`,
          pasos: recipe.steps.map((step) => ({
            orden: step.orden,
            titulo: `Paso ${step.orden}`,
            narracion: step.descripcion,
            duracion_segundos: 60,
            timer_recomendado: false,
          })),
          cierre_tts: "Receta terminada.",
        });
        setIndex(0);
        setSecondsLeft(60);
      })
      .finally(() => setLoading(false));
  }, [open, recipe, servings]);

  useEffect(() => {
    if (!running || secondsLeft <= 0) return;
    const timer = window.setInterval(() => setSecondsLeft((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [running, secondsLeft]);

  useEffect(() => {
    const step = mode?.pasos?.[index];
    setSecondsLeft(step?.duracion_segundos || 60);
    setRunning(false);
  }, [index, mode]);

  if (!open) return null;

  const steps = mode?.pasos || [];
  const current = steps[index];
  const canPrev = index > 0;
  const canNext = index < steps.length - 1;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  const speak = (value) => {
    if (!window.speechSynthesis || !value) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(value);
    utterance.lang = "es-ES";
    utterance.rate = 0.92;
    window.speechSynthesis.speak(utterance);
  };

  const close = () => {
    window.speechSynthesis?.cancel();
    onOpenChange(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink text-paper" data-testid="cooking-mode">
      <div className="absolute inset-0">
        <img src={recipe.image} alt="" className="h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/95 to-ink" />
      </div>
      <div className="relative z-10 min-h-screen flex flex-col px-6 py-5 md:px-10">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-paper/55">Modo cocina</p>
            <h2 className="text-xl md:text-2xl font-semibold mt-1">{mode?.titulo || recipe.title}</h2>
          </div>
          <button onClick={close} className="h-11 w-11 rounded-full bg-white/10 grid place-items-center hover:bg-white/15" aria-label="Cerrar">
            <X className="h-5 w-5" />
          </button>
        </header>

        <main className="flex-1 grid place-items-center py-8">
          {loading || !current ? (
            <div className="text-center">
              <p className="text-3xl font-semibold">Preparando modo cocina…</p>
              <p className="mt-3 text-paper/60">Adaptando pasos para narración y temporizadores.</p>
            </div>
          ) : (
            <div className="w-full max-w-4xl">
              <div className="flex items-center justify-between text-paper/60 text-sm">
                <span>Paso {index + 1} de {steps.length}</span>
                <span>{current.timer_recomendado ? "Timer recomendado" : "Sin timer obligatorio"}</span>
              </div>
              <div className="mt-5 h-1 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-mercadona" style={{ width: `${((index + 1) / steps.length) * 100}%` }} />
              </div>
              <h1 className="mt-10 text-[clamp(2.2rem,6vw,5rem)] font-bold leading-[0.98] tracking-[-0.04em] text-balance">
                {current.titulo}
              </h1>
              <p className="mt-7 text-xl md:text-2xl leading-relaxed text-paper/80 max-w-3xl">
                {current.narracion}
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <button onClick={() => speak(current.narracion)} className="h-12 px-5 rounded-full bg-white text-ink font-medium inline-flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  Narrar paso
                </button>
                <button onClick={() => setRunning((value) => !value)} className="h-12 px-5 rounded-full bg-white/10 border border-white/15 font-medium inline-flex items-center gap-2">
                  {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {minutes}:{seconds}
                </button>
              </div>
            </div>
          )}
        </main>

        <footer className="flex items-center justify-between gap-4">
          <button
            onClick={() => canPrev && setIndex((value) => value - 1)}
            disabled={!canPrev}
            className="h-12 px-5 rounded-full bg-white/10 disabled:opacity-35 inline-flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </button>
          <button
            onClick={() => canNext ? setIndex((value) => value + 1) : speak(mode?.cierre_tts)}
            className="h-12 px-5 rounded-full bg-mercadona text-white inline-flex items-center gap-2"
          >
            {canNext ? "Siguiente paso" : "Finalizar"}
            <ChevronRight className="h-4 w-4" />
          </button>
        </footer>
      </div>
    </div>
  );
}
