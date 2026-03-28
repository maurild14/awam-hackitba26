
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