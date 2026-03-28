
# Archivo: `/docs/config/index.md`

```md
# Config Index

## Qué cubre esta sección
Lista las variables de entorno y qué responsabilidad tiene cada una.

## Leer según la tarea
- variables completas: `environment-variables.md`

## Regla crítica
Distinguir siempre:
- variables públicas del frontend,
- secretos del backend,
- variables efímeras inyectadas al proxy.
```

---

# Archivo: `/docs/config/environment-variables.md`

```md
# Environment Variables

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