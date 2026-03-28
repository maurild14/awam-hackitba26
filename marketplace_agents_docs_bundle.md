# Bundle completo de documentación para `AGENTS.md` y estructura de docs

Este bundle transforma el PRD del marketplace de agentes de IA en una documentación operativa pensada para **Codex / agentes de desarrollo**, con una estructura de `AGENTS.md` corto pero fuerte, más una base de `docs/` indexada y navegable.

La idea es que:

- `AGENTS.md` sea la **puerta de entrada** del agente.
- `docs/.../index.md` sea el **mapa por dominio**.
- los archivos temáticos sean la **fuente de verdad operativa** para cambios concretos.

---

## Estructura recomendada del repositorio

```text
/
├─ AGENTS.md
├─ frontend/
├─ backend/
├─ proxy/
├─ infrastructure/
├─ .github/
│  └─ workflows/
└─ docs/
   ├─ README.md
   ├─ product/
   │  ├─ index.md
   │  ├─ vision-and-business.md
   │  ├─ personas-and-scope.md
   │  └─ marketplace-flows.md
   ├─ architecture/
   │  ├─ index.md
   │  ├─ system-overview.md
   │  ├─ sandbox-runtime.md
   │  └─ proxy-and-phantom-token.md
   ├─ backend/
   │  ├─ index.md
   │  └─ application-structure.md
   ├─ frontend/
   │  ├─ index.md
   │  └─ views-and-rendering.md
   ├─ data/
   │  ├─ index.md
   │  └─ schema-and-lifecycle.md
   ├─ api/
   │  ├─ index.md
   │  └─ rest-contract.md
   ├─ security/
   │  ├─ index.md
   │  └─ threat-model.md
   ├─ infra/
   │  ├─ index.md
   │  └─ deployment-and-aws.md
   ├─ config/
   │  ├─ index.md
   │  └─ environment-variables.md
   ├─ seller/
   │  ├─ index.md
   │  └─ agent-runtime-contract.md
   ├─ operations/
   │  ├─ index.md
   │  └─ runbooks.md
   ├─ roadmap/
   │  └─ index.md
   └─ decisions/
      ├─ index.md
      └─ adr-summary.md
```

---

# Archivo: `/AGENTS.md`

```md
# AGENTS.md

## Propósito del repositorio
Este repositorio implementa un marketplace de dos lados para agentes de inteligencia artificial.

- Los **buyers** descubren agentes, pagan por ejecución, cargan credenciales de forma segura y siguen el progreso en tiempo real.
- Los **sellers** publican agentes empaquetados en Docker y monetizan ejecuciones.
- La plataforma ejecuta cada agente en infraestructura propia, dentro de un sandbox aislado, sin exponer credenciales reales del comprador al código del vendedor.

El principio central del sistema es:

> **el código del vendedor nunca debe ver la credencial real del comprador**.

---

## Qué NO romper
Estas reglas son no negociables:

1. El contenedor del agente **no debe tener acceso directo a internet**.
2. Toda salida a APIs externas debe pasar por el **proxy de credenciales**.
3. El agente solo debe recibir **phantom tokens**, nunca secretos reales.
4. Las credenciales del comprador solo viven temporalmente en **Vault** y deben eliminarse al terminar la sesión.
5. Los logs nunca deben almacenar:
   - credenciales reales,
   - headers `Authorization`,
   - phantom tokens,
   - secretos del backend.
6. Ningún cambio debe relajar el aislamiento del sandbox sin documentarlo explícitamente.
7. El marketplace MVP no soporta:
   - browsers reales o headless,
   - GUI,
   - hardware,
   - credenciales que requieran firma criptográfica local como mTLS, wallets o AWS SigV4.

---

## Cómo pensar el sistema
Pensá la plataforma como 5 dominios principales:

- **product**: marketplace, compra, reviews, panel buyer/seller/admin.
- **architecture**: topología general, sandbox, proxy, phantom token, lifecycle.
- **security**: Vault, threat model, allowed domains, aislamiento, logs.
- **application**: frontend, backend, API, modelos de datos.
- **infra/ops**: EC2, Nginx, PM2, ECR, S3, GitHub Actions, runbooks.

---

## Orden recomendado para leer antes de tocar algo

### Si vas a tocar el comportamiento general del sistema
1. `docs/README.md`
2. `docs/architecture/index.md`
3. `docs/decisions/index.md`

### Si vas a tocar publicación o compra de agentes
1. `docs/product/index.md`
2. `docs/product/marketplace-flows.md`
3. `docs/api/rest-contract.md`
4. `docs/data/schema-and-lifecycle.md`

### Si vas a tocar ejecución, red o runtime
1. `docs/architecture/index.md`
2. `docs/architecture/sandbox-runtime.md`
3. `docs/architecture/proxy-and-phantom-token.md`
4. `docs/security/threat-model.md`
5. `docs/seller/agent-runtime-contract.md`

### Si vas a tocar credenciales, secretos o seguridad
1. `docs/security/index.md`
2. `docs/security/threat-model.md`
3. `docs/architecture/proxy-and-phantom-token.md`
4. `docs/config/environment-variables.md`

### Si vas a tocar frontend
1. `docs/frontend/index.md`
2. `docs/frontend/views-and-rendering.md`
3. `docs/product/marketplace-flows.md`
4. `docs/api/rest-contract.md`

### Si vas a tocar backend
1. `docs/backend/index.md`
2. `docs/backend/application-structure.md`
3. `docs/api/rest-contract.md`
4. `docs/data/schema-and-lifecycle.md`

### Si vas a tocar base de datos o queries
1. `docs/data/index.md`
2. `docs/data/schema-and-lifecycle.md`
3. `docs/api/rest-contract.md`

### Si vas a tocar deployment o CI/CD
1. `docs/infra/index.md`
2. `docs/infra/deployment-and-aws.md`
3. `docs/operations/runbooks.md`
4. `docs/config/environment-variables.md`

---

## Fuente de verdad por tema

### Producto
- `docs/product/index.md`
- `docs/product/marketplace-flows.md`

### Arquitectura
- `docs/architecture/system-overview.md`
- `docs/architecture/sandbox-runtime.md`
- `docs/architecture/proxy-and-phantom-token.md`

### Seguridad
- `docs/security/threat-model.md`

### Backend
- `backend/src/`
- `docs/backend/application-structure.md`

### Frontend
- `frontend/app/`
- `docs/frontend/views-and-rendering.md`

### API
- `docs/api/rest-contract.md`

### Datos
- `docs/data/schema-and-lifecycle.md`

### Infraestructura
- `infrastructure/`
- `docs/infra/deployment-and-aws.md`

### Variables de entorno
- `docs/config/environment-variables.md`

### Contrato para sellers
- `docs/seller/agent-runtime-contract.md`

---

## Reglas de implementación

### Cambios aceptables
- refactors internos sin cambiar contratos públicos,
- mejoras de validación,
- endurecimiento de seguridad,
- mejoras de logs sin exponer secretos,
- mejoras de performance sin alterar aislamiento.

### Cambios sensibles
Antes de implementar, releé la documentación del dominio y dejá claro el impacto si cambiás:

- paths de API,
- nombres de variables de entorno,
- shape de `credential_schema`,
- shape de `resources`,
- estados de `sessions`, `payments` o `bots`,
- comportamiento del proxy,
- comportamiento del sandbox,
- flujo de limpieza de credenciales.

### Cambios prohibidos sin rediseño explícito
- acceso directo del agente a internet,
- exposición de secretos reales al contenedor del agente,
- persistencia de credenciales en PostgreSQL,
- desactivar cleanup de Vault o invalidación de phantom tokens,
- almacenar datos sensibles en logs,
- bypass del proxy.

---

## Validaciones mínimas antes de cerrar una tarea

### Para backend
- revisar middlewares afectados,
- verificar que no se rompió auth/roles,
- verificar que no se exponen secretos en errores o logs,
- validar shape de respuesta JSON.

### Para frontend
- verificar guards de sesión/rol,
- verificar estados loading/error,
- verificar flujos buyer/seller/admin,
- verificar que los componentes client/server sigan siendo coherentes.

### Para sandbox/proxy/security
- confirmar que el agente sigue sin egress directo,
- confirmar que el proxy valida token y dominio,
- confirmar que el cleanup elimina Vault + Redis + contenedores + red,
- confirmar que los logs no incluyen secretos.

### Para datos/API
- verificar índices o impacto de query si cambia acceso frecuente,
- mantener compatibilidad con estados del sistema,
- mantener consistencia entre base de datos, API y frontend.

---

## Qué asumir sobre los sellers
- Saben Docker a nivel básico.
- Deben proveer un `Dockerfile` funcional.
- Deben leer credenciales desde variables de entorno.
- Deben usar `PROXY_URL` para APIs externas.
- Deben emitir progreso legible con el prefijo `PROGRESS:`.

No diseñes features que dependan de soporte manual intensivo al seller en el MVP.

---

## Qué asumir sobre el buyer
- No es técnico.
- Necesita UX simple.
- No entiende contenedores, logs de sistema ni detalles de infraestructura.
- Solo debe ver mensajes de progreso legibles, resultados finales y estados claros.

No introduzcas UX que exponga detalles de implementación del runtime.

---

## Convenciones de documentación
- No dupliques conocimiento si ya existe un doc fuente.
- Los `index.md` resumen, priorizan y derivan.
- Los docs de detalle explican contratos, lifecycle, restricciones y riesgos.
- Si un cambio altera supuestos del PRD, actualizá también:
  - `docs/decisions/adr-summary.md`
  - el `index.md` del dominio afectado
  - y, si corresponde, este `AGENTS.md`.

---

## En caso de ambigüedad
Priorizar siempre, en este orden:

1. seguridad del comprador,
2. aislamiento del runtime,
3. consistencia de API/datos,
4. claridad del flujo buyer/seller,
5. simplicidad operativa del MVP.
```

---

# Archivo: `/docs/README.md`

```md
# Docs Index

## Qué contiene esta carpeta
Esta carpeta organiza la documentación operativa del marketplace de agentes de IA.

Su objetivo no es repetir el PRD palabra por palabra, sino transformarlo en una base de trabajo útil para desarrollo, debugging, cambios de arquitectura y ejecución por agentes.

## Mapa general
- `product/`: negocio, personas, flujos del marketplace y alcance.
- `architecture/`: visión técnica de extremo a extremo, runtime y componentes.
- `backend/`: estructura y responsabilidades del backend.
- `frontend/`: vistas, componentes y estrategia de renderizado.
- `data/`: esquema relacional, estados y lifecycle de entidades.
- `api/`: contratos REST y shape de requests/responses.
- `security/`: secretos, aislamiento, amenazas y mitigaciones.
- `infra/`: EC2, Nginx, PM2, ECR, S3 y deployment.
- `config/`: variables de entorno y configuración.
- `seller/`: contrato técnico que deben cumplir los agentes.
- `operations/`: runbooks de operación y respuesta.
- `roadmap/`: orden sugerido de implementación.
- `decisions/`: decisiones de diseño relevantes.

## Cómo navegar según la tarea
- Si necesitás entender el producto: empezar en `product/index.md`.
- Si necesitás tocar runtime, red o seguridad: empezar en `architecture/index.md` y `security/index.md`.
- Si necesitás implementar endpoints o cambios de datos: empezar en `api/index.md` y `data/index.md`.
- Si necesitás tocar deploy u operación: empezar en `infra/index.md` y `operations/index.md`.

## Principio general
Este sistema existe para permitir que un comprador use agentes de terceros sin entregar sus credenciales reales al seller.

Si una propuesta contradice eso, probablemente está mal.
```

---

# Archivo: `/docs/product/index.md`

```md
# Product Index

## Qué cubre esta sección
Esta sección define qué producto estamos construyendo, para quién, con qué alcance y con qué reglas de negocio.

## Resumen rápido
El producto es un marketplace de dos lados:

- **buyers** compran ejecuciones de agentes,
- **sellers** publican agentes empaquetados como software,
- la plataforma se encarga de pagos, ejecución, credenciales, logs y operación.

## Objetivo del MVP
Validar que existe demanda para comprar ejecuciones de agentes como servicio sin que el buyer tenga que instalar ni operar infraestructura.

## Reglas de negocio importantes
- El buyer paga por ejecución.
- El seller define el precio por ejecución en ARS.
- La plataforma cobra una comisión del 20%.
- El mercado inicial es Argentina / LatAm hispanohablante.
- La interfaz principal está en español.
- El método de pago principal es MercadoPago.

## Roles del sistema
- buyer
- seller
- admin

## Leer según la tarea
- visión y negocio: `vision-and-business.md`
- usuarios, alcance y exclusiones: `personas-and-scope.md`
- flujos buyer/seller/admin: `marketplace-flows.md`

## Riesgos de producto
- fricción por confianza en manejo de credenciales,
- fricción para sellers si el contrato técnico es confuso,
- sesiones fallidas si el agente no emite progreso claro,
- UX rota si el estado del pago y el estado de ejecución no están bien coordinados.
```

---

# Archivo: `/docs/product/vision-and-business.md`

```md
# Vision and Business

## Propuesta de valor
La plataforma conecta a desarrolladores que construyen agentes de IA con usuarios no técnicos que necesitan automatizar tareas sobre sus herramientas y cuentas.

El buyer no compra “código”, sino una **ejecución operativa**.
El seller no vende consultoría manual, sino un **agente ejecutado por la plataforma**.

## Problema central
El cuello de botella técnico del modelo es el manejo de credenciales.

Un buyer racional no quiere dar API keys o tokens a un seller desconocido. Por eso la plataforma debe ejecutar el agente dentro de infraestructura propia, aislada, con credenciales reales protegidas y sustituidas por tokens ficticios durante la ejecución.

## Modelo de ingresos
- el seller define `price_ars`,
- la plataforma cobra 20% de comisión,
- el payout al seller queda fuera del MVP en cuanto a automatización completa, pero el modelo económico lo contempla.

## Mercado objetivo inicial
- Argentina,
- resto de América Latina hispanohablante,
- UI en español,
- pesos argentinos,
- MercadoPago como integración principal.

## Criterios de éxito del MVP
- sellers pueden publicar agentes funcionales,
- buyers pueden descubrir, pagar, cargar credenciales y ejecutar,
- el runtime demuestra aislamiento real,
- la UX comunica seguridad con claridad,
- el proceso completo funciona de punta a punta.
```

---

# Archivo: `/docs/product/personas-and-scope.md`

```md
# Personas and Scope

## Buyers
Perfil:
- usuarios o empresas no técnicas,
- quieren automatizar tareas sobre Google Workspace, WhatsApp, OpenAI u otras APIs,
- necesitan seguridad, claridad y resultados.

Necesidades:
- descubrir agentes,
- entender qué hacen,
- pagar fácil,
- cargar credenciales de forma segura,
- seguir progreso,
- ver resultados e historial.

No deben ver:
- logs de infraestructura,
- IDs de contenedores,
- errores internos de sistema,
- detalles técnicos del runtime.

## Sellers
Perfil:
- desarrolladores o equipos técnicos,
- conocen Docker y al menos un lenguaje ejecutable en contenedor,
- quieren monetizar sin construir marketplace, pagos ni infra.

Necesidades:
- publicar agentes,
- declarar credenciales requeridas,
- declarar dominios permitidos,
- subir código,
- ver ejecuciones y logs,
- ver ingresos.

Requerimiento técnico mínimo:
- leer credenciales desde variables de entorno.

## Admins
Responsabilidades:
- revisar agentes,
- aprobar/rechazar publicación,
- suspender cuentas o agentes,
- monitorear sistema,
- revisar incidentes.

## Incluido en el MVP
- registro/login,
- marketplace,
- compra con MercadoPago Checkout Pro,
- formulario dinámico de credenciales,
- Vault,
- sandbox Docker,
- proxy con phantom token,
- SSE,
- historial de sesiones,
- panel seller básico,
- reseñas,
- panel admin básico.

## Excluido del MVP
- wallets, mTLS, AWS SigV4,
- reembolsos automáticos,
- disputas,
- multiidioma,
- app móvil nativa,
- suscripciones,
- Stripe,
- afiliados,
- browser real/headless,
- connection strings de BD como tipo soportado de credencial.
```

---

# Archivo: `/docs/product/marketplace-flows.md`

```md
# Marketplace Flows

## Flujo del buyer
1. descubre un agente en el marketplace,
2. entra al detalle,
3. inicia compra,
4. paga en MercadoPago,
5. vuelve al producto,
6. carga credenciales,
7. se crea la sesión,
8. el backend crea sandbox y runtime,
9. el buyer sigue el progreso por SSE,
10. ve el resumen final y luego puede dejar review.

## Flujo del seller
1. se registra como seller,
2. crea un agente,
3. define:
   - título,
   - descripción,
   - precio,
   - `credential_schema`,
   - `allowed_domains`,
   - `resources`,
4. sube su código fuente / Dockerfile,
5. se dispara build,
6. si el build y el escaneo pasan, la imagen se publica en ECR,
7. el agente queda publicable o publicado según revisión.

## Flujo de publicación
1. draft
2. pending_review
3. published
4. suspended si corresponde

## Flujo de ejecución
1. pago aprobado,
2. buyer envía credenciales,
3. backend las guarda en Vault,
4. backend genera phantom token,
5. backend crea proxy + agente + red interna,
6. se actualiza `sessions.status = running`,
7. se emiten logs y progreso,
8. al finalizar se limpia runtime y secretos,
9. la sesión queda en `completed`, `failed`, `timed_out` o `stopped`.

## Flujo de confianza
- la landing y el checkout deben explicar en lenguaje simple:
  - que el seller no recibe la credencial real,
  - que el agente corre aislado,
  - que las credenciales se eliminan al terminar.
```

---

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
- MercadoPago para pagos,
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

# Archivo: `/docs/architecture/proxy-and-phantom-token.md`

```md
# Proxy and Phantom Token

## Problema que resuelve
Necesitamos que el agente “crea” que tiene credenciales, sin entregarle la credencial real.

## Phantom token
Es un token ficticio, aleatorio, efímero y válido solo para:
- una sesión,
- un proxy local,
- un tiempo acotado.

No sirve contra la API real.

## Inyección al agente
El backend inyecta el mismo phantom token en todas las variables de entorno de credenciales que el seller declaró.

Además inyecta `PROXY_URL`.

Desde el punto de vista del agente, la interfaz es normal:
- lee env vars,
- hace requests HTTP,
- recibe respuestas del upstream.

## Responsabilidades del proxy
- validar phantom token,
- resolver ruta a servicio real,
- verificar dominio permitido,
- leer secreto real en Vault,
- reescribir request,
- reenviar a upstream,
- devolver respuesta al agente.

## SERVICE_ROUTES
Mapea prefijos internos a servicios upstream reales.

Ejemplo conceptual:
- `/google-sheets/*` → `sheets.googleapis.com`
- `/openai/*` → `api.openai.com`
- `/whatsapp/*` → `graph.facebook.com`

## Allowed domains
El proxy debe rechazar requests fuera de la allowlist declarada por el seller.

## Consideraciones de seguridad
- comparación en tiempo constante del token,
- no loguear tokens,
- no exponer secreto real al agente,
- mantener el secreto real en memoria el menor tiempo posible,
- rechazar rutas o dominios no declarados.

## Decisión importante del MVP
Se usa el mismo phantom token para todos los campos de credenciales de una sesión.
La selección del secreto correcto depende del path/route y del mapeo configurado.
```

---

# Archivo: `/docs/backend/index.md`

```md
# Backend Index

## Qué cubre esta sección
Describe la app Node.js/Express, su organización por dominios y los puntos donde vive la lógica central del sistema.

## Responsabilidades del backend
- auth y autorización,
- CRUD de bots,
- pagos,
- creación de sesiones,
- orquestación de sandbox,
- interacción con Vault,
- interacción con Docker,
- interacción con Redis,
- SSE,
- webhooks internos y externos.

## Leer según la tarea
- estructura interna: `application-structure.md`
- contratos HTTP: `../api/rest-contract.md`
- lifecycle de sesión y datos: `../data/schema-and-lifecycle.md`
- runtime: `../architecture/sandbox-runtime.md`

## Reglas críticas
- usar service role key solo en backend,
- aplicar control de acceso en middlewares y queries,
- nunca exponer secretos al cliente,
- mantener formato de error JSON consistente.
```

---

# Archivo: `/docs/backend/application-structure.md`

```md
# Backend Application Structure

## Estructura esperada

```text
backend/
├─ src/
│  ├─ index.js
│  ├─ config/
│  │  ├─ database.js
│  │  ├─ redis.js
│  │  ├─ vault.js
│  │  └─ docker.js
│  ├─ middleware/
│  │  ├─ auth.js
│  │  └─ errorHandler.js
│  ├─ routes/
│  │  ├─ auth.js
│  │  ├─ bots.js
│  │  ├─ sessions.js
│  │  ├─ payments.js
│  │  ├─ stream.js
│  │  └─ internal.js
│  ├─ services/
│  │  ├─ vaultService.js
│  │  ├─ dockerService.js
│  │  ├─ sandboxService.js
│  │  └─ mercadopagoService.js
│  └─ models/
│     ├─ bot.js
│     ├─ session.js
│     ├─ payment.js
│     ├─ review.js
│     └─ profile.js
```

## Regla de separación
- `routes/`: HTTP y validación superficial.
- `services/`: lógica de negocio/orquestación.
- `models/`: acceso a datos.
- `config/`: clients y adapters.
- `middleware/`: concerns transversales.

## Auth
El backend valida JWTs de Supabase y luego aplica middlewares de rol.

## Error handling
Toda respuesta de error debe ser consistente. No exponer stack traces ni detalles internos en producción.

## Dónde suele vivir la complejidad real
- `sandboxService.js`
- `vaultService.js`
- `payments.js` + `mercadopagoService.js`
- `stream.js`
```

---

# Archivo: `/docs/frontend/index.md`

```md
# Frontend Index

## Qué cubre esta sección
Describe la aplicación Next.js, la estrategia de renderizado y las vistas principales del marketplace.

## Responsabilidades del frontend
- landing,
- marketplace y detalle de bot,
- login/register,
- checkout,
- dashboard buyer,
- panel seller,
- panel admin,
- UI de progreso en tiempo real.

## Reglas importantes
- las vistas públicas deben priorizar SEO y claridad,
- las vistas interactivas deben ser client-side,
- la comunicación de seguridad es parte del producto, no solo del backend.

## Leer según la tarea
- detalles de páginas y renderizado: `views-and-rendering.md`
- flujos del usuario: `../product/marketplace-flows.md`
- contratos API: `../api/rest-contract.md`
```

---

# Archivo: `/docs/frontend/views-and-rendering.md`

```md
# Views and Rendering

## Estrategia de renderizado

### Server Components
- landing,
- marketplace,
- detalle del agente.

### Client Components
- auth,
- checkout,
- dashboard,
- seller panel,
- admin,
- session progress.

## Estructura esperada

```text
frontend/app/
├─ layout.tsx
├─ page.tsx
├─ marketplace/
│  ├─ page.tsx
│  └─ [slug]/page.tsx
├─ checkout/
│  └─ [botId]/page.tsx
├─ dashboard/
│  ├─ page.tsx
│  └─ sessions/[sessionId]/page.tsx
├─ seller/
│  ├─ page.tsx
│  ├─ new-bot/page.tsx
│  └─ bots/[botId]/page.tsx
├─ auth/
│  ├─ login/page.tsx
│  └─ register/page.tsx
├─ admin/page.tsx
└─ api/auth/callback/route.ts
```

## Componentes clave
- `BotCard`
- `CredentialsForm`
- `SessionProgress`
- `CheckoutFlow`

## UX que no se debe perder
- buyer siempre entiende en qué estado está,
- seguridad de credenciales explicada en lenguaje simple,
- progreso legible,
- errores con copy claro, no técnico.
```

---

# Archivo: `/docs/data/index.md`

```md
# Data Index

## Qué cubre esta sección
Explica el modelo de datos del marketplace y el lifecycle de las entidades más importantes.

## Entidades principales
- profiles
- bots
- sessions
- execution_logs
- payments
- reviews

## Principios
- los secretos no viven en PostgreSQL,
- `vault_path` es solo un puntero,
- el runtime efímero sí puede dejar trazas mínimas persistentes en `sessions` y `execution_logs`,
- el estado de negocio debe poder reconstruirse desde DB + Redis + logs.

## Leer según la tarea
- esquema y estados: `schema-and-lifecycle.md`
- endpoints que consumen este esquema: `../api/rest-contract.md`
```

---

# Archivo: `/docs/data/schema-and-lifecycle.md`

```md
# Schema and Lifecycle

## profiles
Extiende la identidad de Supabase Auth con:
- `username`
- `role`
- `mp_customer_id`
- `created_at`

## bots
Campos clave:
- `seller_id`
- `title`
- `description`
- `price_ars`
- `category`
- `image_uri`
- `image_tag`
- `status`
- `allowed_domains`
- `credential_schema`
- `resources`
- `total_executions`
- `average_rating`

### Estados de `bots`
- `draft`
- `pending_review`
- `published`
- `suspended`

## sessions
Campos clave:
- `bot_id`
- `buyer_id`
- `payment_id`
- `status`
- `container_id`
- `proxy_container_id`
- `vault_path`
- `phantom_token_hash`
- `started_at`
- `completed_at`
- `error_message`
- `summary`

### Estados de `sessions`
- `initializing`
- `running`
- `completed`
- `failed`
- `stopped`
- `timed_out`

## execution_logs
Buyer-facing y operativos, pero sin secretos.

## payments
Campos clave:
- `session_id`
- `buyer_id`
- `bot_id`
- `mp_payment_id`
- `mp_preference_id`
- `amount_ars`
- `commission_ars`
- `status`
- `paid_at`

### Estados de `payments`
- `pending`
- `approved`
- `rejected`
- `refunded`

## reviews
Una review por sesión.

## Índices importantes
- `bots(status)`
- `bots(category)`
- `bots(seller_id)`
- `sessions(buyer_id)`
- `sessions(status)`
- `execution_logs(session_id, created_at)`
- `payments(buyer_id)`
- `reviews(bot_id)`

## Trigger importante
La puntuación promedio del bot se recalcula al insertar reviews.

## Regla crítica
Nunca reemplazar la separación:
- DB para metadata y estado,
- Vault para secretos,
- Redis para estado efímero y coordinación rápida.
```

---

# Archivo: `/docs/api/index.md`

```md
# API Index

## Qué cubre esta sección
Documenta el contrato REST de la plataforma.

## Convenciones generales
- prefijo `/api/v1`
- JSON para request/response
- errores con shape consistente
- UUIDs como strings
- timestamps en ISO 8601 UTC

## Dominios de endpoints
- auth
- bots
- sessions
- payments
- stream
- internal

## Leer según la tarea
- contratos: `rest-contract.md`
- entidades persistidas: `../data/schema-and-lifecycle.md`
- flujos buyer/seller: `../product/marketplace-flows.md`
```

---

# Archivo: `/docs/api/rest-contract.md`

```md
# REST Contract

## Auth
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

## Bots
Debe cubrir, como mínimo:
- listado público de bots published,
- detalle público por slug/id,
- creación de bot por seller,
- edición de bot propio,
- suspensión/publicación por admin,
- endpoints de upload/build si se exponen desde backend.

## Payments
- `POST /api/v1/payments/create-preference`
- `POST /api/v1/payments/webhook`
- endpoint de consulta de estado si el frontend lo necesita

## Sessions
Debe cubrir:
- crear sesión luego del pago,
- enviar credenciales,
- iniciar ejecución,
- consultar historial de buyer,
- consultar sesiones del seller con buyer anonimizado,
- detener sesión si el producto lo permite.

## Streaming
- `GET /api/v1/sessions/:sessionId/stream`

## Internal
Endpoints internos para:
- callback de build de GitHub Actions,
- eventos internos autenticados con `INTERNAL_API_TOKEN`.

## Reglas de contrato
- no cambiar shapes de respuesta sin actualizar frontend,
- no mezclar errores de auth con errores de negocio,
- no exponer fields internos innecesarios al buyer,
- no exponer secretos o paths internos sensibles.
```

---

# Archivo: `/docs/security/index.md`

```md
# Security Index

## Qué cubre esta sección
Define el modelo de seguridad del MVP, sus límites y sus mitigaciones.

## Principio fundamental
El seller no debe recibir la credencial real del buyer.

## Mecanismos principales
- Vault para almacenar secretos,
- phantom token para sustituir credenciales reales,
- proxy obligatorio para egress,
- sandbox con restricciones de red y sistema,
- allowlist de dominios,
- limpieza estricta al finalizar,
- logs sanitizados,
- revisión manual de agentes y sistema de reseñas como mitigación complementaria.

## Leer según la tarea
- amenazas y mitigaciones: `threat-model.md`
- runtime/proxy: `../architecture/proxy-and-phantom-token.md`
- sandbox: `../architecture/sandbox-runtime.md`
- configuración sensible: `../config/environment-variables.md`

## Reglas que nunca deben romperse
- no secretos en DB,
- no secretos en logs,
- no internet directo desde el agente,
- no bypass del proxy,
- no reutilización de secretos entre sesiones.
```

---

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

# Archivo: `/docs/infra/index.md`

```md
# Infra Index

## Qué cubre esta sección
Describe la infraestructura del MVP y cómo se despliega y opera.

## Componentes principales
- Vercel para frontend,
- AWS EC2 t3.small para backend, Vault y Docker,
- Nginx,
- PM2,
- S3,
- ECR,
- GitHub Actions,
- CloudWatch.

## Leer según la tarea
- deployment y recursos AWS: `deployment-and-aws.md`
- variables sensibles: `../config/environment-variables.md`
- runbooks: `../operations/runbooks.md`

## Regla operativa
La simplicidad del MVP es intencional. No introducir complejidad tipo Kubernetes/EKS/Fargate sin necesidad real.
```

---

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

# Archivo: `/docs/seller/index.md`

```md
# Seller Integration Index

## Qué cubre esta sección
Explica qué contrato técnico debe cumplir un agente para correr en la plataforma.

## Objetivo
Reducir ambigüedad para sellers y para el runtime.

## Leer según la tarea
- contrato completo: `agent-runtime-contract.md`

## Regla principal
El seller no integra con la infraestructura interna. Integra con un contrato simple:
- Dockerfile,
- variables de entorno,
- `PROXY_URL`,
- progreso por stdout.
```

---

# Archivo: `/docs/seller/agent-runtime-contract.md`

```md
# Agent Runtime Contract

## Qué debe entregar un seller
- código fuente,
- `Dockerfile` válido en raíz,
- metadata del agente en el marketplace,
- `credential_schema`,
- `allowed_domains`,
- `resources`.

## Qué debe hacer el agente
1. iniciar como proceso principal del contenedor,
2. leer credenciales desde variables de entorno,
3. usar `PROXY_URL` como base para APIs externas,
4. terminar el proceso cuando complete la tarea,
5. emitir progreso legible con `PROGRESS:`.

## Qué no debe hacer
- hardcodear secretos,
- asumir internet directo,
- escribir secretos a disco,
- depender de GUI o navegador real,
- depender de credenciales basadas en firma local.

## Shape esperado de metadata

### credential_schema
Debe describir campos de credenciales requeridos para renderizar el formulario dinámico.

### allowed_domains
Debe listar explícitamente dominios upstream que el proxy puede contactar.

### resources
Debe incluir, como mínimo:
- CPU
- memoria
- tiempo máximo

## Ejemplo conceptual
Un agente que usa Google Sheets y OpenAI podría declarar:
- credenciales internas `GOOGLE_SHEETS_API_KEY`, `OPENAI_API_KEY`
- dominios permitidos `sheets.googleapis.com`, `api.openai.com`
- `PROGRESS:` para mensajes de negocio visibles al buyer.
```

---

# Archivo: `/docs/operations/index.md`

```md
# Operations Index

## Qué cubre esta sección
Documenta tareas operativas y runbooks del MVP.

## Casos operativos principales
- caída del backend,
- Vault sealed,
- build fallido,
- saturación de capacidad,
- SSE cortado,
- fallo de cleanup,
- incidente de seguridad.

## Leer según la tarea
- procedimientos: `runbooks.md`
```

---

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

# Archivo: `/docs/roadmap/index.md`

```md
# Roadmap Index

## Orden sugerido de implementación

### Sprint 1
- setup de frontend y backend base,
- auth con Supabase,
- modelo de datos base,
- marketplace público mínimo.

### Sprint 2
- CRUD seller de bots,
- upload de source zip,
- metadata de agente,
- integración inicial con S3/ECR.

### Sprint 3
- pipeline de build con GitHub Actions,
- validaciones de Dockerfile,
- escaneo con Trivy,
- actualización de estado del bot.

### Sprint 4
- MercadoPago Checkout Pro,
- webhook validado,
- creación de payments y coordinación con sesión.

### Sprint 5
- Vault,
- phantom token,
- proxy,
- sandbox runtime,
- ejecución end-to-end.

### Sprint 6
- SSE,
- UI de progreso,
- historial de sesiones,
- resumen final.

### Sprint 7
- reviews,
- panel admin,
- hardening, cleanup, observabilidad y polish.

## Regla de roadmap
No adelantar features cosméticas por delante del runtime seguro de punta a punta.
```

---

# Archivo: `/docs/decisions/index.md`

```md
# Decisions Index

## Qué cubre esta sección
Resume las decisiones de diseño más importantes del MVP.

## Leer según la tarea
- resumen de decisiones: `adr-summary.md`

## Principio
Cuando una decisión fue tomada para bajar complejidad del MVP, no revertirla “por prolijidad” sin un beneficio claro.
```

---

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

## Nota final de uso

Podés copiar este bundle tal cual y después separar cada bloque en su archivo correspondiente.

La secuencia práctica sería:

1. crear la carpeta `docs/` con la estructura propuesta,
2. pegar `AGENTS.md` en la raíz,
3. crear cada `index.md` y doc temático,
4. dejar el PRD original en `docs/` como referencia histórica,
5. usar este set como documentación operativa para Codex.
