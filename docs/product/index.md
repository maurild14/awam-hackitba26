# Archivo: `/docs/product/index.md`

```md
# Product Index

## Qué cubre esta sección
Esta sección define qué producto estamos construyendo, para quién, con qué alcance y con qué reglas de negocio.

## Resumen rápido
El producto es un marketplace de dos lados:

- **buyers** compran ejecuciones de agentes,
- **sellers** publican agentes empaquetados como software,
- la plataforma se encarga de pagos, ejecución, credenciales, logs y operación.


## Reglas de negocio importantes
- El buyer paga por ejecución.
- El seller define el precio por ejecución en ARS.
- La plataforma cobra una comisión del 20%.
- El mercado inicial es Argentina / LatAm hispanohablante.
- La interfaz principal está en español.
- El método de pago principal es MercadoPago (Pero va a estar desahbilitado temporalmente hasta que diga lo contrario, es decir que sea simbolico por el momento)

## Roles del sistema
- buyer
- seller
- admin

## Leer según la tarea
- visión y negocio: `vision-and-business.md`
- usuarios, alcance y exclusiones: `personas-and-scope.md`
- flujos buyer/seller/admin: `marketplace-flows.md`

## Riesgos de producto
- fricción por confianza en manejo de credenciales,
- fricción para sellers si el contrato técnico es confuso,
- sesiones fallidas si el agente no emite progreso claro,
- UX rota si el estado del pago y el estado de ejecución no están bien coordinados.
```

---