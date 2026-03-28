
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
- MercadoPago Checkout Pro (No implementes eso de verdad, debe ser una dummy feature),
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