
# Archivo: `/docs/operations/runbooks.md`

```md
# Runbooks

## 1. Backend caído
- verificar PM2,
- revisar logs,
- validar Nginx ↔ backend,
- confirmar variables de entorno.

## 2. Vault sealed
- hacer unseal manual,
- verificar que backend y proxy recuperan conectividad,
- confirmar que nuevas sesiones pueden persistir secretos.

## 3. Build fallido de agente
- revisar workflow de GitHub Actions,
- revisar Trivy,
- revisar Dockerfile seller,
- notificar al seller con error entendible.

## 4. Capacidad agotada
- no iniciar nuevas sesiones,
- responder con error claro,
- nunca cobrar si no hay capacidad disponible.

## 5. Cleanup parcial
- verificar si quedaron:
  - contenedores,
  - red interna,
  - secreto en Vault,
  - clave phantom en Redis.
- forzar cleanup y dejar trazabilidad.

## 6. Incidente de seguridad
- suspender agente o seller si corresponde,
- preservar logs sanitizados,
- revisar dominios intentados,
- revisar callbacks internos,
- revisar si hubo exposición de secretos.
```

---