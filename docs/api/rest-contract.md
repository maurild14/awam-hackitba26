
# Archivo: `/docs/api/rest-contract.md`

```md
# REST Contract

## Auth
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

### Contrato mínimo de M2
- `register`: `{ email, password, username, role }`
- `login`: `{ email, password }`
- `refresh`: usa cookies `httpOnly`, sin body
- `logout`: usa cookies `httpOnly`, sin body
- `me`: devuelve `{ user: { id, email, username, role } }`

## Bots
Debe cubrir, como mínimo:
- listado público de bots published,
- detalle público por slug/id,
- creación de bot por seller,
- edición de bot propio,
- suspensión/publicación por admin,
- endpoints de upload/build si se exponen desde backend.

## Payments
- `POST /api/v1/payments/create-preference`
- `POST /api/v1/payments/webhook`
- endpoint de consulta de estado si el frontend lo necesita

## Sessions
Debe cubrir:
- crear sesión luego del pago,
- enviar credenciales,
- iniciar ejecución,
- consultar historial de buyer,
- consultar sesiones del seller con buyer anonimizado,
- detener sesión si el producto lo permite.

## Streaming
- `GET /api/v1/sessions/:sessionId/stream`

## Internal
Endpoints internos para:
- callback de build de GitHub Actions,
- eventos internos autenticados con `INTERNAL_API_TOKEN`.

## Reglas de contrato
- no cambiar shapes de respuesta sin actualizar frontend,
- no mezclar errores de auth con errores de negocio,
- no exponer fields internos innecesarios al buyer,
- no exponer secretos o paths internos sensibles.
```

---
