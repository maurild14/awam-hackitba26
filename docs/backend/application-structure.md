
# Archivo: `/docs/backend/application-structure.md`

```md
# Backend Application Structure

## Estructura esperada

```text
backend/
├─ src/
│  ├─ index.js
│  ├─ config/
│  │  ├─ database.js
│  │  ├─ redis.js
│  │  ├─ vault.js
│  │  └─ docker.js
│  ├─ middleware/
│  │  ├─ auth.js
│  │  └─ errorHandler.js
│  ├─ routes/
│  │  ├─ auth.js
│  │  ├─ bots.js
│  │  ├─ sessions.js
│  │  ├─ payments.js
│  │  ├─ stream.js
│  │  └─ internal.js
│  ├─ services/
│  │  ├─ vaultService.js
│  │  ├─ dockerService.js
│  │  ├─ sandboxService.js
│  │  └─ mercadopagoService.js
│  └─ models/
│     ├─ bot.js
│     ├─ session.js
│     ├─ payment.js
│     ├─ review.js
│     └─ profile.js
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
```

---