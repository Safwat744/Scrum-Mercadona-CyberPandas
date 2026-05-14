# Recetas Hacendado

[![Gestión de Proyectos - Scrum](https://img.shields.io/badge/Gestión_de_Proyectos-Scrum-00aa5a.svg)](https://github.com/Safwat744/Scrum-Mercadona-CyberPandas)
[![Estado](https://img.shields.io/badge/Estado-Definición_Base-orange.svg)]()
[![Backlog](https://img.shields.io/badge/Product_Backlog-11_HU_·_47_pts-blue.svg)]()
[![Stack](https://img.shields.io/badge/Stack-React_·_Node.js_·_PostgreSQL-61DAFB.svg)]()

> **Proyecto Académico:** Asignatura de Gestión de Proyectos Universitarios (GII).
> **Profesor:** Alex R. Villalobos (`arodriguez@doe.upv.es`)
> **Equipo:** CyberPandas

---

## Visión del Producto

A menudo, los clientes (a los que Mercadona llama "El Jefe") no saben qué cocinar durante la semana o qué ingredientes comprar para una receta en concreto. Además, buscar los productos uno por uno en la tienda requiere más tiempo y esfuerzo.

Nuestra aplicación, **Recetas Hacendado**, es el puente entre la indecisión culinaria y la compra efectiva. La app ofrece ideas de comidas para la semana y, cuando el usuario elige una receta, todos los ingredientes (de la marca Hacendado) se añaden de forma automática a una lista de la compra digital — **con cantidades exactas, sin duplicados, y con el precio estimado en tiempo real**.

---

## Diferenciadores Clave

| Funcionalidad | Descripción |
|---------------|-------------|
| **Precio real en tiempo real** | Calcula el coste de cada receta usando la BD de productos Hacendado |
| **Raciones ajustables** | Las cantidades y el precio escalan instantáneamente al cambiar el número de comensales |
| **Lista inteligente sin duplicados** | Al añadir una receta, los ingredientes ya presentes suman sus cantidades en lugar de duplicarse |
| **Lista organizada por secciones** | La lista de la compra agrupa productos por zona del supermercado (Lácteos, Carnes, Verduras…) |
| **Onboarding de preferencias** | Configuración inicial de restricciones dietéticas que personaliza el catálogo desde el primer uso |

---

## Stack Tecnológico

| Capa | Tecnología | Rol |
|------|-----------|-----|
| **Frontend** | React | UI interactiva, recálculo en tiempo real |
| **Backend** | Node.js + Express | API REST, lógica de negocio, autenticación |
| **Base de Datos** | PostgreSQL | Integridad relacional entre entidades complejas |
| **Despliegue** | Vercel | CI/CD automático, preview por PR |

> Ver análisis completo en [`/docs/Stack_Tecnologico.md`](docs/Stack_Tecnologico.md)

---

## Product Backlog — Resumen

| ID | Título | Prioridad | Puntos |
|----|--------|-----------|--------|
| HU-01 | Registro, login y sesión de usuario | Alta | 8 pts |
| HU-02 | Onboarding con preferencias dietéticas | Alta | 3 pts |
| HU-03 | Catálogo visual de recetas semanales | Alta | 5 pts |
| HU-04 | Ficha de receta con metadata completa | Alta | 5 pts |
| HU-05 | Precio estimado de la receta | Alta | 3 pts |
| HU-06 | Raciones ajustables (cálculo dinámico) | Alta | 3 pts |
| HU-07 | Añadir a la lista con cantidades y sin duplicados | Alta | 8 pts |
| HU-08 | Gestión inteligente de la lista en tienda (por secciones) | Alta | 5 pts |
| HU-09 | Filtros de preferencias alimentarias | Media | 3 pts |
| HU-10 | Recetas favoritas | Media | 2 pts |
| HU-11 | Buscador de recetas (por nombre o ingrediente) | Baja | 3 pts |
| | **TOTAL** | | **47 pts** |

> Ver detalle completo (criterios de aceptación) en [`/docs/Pila_del_Producto.md`](docs/Pila_del_Producto.md)

---

## Estructura del Repositorio

```
Scrum-Mercadona-CyberPandas/
├── /docs
│   ├── Pila_del_Producto.md    ← 11 HUs con criterios de aceptación (47 pts)
│   ├── Plan_de_Sprints.md      ← Planificación completa: 4 sprints de desarrollo
│   ├── Arquitectura_Escalable.md ← BD schema, API REST, estructura de carpetas
│   ├── UI_Sistema_Diseno.md    ← Réplica exacta del sistema de diseño Mercadona
│   ├── Stack_Tecnologico.md    ← Decisiones técnicas y justificaciones
│   └── Sprint_1.md             ← Registro del Sprint 0 (definición)
├── /frontend                   ← Código fuente React
├── /backend                    ← Código fuente Node.js + Express
├── /img                        ← Mockups, assets de diseño
├── presentacion.html           ← Presentación visual (abrir en navegador)
└── README.md
```

---

## Estado del Proyecto

| Entregable | Estado |
|------------|--------|
| Visión del Producto | ✅ Completada |
| Product Backlog v2.0 (11 HU · 47 pts) | ✅ Completado |
| Stack Tecnológico definido | ✅ Completado |
| Plan de Sprints (4 sprints · 10 semanas) | ✅ Completado |
| Arquitectura Escalable (BD · API · Carpetas) | ✅ Completada |
| Sistema de Diseño UI (réplica Mercadona) | ✅ Completado |
| Diseño UI / Mockups | ✅ Completados |
| Presentación HTML | ✅ Validada |
| Repositorio GitHub estructurado | ✅ Listo |
| Invitación enviada al profesor | ⏳ Pendiente |
| Issues en GitHub Projects (Backlog) | ⏳ Pendiente |
| Inicio del desarrollo (Sprint 1) | 🔜 Próximo paso |
