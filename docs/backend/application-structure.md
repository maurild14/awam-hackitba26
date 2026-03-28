
# Archivo: `/docs/backend/application-structure.md`

```md
# Backend Application Structure

## Estado implementado en M2
En Milestone 2 el backend ya cubre:
- healthcheck,
- auth por backend contra Supabase,
- cookies `httpOnly`,
- middlewares de auth y rol,
- acceso a perfiles,
- configuración de clientes Supabase.

Todavía no están implementados:
- rutas de bots, payments, sessions, stream e internal,
- servicios de pagos, Vault, Redis, Docker o sandbox.

## Estructura esperada

```text
backend/
├─ src/
│  ├─ index.js
│  ├─ app.js
│  ├─ config/
│  │  ├─ cookies.js
│  │  ├─ env.js
│  │  └─ supabase.js
│  ├─ lib/
│  │  ├─ httpError.js
│  │  └─ logger.js
│  ├─ middleware/
│  │  ├─ auth.js
│  │  ├─ errorHandler.js
│  │  └─ requestContext.js
│  ├─ models/
│  │  └─ profile.js
│  ├─ services/
│  │  └─ authService.js
│  └─ routes/
│     ├─ auth.js
│     └─ health.js
└─ test/
   ├─ auth.test.js
   └─ health.test.js
```

## Regla de separación
- `routes/`: HTTP y validación superficial.
- `services/`: lógica de negocio/orquestación.
- `models/`: acceso a datos.
- `config/`: clients y adapters.
- `middleware/`: concerns transversales.

## Auth
El backend valida JWTs de Supabase y luego aplica middlewares de rol.

## Error handling
Toda respuesta de error debe ser consistente. No exponer stack traces ni detalles internos en producción.

## Dónde suele vivir la complejidad real
- `sandboxService.js`
- `vaultService.js`
- `payments.js` + `mercadopagoService.js`
- `stream.js`

## Evolución prevista después de M2
Las rutas y servicios de negocio para bots, payments, sessions, streaming e internal se agregan en milestones posteriores sobre esta base de auth y perfiles.
```

---
