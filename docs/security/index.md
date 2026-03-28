
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