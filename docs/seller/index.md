
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