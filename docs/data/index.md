
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