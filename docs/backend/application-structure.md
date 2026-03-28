# Archivo: `/docs/backend/application-structure.md`

```md
# Backend Application Structure

## Estado implementado hasta M5
En Milestone 5 el backend ya cubre:
- healthcheck,
- auth por backend contra Supabase,
- cookies `httpOnly`,
- middlewares de auth y rol,
- acceso a perfiles,
- configuración de clientes Supabase,
- rutas de bots, payments, sessions y stream,
- servicios mock para `secretStore`, `sandboxRunner` y `streamEmitter`.

Todavía no están implementados:
- Vault real,
- Redis real,
- Docker real,
- proxy real,
- sandbox real.

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
│  │  ├─ executionLog.js
│  │  ├─ payment.js
│  │  ├─ profile.js
│  │  └─ session.js
│  ├─ services/
│  │  ├─ authService.js
│  │  ├─ mockSandboxRunner.js
│  │  ├─ mockSecretStore.js
│  │  ├─ mockStreamEmitter.js
│  │  ├─ paymentService.js
│  │  └─ sessionService.js
│  └─ routes/
│     ├─ auth.js
│     ├─ health.js
│     ├─ payments.js
│     └─ sessions.js
└─ test/
   ├─ auth.test.js
   ├─ health.test.js
   ├─ payments.test.js
   ├─ session-stream.test.js
   └─ sessions.test.js
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
- `sessionService.js`
- `mockSandboxRunner.js` ahora, `sandboxService.js` más adelante
- `mockSecretStore.js` ahora, `vaultService.js` más adelante
- `payments.js` + `mercadopagoService.js`
- `sessions.js` / `stream`

## Evolución prevista después de M5
Los adapters mock de sesiones, secretos y streaming se reemplazan por Vault, Redis, proxy y runtime real en milestones posteriores sin cambiar el contrato buyer-facing.
```

---
