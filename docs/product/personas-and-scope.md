
# Archivo: `/docs/product/personas-and-scope.md`

```md
# Personas and Scope

## Buyers
Perfil:
- usuarios o empresas no técnicas,
- quieren automatizar tareas sobre Google Workspace, WhatsApp, OpenAI u otras tareas,
- necesitan seguridad, claridad y resultados.

Necesidades:
- descubrir agentes,
- entender qué hacen,
- pagar fácil (por ahora simularlo),
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
- compra con MercadoPago Checkout Pro (Por ahora simularlo no integrarlo de manera realista),
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