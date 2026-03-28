
# Archivo: `/docs/architecture/index.md`

```md
# Architecture Index

## Qué cubre esta sección
Explica cómo está armado el sistema técnicamente y qué componentes participan en la ejecución de una sesión.

## Componentes principales
- frontend Next.js en Vercel,
- backend Node.js/Express en EC2,
- Supabase/PostgreSQL,
- Upstash Redis,
- HashiCorp Vault,
- proxy de credenciales en contenedor propio,
- agente del seller en contenedor efímero,
- Docker daemon en EC2,
- ECR para imágenes,
- GitHub Actions para builds,
- MercadoPago para pagos (Por el momento deshabilitado tiene que ser dummy),
- SSE para progreso.

## Principio de diseño
El agente nunca debe ver la credencial real del buyer.

## Leer según la tarea
- visión general: `system-overview.md`
- runtime y lifecycle: `sandbox-runtime.md`
- proxy y phantom token: `proxy-and-phantom-token.md`

## Reglas críticas
- el agente no tiene egress directo,
- el proxy sí puede salir a internet,
- la red interna de la sesión existe solo para comunicación agente ↔ proxy,
- Vault vive en loopback del host,
- el cleanup elimina red, contenedores, token y secretos.
```

---