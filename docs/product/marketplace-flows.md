

# Archivo: `/docs/product/marketplace-flows.md`

```md
# Marketplace Flows

## Flujo del buyer
1. descubre un agente en el marketplace,
2. entra al detalle,
3. inicia compra,
4. paga en MercadoPago,
5. vuelve al producto,
6. carga credenciales,
7. se crea la sesión,
8. el backend crea sandbox y runtime,
9. el buyer sigue el progreso por SSE,
10. ve el resumen final y luego puede dejar review.

## Flujo del seller
1. se registra como seller,
2. crea un agente,
3. define:
   - título,
   - descripción,
   - precio,
   - `credential_schema`,
   - `allowed_domains`,
   - `resources`,
   - `otros que el necesite`,
4. sube su código fuente / Dockerfile,
5. se dispara build,
6. si el build y el escaneo pasan, la imagen se publica en ECR,
7. el agente queda publicable o publicado según revisión.

## Flujo de publicación
1. draft
2. pending_review
3. published
4. suspended si corresponde

## Flujo de ejecución
1. pago aprobado (simulado por ahora),
2. buyer envía credenciales,
3. backend las guarda en Vault,
4. backend genera phantom token,
5. backend crea proxy + agente + red interna,
6. se actualiza `sessions.status = running`,
7. se emiten logs y progreso,
8. al finalizar se limpia runtime y secretos,
9. la sesión queda en `completed`, `failed`, `timed_out` o `stopped`.

## Flujo de confianza
- la landing y el checkout deben explicar en lenguaje simple:
  - que el seller no recibe la credencial real,
  - que el agente corre aislado,
  - que las credenciales se eliminan al terminar.
```

---