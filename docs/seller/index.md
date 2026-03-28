# Archivo: `/docs/seller/index.md`

```md
# Seller Integration Index

## Que cubre esta seccion
Explica que contrato tecnico debe cumplir un agente para correr en la plataforma.

## Objetivo
Reducir ambiguedad para sellers y para el runtime.

## Leer segun la tarea
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

## Que debe entregar un seller
- codigo fuente,
- `Dockerfile` valido en raiz,
- metadata del agente en el marketplace,
- `credential_schema`,
- `allowed_domains`,
- `resources`.

## Que debe hacer el agente
1. iniciar como proceso principal del contenedor,
2. leer credenciales desde variables de entorno,
3. usar `PROXY_URL` como base para APIs externas,
4. terminar el proceso cuando complete la tarea,
5. emitir progreso legible con `PROGRESS:`.

## Que no debe hacer
- hardcodear secretos,
- asumir internet directo,
- escribir secretos a disco,
- depender de GUI o navegador real,
- depender de credenciales basadas en firma local.

## Shape esperado de metadata

### credential_schema
Debe describir campos de credenciales requeridos para renderizar el formulario dinamico.
Shape usado desde M3:
- `env_var`
- `label`
- `type` en `text | password | textarea`
- `required`
- `placeholder` opcional
- `description` opcional

### allowed_domains
Debe listar explicitamente dominios upstream que el proxy puede contactar.
Desde M3 se validan como hostnames sin protocolo ni path.

### resources
Debe incluir, como minimo:
- CPU
- memoria
- tiempo maximo
Desde M3 el shape minimo es:
- `cpu`
- `memory_mb`
- `max_minutes`

## Ejemplo conceptual
Un agente que usa Google Sheets y OpenAI podria declarar:
- credenciales internas `GOOGLE_SHEETS_API_KEY`, `OPENAI_API_KEY`
- dominios permitidos `sheets.googleapis.com`, `api.openai.com`
- `PROGRESS:` para mensajes de negocio visibles al buyer.
```

---
