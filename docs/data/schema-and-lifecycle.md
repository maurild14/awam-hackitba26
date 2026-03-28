
# Archivo: `/docs/data/schema-and-lifecycle.md`

```md
# Schema and Lifecycle

## profiles
Extiende la identidad de Supabase Auth con:
- `username`
- `role`
- `mp_customer_id`
- `created_at`

## bots
Campos clave:
- `seller_id`
- `title`
- `description`
- `price_ars`
- `category`
- `image_uri`
- `image_tag`
- `status`
- `allowed_domains`
- `credential_schema`
- `resources`
- `total_executions`
- `average_rating`

### Estados de `bots`
- `draft`
- `pending_review`
- `published`
- `suspended`

## sessions
Campos clave:
- `bot_id`
- `buyer_id`
- `payment_id`
- `status`
- `container_id`
- `proxy_container_id`
- `vault_path`
- `phantom_token_hash`
- `started_at`
- `completed_at`
- `error_message`
- `summary`

### Estados de `sessions`
- `initializing`
- `running`
- `completed`
- `failed`
- `stopped`
- `timed_out`

## execution_logs
Buyer-facing y operativos, pero sin secretos.

## payments
Campos clave:
- `session_id`
- `buyer_id`
- `bot_id`
- `mp_payment_id`
- `mp_preference_id`
- `amount_ars`
- `commission_ars`
- `status`
- `paid_at`

### Estados de `payments`
- `pending`
- `approved`
- `rejected`
- `refunded`

## reviews
Una review por sesión.

## Índices importantes
- `bots(status)`
- `bots(category)`
- `bots(seller_id)`
- `sessions(buyer_id)`
- `sessions(status)`
- `execution_logs(session_id, created_at)`
- `payments(buyer_id)`
- `reviews(bot_id)`

## Trigger importante
La puntuación promedio del bot se recalcula al insertar reviews.

## Regla crítica
Nunca reemplazar la separación:
- DB para metadata y estado,
- Vault para secretos,
- Redis para estado efímero y coordinación rápida.
```

---