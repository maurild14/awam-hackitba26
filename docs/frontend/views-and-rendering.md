
# Archivo: `/docs/frontend/views-and-rendering.md`

```md
# Views and Rendering

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
├─ layout.tsx
├─ page.tsx
├─ marketplace/
│  ├─ page.tsx
│  └─ [slug]/page.tsx
├─ checkout/
│  └─ [botId]/page.tsx
├─ dashboard/
│  ├─ page.tsx
│  └─ sessions/[sessionId]/page.tsx
├─ seller/
│  ├─ page.tsx
│  ├─ new-bot/page.tsx
│  └─ bots/[botId]/page.tsx
├─ auth/
│  ├─ login/page.tsx
│  └─ register/page.tsx
├─ admin/page.tsx
└─ api/auth/callback/route.ts
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
```

---


