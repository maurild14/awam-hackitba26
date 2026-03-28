
# Archivo: `/docs/architecture/sandbox-runtime.md`

```md
# Sandbox Runtime

## Objetivo
Ejecutar agentes de terceros de forma aislada, con recursos limitados y sin exponer credenciales reales.

## Responsabilidad del sandboxService
- crear runtime,
- autenticarse con ECR y hacer pull de la imagen,
- crear red interna,
- crear y arrancar proxy,
- crear y arrancar agente,
- monitorear logs,
- aplicar timeout,
- limpiar recursos al finalizar.

## Secuencia de creación
1. pull de la imagen del agente desde ECR,
2. creación de red Docker interna `session-{id}` con `Internal=true`,
3. creación del contenedor del proxy,
4. inspección para obtener IP interna del proxy,
5. creación del contenedor del agente con `PROXY_URL` y phantom token,
6. actualización de estado de sesión,
7. monitoreo asíncrono.

## Restricciones del contenedor del agente
- filesystem read-only,
- `cap-drop ALL`,
- `no-new-privileges`,
- `pids-limit 50`,
- límites de CPU y memoria según `resources`,
- sin acceso directo a internet,
- solo conectado a la red interna de la sesión.

## Restricciones del contenedor del proxy
- acceso a la red interna de la sesión,
- acceso a internet por bridge default,
- recursos mínimos dedicados,
- acceso a Vault vía `host.docker.internal`.

## Monitoreo de ejecución
- streaming de logs del contenedor,
- solo líneas con prefijo `PROGRESS:` son mensajes buyer-facing,
- watchdog de timeout según `maxMinutes`.

## Limpieza obligatoria
1. stop/remove agente,
2. stop/remove proxy,
3. remove red interna,
4. delete credentials en Vault,
5. invalidar phantom token en Redis,
6. persistir estado final,
7. emitir evento final SSE.

## Capacidad operativa del MVP
La capacidad es limitada. El sistema debe rechazar ejecuciones nuevas si no hay recursos suficientes, en vez de cobrar y fallar después.

## Anti-patrones
- persistir runtime después de completar,
- reutilizar credenciales entre sesiones,
- compartir red o token entre sesiones,
- permitir acceso directo del agente a internet.
```

---