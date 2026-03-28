
# Archivo: `/docs/decisions/adr-summary.md`

```md
# ADR Summary

## ADR-001 — Runtime con Docker en EC2
Se elige Docker directo en EC2 en lugar de Kubernetes/EKS/Fargate para mantener costos y complejidad bajos.

## ADR-002 — Proxy custom en Node.js
Se elige un proxy custom en Node.js en vez de Envoy para reducir complejidad operativa en MVP.

## ADR-003 — Vault self-hosted en el mismo EC2
Se elige HashiCorp Vault en Docker por costo y control, aceptando como tradeoff el uso de root token y unseal manual en MVP.

## ADR-004 — Phantom token único por sesión
Se usa un solo phantom token para todos los campos de credenciales, simplificando runtime y proxy.

## ADR-005 — SSE en vez de WebSockets
Se usa SSE porque el flujo es server → client, sobre HTTP estándar y con menor complejidad de infra.

## ADR-006 — Código fuente en S3
El source zip vive temporalmente en S3 para desacoplar el build de la máquina EC2.

## ADR-007 — Control de acceso en aplicación
El backend usa service key de Supabase y aplica ownership/authz desde la aplicación en lugar de depender de RLS en ese camino.

## ADR-008 — Buyer-facing logs simplificados
Solo mensajes `PROGRESS:` llegan al buyer para mantener UX no técnica.
```

---