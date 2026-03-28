# Archivo: `/docs/api/rest-contract.md`

```md
# REST Contract

## Auth
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

### Contrato minimo de M2
- `register`: `{ email, password, username, role }`
- `login`: `{ email, password }`
- `refresh`: usa cookies `httpOnly`, sin body
- `logout`: usa cookies `httpOnly`, sin body
- `me`: devuelve `{ user: { id, email, username, role } }`

## Bots
Debe cubrir, como minimo:
- listado publico de bots published,
- detalle publico por slug/id,
- creacion de bot por seller,
- edicion de bot propio,
- suspension/publicacion por admin,
- endpoints de upload/build si se exponen desde backend.

### Contrato minimo de M3
- `GET /api/v1/bots`
  - devuelve `{ bots: [...] }`
  - solo expone bots con `status = published`
- `GET /api/v1/bots/:botRef`
  - resuelve por `slug` o `id`
  - devuelve `{ bot: ... }`
  - solo expone bots con `status = published`
- `GET /api/v1/seller/bots`
  - devuelve `{ bots: [...] }`
  - requiere sesion seller
- `GET /api/v1/seller/bots/:botId`
  - devuelve `{ bot: ... }`
  - requiere sesion seller y ownership
- `POST /api/v1/seller/bots`
  - requiere sesion seller
  - body minimo:
    - `title`
    - `description`
    - `price_ars`
    - `category`
    - `image_uri` opcional
    - `credential_schema`
    - `allowed_domains`
    - `resources`
    - `status` opcional solo `draft` o `pending_review`
- `PATCH /api/v1/seller/bots/:botId`
  - requiere sesion seller y ownership
  - usa el mismo shape de metadata que create
  - el seller no puede setear `published` ni `suspended`
- `GET /api/v1/admin/bots`
  - requiere sesion admin
  - devuelve `{ bots: [...] }`
- `PATCH /api/v1/admin/bots/:botId/status`
  - requiere sesion admin
  - body: `{ status }`
  - acepta `draft`, `pending_review`, `published`, `suspended`

## Payments
- `POST /api/v1/payments/create-preference`
- `POST /api/v1/payments/webhook`
- endpoint de consulta de estado si el frontend lo necesita

## Sessions
Debe cubrir:
- crear sesion luego del pago,
- enviar credenciales,
- iniciar ejecucion mock,
- consultar historial de buyer,
- consultar sesiones del seller con buyer anonimizado,
- detener sesion si el producto lo permite.

### Contrato minimo de M5
- `POST /api/v1/sessions`
  - requiere sesion buyer
  - body: `{ payment_id, credentials }`
  - valida que el `payment` exista, pertenezca al buyer, este `approved` y todavia no tenga sesion
  - valida `credentials` contra `bot.credential_schema`
  - devuelve `{ session: ... }`
- `GET /api/v1/sessions`
  - requiere sesion buyer
  - devuelve `{ sessions: [...] }`
  - expone historial basico buyer-facing
- `GET /api/v1/sessions/:sessionId`
  - requiere sesion buyer y ownership
  - devuelve `{ session: ... }`
  - incluye logs buyer-facing y `summary`

## Streaming
- `GET /api/v1/sessions/:sessionId/stream`
  - requiere sesion buyer y ownership
  - emite eventos SSE buyer-facing `ready`, `status`, `log` y `summary`

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
