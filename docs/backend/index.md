
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