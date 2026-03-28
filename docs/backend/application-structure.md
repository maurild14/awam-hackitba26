
# Archivo: `/docs/backend/application-structure.md`

```md
# Backend Application Structure

## Estado implementado en M1
En Milestone 1 solo existe el scaffold base para que el backend arranque, exponga healthchecks y fije convenciones compartidas.

Todavía no están implementados:
- auth y roles,
- rutas `/api/v1/*`,
- modelos persistentes,
- servicios de pagos, Vault, Redis, Docker o sandbox.

## Estructura esperada

```text
backend/
├─ src/
│  ├─ index.js
│  ├─ app.js
│  ├─ config/
│  │  └─ env.js
│  ├─ lib/
│  │  └─ logger.js
│  ├─ middleware/
│  │  ├─ errorHandler.js
│  │  └─ requestContext.js
│  └─ routes/
│     └─ health.js
└─ test/
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

## Evolución prevista después de M1
Los directorios `services/`, `models/` y el resto de `routes/` se agregan en milestones posteriores, cuando entren auth, datos, pagos y runtime.
```

---
