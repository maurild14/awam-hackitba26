
# Archivo: `/docs/architecture/system-overview.md`

```md
# System Overview

## Capas del sistema

### Presentación
Frontend Next.js 14 desplegado en Vercel.

### Negocio
Backend Node.js + Express en EC2, detrás de Nginx.

### Datos
Supabase/PostgreSQL para datos persistentes y Upstash Redis para estado efímero, rate limiting y mensajería ligera.

### Seguridad
Vault para credenciales encriptadas + proxy con phantom token.

### Ejecución
Docker Engine en el EC2, imágenes en ECR, builds por GitHub Actions.

## Topología de red
- usuario → Vercel por HTTPS,
- Vercel / cliente → backend por HTTPS,
- backend → Supabase / Redis / ECR / MercadoPago por HTTPS,
- backend → Vault por loopback,
- backend → Docker por `docker.sock`,
- agente → proxy por HTTP en red interna,
- proxy → APIs externas por HTTPS.

## Intuición correcta
El sandbox no es “un contenedor”.
Cada ejecución es un mini entorno compuesto por:
- una red interna efímera,
- un contenedor de proxy,
- un contenedor de agente,
- estado de sesión en DB/Redis,
- un secreto temporal en Vault,
- un phantom token efímero.

## Dónde mirar código
- backend: `backend/src`
- proxy: `proxy/`
- frontend: `frontend/app`
- scripts infra: `infrastructure/`
```

---