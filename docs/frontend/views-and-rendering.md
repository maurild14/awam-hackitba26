# Archivo: `/docs/frontend/views-and-rendering.md`

```md
# Views and Rendering

## Estado implementado hasta M5
El frontend ya tiene:
- `layout.js`
- `page.js`
- `globals.css`
- `auth/login/page.js`
- `auth/register/page.js`
- `marketplace/page.js`
- `marketplace/[botRef]/page.js`
- `checkout/[paymentId]/page.js`
- `buyer/sessions/page.js`
- `buyer/sessions/[sessionId]/page.js`
- `seller/bots/page.js`
- `admin/bots/page.js`

## Estrategia de renderizado

### Server Components
- landing,
- marketplace,
- detalle del agente,
- historial buyer,
- detalle buyer de sesión.

### Client Components
- auth,
- checkout,
- dashboard,
- seller panel,
- admin,
- session progress,
- dynamic credentials form.

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

## Evolución prevista después de M5
La UX buyer ya cubre checkout -> credenciales -> sesión -> progreso -> resumen usando mocks. Runtime real, seller executions y observabilidad más profunda quedan para milestones posteriores.
```

---
