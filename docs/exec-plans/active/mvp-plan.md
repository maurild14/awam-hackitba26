# MVP Execution Plan

## Contexto
Este repo hoy está mayormente en fase de documentación: `backend/`, `frontend/`, `proxy/` e `infrastructure/` todavía no tienen implementación activa. Por eso este plan propone un orden de construcción desde cero, priorizando siempre:

1. seguridad del buyer,
2. aislamiento del runtime,
3. consistencia entre API, datos y frontend,
4. claridad de los flujos buyer/seller/admin,
5. simplicidad operativa del MVP.

## Principios de ejecución
- No implementar features cosméticas antes del flujo seguro end-to-end.
- Mantener pagos como `dummy` hasta que se habilite una integración real.
- No guardar credenciales reales en PostgreSQL ni en logs, incluso durante etapas con mocks.
- Diseñar adapters desde el inicio para poder reemplazar mocks por implementaciones reales sin rehacer contratos.
- Cerrar primero el camino "happy path" completo y luego endurecer.

## Qué mockear primero
Los mocks iniciales deben existir para destrabar frontend, backend y UX antes de activar infraestructura sensible:

1. `paymentProvider` dummy
   Debe crear una preferencia simbólica y permitir estados `approved` o `rejected` sin hablar con MercadoPago real.
2. `buildPipeline` dummy
   Debe simular upload, build, scan y callback interno para que seller/admin puedan avanzar sin GitHub Actions ni ECR reales.
3. `secretStore` adapter en memoria
   Debe comportarse como Vault en interfaz, pero sin persistir secretos en DB. Sirve para validar formularios, lifecycle y cleanup.
4. `sandboxRunner` dummy
   Debe emitir transición de estados, logs `PROGRESS:` y resumen final sin Docker real.
5. `streamEmitter` dummy
   Debe alimentar SSE desde el runner mock para validar la UX de seguimiento en tiempo real.

El criterio es simple: primero mockear integraciones externas y runtime; no mockear contratos del dominio. Los estados, shapes JSON, reglas de acceso y lifecycle deben ser reales desde la primera versión.

## Dependencias entre milestones
- M1 no depende de ningún otro milestone.
- M2 depende de M1.
- M3 depende de M1 y M2.
- M4 depende de M2 y M3.
- M5 depende de M2, M3 y M4.
- M6 depende de M3 y M5.
- M7 depende de M5 y M6.
- M8 depende de M7.
- M9 depende de M8 y cruza hardening sobre todo lo anterior.

## Milestones

### M1. Foundation técnica y contratos base
**Objetivo**
Levantar la base del monorepo para que frontend, backend, proxy e infra puedan evolucionar con contratos estables.

**Incluye**
- scaffolding de `frontend`, `backend`, `proxy` e `infrastructure`,
- estrategia de configuración por entorno,
- convenciones de errores JSON,
- constantes y enums compartidos para roles y estados de negocio,
- base de CI para lint/test/typecheck/build,
- healthchecks y smoke checks mínimos.

**Definition of done**
- El repo arranca con apps vacías pero ejecutables en desarrollo.
- Existe manejo de configuración coherente con `docs/config/environment-variables.md`.
- Los estados documentados para `bots`, `sessions` y `payments` están centralizados y no duplicados.
- Hay una convención única de respuesta de error y logging sanitizado.
- Cualquier miembro del equipo puede clonar, instalar y arrancar el workspace sin decisiones implícitas.

### M2. Auth, perfiles, roles y modelo de datos base
**Objetivo**
Implementar identidad y persistencia para que el sistema pueda distinguir buyer, seller y admin, y sostener los ciclos de vida del marketplace.

**Incluye**
- integración de auth con Supabase,
- bootstrap de `profiles`,
- middlewares de auth y rol en backend,
- schema inicial para `profiles`, `bots`, `sessions`, `execution_logs`, `payments`, `reviews`,
- ownership checks a nivel aplicación,
- seeds o fixtures mínimas para desarrollo.

**Definition of done**
- Un usuario puede registrarse, iniciar sesión y obtener su perfil con rol.
- El backend valida JWT y aplica autorización por ownership/rol.
- El schema respeta los estados y campos documentados en `docs/data/schema-and-lifecycle.md`.
- Los secretos todavía no existen en DB ni en campos temporales.
- Quedan listas las bases para que frontend y backend trabajen sobre IDs, estados y relaciones reales.

### M3. Marketplace público y panel seller con metadata real
**Objetivo**
Habilitar el lado visible del marketplace y la creación de bots por parte del seller, usando metadata real aunque el runtime todavía sea mockeado.

**Incluye**
- landing y listado público de bots `published`,
- detalle público por `slug` o `id`,
- panel seller para crear y editar bots propios,
- captura y validación de `credential_schema`, `allowed_domains` y `resources`,
- flujo admin básico para mover bots entre `draft`, `pending_review`, `published`, `suspended`.

**Definition of done**
- Un seller autenticado puede crear un bot con toda la metadata requerida por el contrato.
- Un admin puede aprobar, publicar o suspender un bot.
- El marketplace solo expone bots `published`.
- El detalle del bot comunica claramente precio, capacidades, credenciales requeridas y mensaje de confianza.
- La metadata del bot ya tiene el shape que usarán luego build, proxy, runtime y checkout.

### M4. Checkout y pagos dummy coordinados con el dominio
**Objetivo**
Cerrar el paso de intención de compra y registro de pago sin depender todavía de MercadoPago real.

**Incluye**
- endpoint `create-preference` dummy,
- webhook o callback dummy autenticado,
- estado de `payments`,
- UI de checkout,
- coordinación entre buyer, bot y pago aprobado/rechazado.

**Definition of done**
- Un buyer autenticado puede iniciar checkout desde un bot publicado.
- El sistema registra un `payment` con `amount_ars`, comisión y estado consistente.
- El frontend refleja claramente si el pago simbólico fue aprobado o rechazado.
- No se crea una ejecución final ni se cobra de forma irreversible cuando el flujo no está listo.
- La interfaz del provider dummy es intercambiable por MercadoPago real más adelante.

### M5. Sesiones, credenciales y ejecución simulada end-to-end
**Objetivo**
Cerrar el flujo completo buyer-facing antes del runtime real: pago aprobado, carga de credenciales, sesión, progreso y resultado.

**Incluye**
- creación de sesión posterior a pago aprobado,
- formulario dinámico desde `credential_schema`,
- `secretStore` mock con misma interfaz que Vault,
- `sandboxRunner` mock con transición de estados,
- persistencia de logs buyer-facing y resumen final,
- endpoint SSE con `streamEmitter` mock,
- dashboard buyer e historial básico.

**Definition of done**
- Un buyer puede completar el flujo completo desde marketplace hasta resumen final usando solo componentes del sistema.
- Las credenciales ingresadas nunca terminan en PostgreSQL, aunque todavía usen storage mock.
- La sesión recorre estados válidos (`initializing`, `running`, `completed`, `failed`, `timed_out`, `stopped` según corresponda).
- La UI muestra mensajes `PROGRESS:` legibles y estados no técnicos.
- Existe cleanup lógico de secretos/tokens mock al finalizar o fallar la sesión.

### M6. Ingesta de código del seller y pipeline de build real
**Objetivo**
Reemplazar el build simulado por un camino real de publicación de imágenes, manteniendo estable la UX del seller.

**Incluye**
- upload de source zip a S3,
- validaciones mínimas de estructura y `Dockerfile`,
- workflow de GitHub Actions para build,
- escaneo con Trivy,
- push a ECR,
- callback interno autenticado al backend,
- asociación de `image_tag` e información de build al bot.

**Definition of done**
- Un seller puede subir código fuente y disparar un build real desde su bot.
- El backend recibe callbacks internos autenticados con `INTERNAL_API_TOKEN`.
- Un build exitoso deja al bot listo para ser ejecutado por imagen en ECR.
- Un build fallido deja trazabilidad entendible para seller y admin, sin filtrar detalles sensibles.
- El mock de build puede retirarse sin romper el resto del dominio.

### M7. Vault, Redis, proxy y phantom token reales
**Objetivo**
Implementar el núcleo de seguridad que sustituye credenciales reales por phantom tokens y obliga el paso por proxy.

**Incluye**
- `vaultService` real,
- almacenamiento efímero y cleanup de secretos,
- registro/invalidación de phantom token en Redis,
- proxy custom en Node.js,
- validación en tiempo constante del phantom token,
- enforcement de `allowed_domains` y `SERVICE_ROUTES`,
- sanitización estricta de logs.

**Definition of done**
- Las credenciales reales viven temporalmente en Vault y no en la DB.
- El agente solo recibe phantom tokens y `PROXY_URL`.
- El proxy rechaza dominios y rutas fuera de allowlist.
- Los logs no exponen secretos, `Authorization`, phantom tokens ni secretos internos.
- El sistema puede demostrar, con pruebas y observabilidad, que el path agente -> proxy -> upstream respeta el diseño documentado.

### M8. Runtime real en Docker con cleanup y control de capacidad
**Objetivo**
Reemplazar la ejecución simulada por el sandbox real documentado para cada sesión.

**Incluye**
- pull de imágenes desde ECR,
- creación de red Docker interna `Internal=true`,
- arranque del proxy y luego del agente,
- inyección de `PROXY_URL` y phantom token,
- límites de CPU, memoria, `pids`, `read-only filesystem`, `cap-drop ALL`, `no-new-privileges`,
- watchdog de timeout,
- streaming de logs del contenedor,
- cleanup obligatorio de contenedores, red, Vault y Redis,
- rechazo preventivo por falta de capacidad.

**Definition of done**
- Una sesión aprobada puede ejecutarse de punta a punta sobre Docker real sin egress directo del agente.
- El proxy tiene salida a internet y el agente no.
- Las restricciones documentadas del contenedor del agente están aplicadas y verificadas.
- Un timeout, fallo o cancelación deja el sistema limpio: sin contenedores huérfanos, sin red interna, sin secreto en Vault y sin phantom token válido.
- El sistema rechaza nuevas ejecuciones si no hay capacidad suficiente antes de “cobrar” o iniciar.

### M9. UX final de operación, reviews, admin y hardening
**Objetivo**
Terminar el MVP operable y presentable, con observabilidad, paneles mínimos y endurecimiento final.

**Incluye**
- dashboard buyer con historial y detalle de sesión,
- vista seller de ejecuciones con buyer anonimizado,
- reviews una por sesión,
- panel admin básico de revisión y suspensión,
- hardening de errores, logs y copy,
- runbooks aterrizados a la implementación real,
- pruebas end-to-end del flujo completo,
- observabilidad mínima para backend, builds y runtime.

**Definition of done**
- Buyer, seller y admin pueden completar sus flujos críticos sin exponer detalles internos del runtime.
- Solo los mensajes buyer-facing adecuados llegan al buyer; los logs operativos quedan separados.
- Existe cobertura de pruebas para el happy path y para fallos críticos de cleanup, timeout, auth y proxy.
- Los runbooks alcanzan para operar el MVP en incidentes previsibles.
- El equipo puede hacer una demo end-to-end consistente con la propuesta de valor del producto.

## Riesgos técnicos mayores

### 1. Aislamiento incompleto del runtime
Si la red Docker o las flags del contenedor quedan mal configuradas, el agente podría ganar egress directo o privilegios innecesarios.

### 2. Filtrado accidental de secretos
El punto de mayor riesgo no es solo la DB, sino logs, errores, callbacks, stdout del proxy y payloads de debugging.

### 3. Desacople débil entre mocks y servicios reales
Si payment/build/secret store/runner mockean demasiado “por arriba”, el reemplazo por implementaciones reales puede romper el frontend o el dominio.

### 4. Complejidad del lifecycle de sesión
Los estados `payment -> session -> runtime -> cleanup -> review` cruzan varios subsistemas. Un desacople pobre puede dejar sesiones huérfanas o inconsistentes.

### 5. Cleanup parcial en fallos
La secuencia de limpieza toca Docker, Vault, Redis y DB. Si falla una parte, pueden quedar secretos, tokens o recursos huérfanos.

### 6. SSE y progreso no confiables
Si el streaming cae o el runner no emite mensajes claros, la UX del buyer se vuelve opaca aunque la ejecución funcione.

### 7. Pipeline de build demasiado frágil para sellers
Si el contrato de publicación no se valida bien o los errores son crípticos, el seller no podrá publicar bots sin soporte manual intensivo.

### 8. Sobrecarga operativa en un solo host
Backend, Vault, Docker y runtime comparten EC2 en el MVP. Sin límites y chequeos de capacidad, una carga moderada puede degradar toda la plataforma.

### 9. Seguridad de callbacks internos
Los webhooks dummy hoy y los callbacks de build mañana son puntos sensibles. Si se autentican mal, se pueden falsificar estados de pagos o builds.

## Secuencia recomendada de entregas internas
- Entrega 1: M1 + M2
- Entrega 2: M3 + M4
- Entrega 3: M5
- Entrega 4: M6
- Entrega 5: M7 + M8
- Entrega 6: M9

## Criterio de salida del MVP
El MVP puede considerarse implementado cuando exista un flujo real y demostrable donde:

1. un seller publica un agente con metadata válida y build exitoso,
2. un buyer descubre el agente, realiza un pago dummy aprobado y carga credenciales,
3. la plataforma ejecuta el agente en sandbox aislado con proxy y phantom token,
4. el buyer sigue el progreso por SSE y recibe un resumen final,
5. el sistema limpia secretos y recursos efímeros al terminar,
6. seller y admin tienen visibilidad suficiente para operar el ciclo sin exponer secretos ni detalles internos al buyer.
