
# Archivo: `/docs/security/threat-model.md`

```md
# Threat Model

## Amenazas principales

### 1. Exfiltración de credenciales
Riesgo: que el seller intente obtener la credencial real del buyer.

Mitigaciones:
- secreto real en Vault,
- agente recibe phantom token,
- proxy reescribe requests,
- agente sin internet directo,
- cleanup al finalizar.

### 2. Conexión a dominios no autorizados
Riesgo: que el agente intente llamar a un endpoint malicioso.

Mitigaciones:
- `allowed_domains`,
- `SERVICE_ROUTES`,
- rechazo 403 en proxy,
- alertas si hay múltiples intentos.

### 3. Persistencia accidental de secretos
Riesgo: que credenciales queden en DB, logs o disco.

Mitigaciones:
- credenciales solo en Vault,
- logs sanitizados,
- lifecycle explícito de borrado,
- contenedor efímero y filesystem read-only del agente.

### 4. Escape o abuso del sandbox
Riesgo: acceso indebido al host o ampliación de privilegios.

Mitigaciones:
- `cap-drop ALL`,
- `no-new-privileges`,
- `pids-limit`,
- red restringida,
- runtime efímero.

### 5. Webhooks falsificados
Riesgo: falsificar eventos de MercadoPago o callbacks internos.

Mitigaciones:
- verificación de firma de MercadoPago,
- `INTERNAL_API_TOKEN` para callbacks internos.

### 6. Lectura excesiva de datos por backend
Riesgo: que el backend con service key exponga más de lo debido.

Mitigaciones:
- control de acceso a nivel de aplicación,
- middlewares de auth/rol,
- queries con ownership checks.

## Riesgos aceptados del MVP
- uso de root token de Vault,
- unseal manual de Vault,
- revisión manual de agentes como parte del control de confianza.

## Qué queda fuera del modelo del MVP
- navegación web real,
- firma criptográfica local,
- soporte de credenciales no HTTP,
- aislamiento multi-host más avanzado tipo Kubernetes/ECS.
```

---