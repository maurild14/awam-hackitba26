
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