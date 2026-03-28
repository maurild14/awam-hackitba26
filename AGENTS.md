# Archivo: `/AGENTS.md`

```md

## Propósito del repositorio
Este repositorio implementa un marketplace de dos lados para agentes de inteligencia artificial (es un marketplace estilo Fiverr pero para agentes de IA)

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