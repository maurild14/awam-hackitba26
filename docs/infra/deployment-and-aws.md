

# Archivo: `/docs/infra/deployment-and-aws.md`

```md
# Deployment and AWS

## Infra base del MVP

### Frontend
- Next.js 14 en Vercel.

### Backend y runtime
- EC2 `t3.small` con Ubuntu 22.04.
- Nginx al frente.
- PM2 para proceso Node.js.
- Docker Engine en el mismo host.
- Vault en contenedor local.

### Almacenamiento auxiliar
- S3 para source zips,
- ECR para imágenes,
- CloudWatch para logs.

## Nginx
Responsabilidades:
- redirect 80 → 443,
- certificados Let's Encrypt,
- reverse proxy a `localhost:3001`,
- configuración especial para SSE sin buffering.

## PM2
Responsabilidades:
- restart on crash,
- arranque con sistema,
- logs y monitoreo básico,
- posible cluster futuro.

## S3
Uso:
- almacenar temporalmente código fuente subido por sellers,
- lifecycle cleanup automático.

## ECR
Repositorios:
- `marketplace-proxy`
- `bots`

## GitHub Actions
Usos:
- build de imágenes de agentes,
- push a ECR,
- callback interno al backend.

## Qué no hacer sin revisar impacto
- mover Vault a un servicio externo sin revisar costos y trust boundaries,
- separar runtime del backend host sin rediseñar Docker/Vault/proxy,
- cambiar el flujo de build sin actualizar contrato seller + callbacks internos.
```

---