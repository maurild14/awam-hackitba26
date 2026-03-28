
# Archivo: `/docs/config/environment-variables.md`

```md
# Environment Variables

## Estado implementado en M1
- Backend usa de forma obligatoria solo `NODE_ENV` y `PORT`.
- Frontend usa de forma obligatoria solo `NEXT_PUBLIC_API_URL`.
- Proxy usa de forma obligatoria solo `NODE_ENV` y `PORT`.
- El resto de variables listadas abajo forman parte de la superficie futura del MVP y pueden quedar vacías en M1.

## Backend
Variables esperadas:
- `NODE_ENV`
- `PORT`
- `FRONTEND_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `UPSTASH_REDIS_URL`
- `UPSTASH_REDIS_TOKEN`
- `VAULT_URL`
- `VAULT_TOKEN`
- `MP_ACCESS_TOKEN`
- `MP_WEBHOOK_SECRET`
- `AWS_REGION`
- `ECR_REGISTRY`
- `S3_BUCKET_SOURCE`
- `GITHUB_TOKEN`
- `INTERNAL_API_TOKEN`

## Frontend
Variables públicas:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_MP_PUBLIC_KEY`

## Proxy
Variables de proceso para desarrollo local:
- `NODE_ENV`
- `PORT`

Variables inyectadas por sesión:
- `SESSION_ID`
- `PHANTOM_TOKEN`
- `VAULT_URL`
- `VAULT_TOKEN`
- `ALLOWED_DOMAINS`
- `SERVICE_ROUTES`

## Reglas
- `SUPABASE_SERVICE_KEY`, `VAULT_TOKEN`, `MP_ACCESS_TOKEN`, `GITHUB_TOKEN`, `INTERNAL_API_TOKEN` nunca van al cliente.
- Las variables del proxy no se configuran manualmente en infra permanente; las define el orquestador por sesión.
- No introducir nuevos secretos sin documentar scope, owner y lugar de uso.
```

---
