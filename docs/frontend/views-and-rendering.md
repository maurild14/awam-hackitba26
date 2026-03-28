
# Archivo: `/docs/frontend/views-and-rendering.md`

```md
# Views and Rendering

## Estado implementado en M1
En Milestone 1 solo existe el scaffold base del frontend:
- `layout.js`
- `page.js`
- `globals.css`

Todavía no existen las páginas de marketplace, auth, checkout, dashboards ni paneles operativos.

## Estrategia de renderizado

### Server Components
- landing,
- marketplace,
- detalle del agente.

### Client Components
- auth,
- checkout,
- dashboard,
- seller panel,
- admin,
- session progress.

## Estructura esperada

```text
frontend/app/
├─ layout.js
├─ page.js
└─ globals.css
```

## Componentes clave
- `BotCard`
- `CredentialsForm`
- `SessionProgress`
- `CheckoutFlow`

## UX que no se debe perder
- buyer siempre entiende en qué estado está,
- seguridad de credenciales explicada en lenguaje simple,
- progreso legible,
- errores con copy claro, no técnico.

## Evolución prevista después de M1
La estructura completa de marketplace, checkout, dashboard, seller, auth y admin se incorpora en milestones posteriores sobre este scaffold inicial.
```

---


