# Archivo: `/docs/frontend/items.md`


## El objetivo de este archivo es mostrar todos los compontentes que deberia tener el frontend y de que manera de deberian hacer


# LADO CLIENTE

## 1. Home del cliente (usuario logueado)

### Header
Minimalista, fino, con mucha separación horizontal.
- Logo a la izquierda
- A la derecha: avatar / account dropdown
- Dropdown con:
  - Profile
  - Métodos de pago
  - Third-party apps / vínculos
  - Become a Developer
  - Request an Agent

La navegación debe verse premium y muy ligera, similar a la referencia.

### Hero principal
Quiero una hero section muy inspirada en la referencia:
- gran bloque claro y redondeado
- título enorme y muy visual
- subtítulo breve
- barra de búsqueda bien integrada
- CTA principal
- CTA secundaria
- pequeño badge o rating arriba del título
- composición limpia y centrada

El mensaje del hero debe comunicar algo como:
**Descubrí agentes de IA listos para resolver tareas reales**
o
**Encontrá el agente ideal para automatizar tu trabajo**

Debe sentirse como un marketplace elegante y confiable.

### Categorías destacadas
Debajo del hero:
- cards grandes de categorías
- estilo muy similar a la referencia
- algunas cards claras y una oscura destacada para contraste
- cada card con:
  - nombre de categoría
  - mini descripción
  - tags o subtipos
  - pequeño ícono o elemento visual
- hover suave

Ejemplos de categorías:
- Sales
- Marketing
- Operations
- Research
- Data Extraction
- Customer Support
- Finance
- Content

### Sección editorial descriptiva
Una sección tipo manifiesto, muy visual, con texto grande y aireado.
Quiero algo parecido al bloque de texto grande de la referencia.
Debe explicar que la plataforma hace accesibles agentes complejos para cualquier negocio.

### Sección de beneficios
Cards o stats premium mostrando:
- Seguridad de credenciales
- Ejecución aislada
- Ahorro de tiempo
- Developers verificados
- Resultados rápidos
- Automatización sin fricción

Evitar estilo corporativo pesado. Debe verse visual y moderno.

### Agentes destacados / recomendados
Sección estilo marketplace premium.
Mostrar cards de agentes como si fueran perfiles o productos curados.
Cada card debe incluir:
- nombre del agente
- categoría
- breve función
- developer
- rating
- precio
- visual / emoticon / thumbnail
- hover state atractivo

Algunas cards pueden superponerse o tener composición más editorial, inspiradas en la referencia.

### Footer
Minimalista.
- logo / nombre izquierda
- social links
- idioma / divisa para futuro
- links utilitarios

---

## 2. Explore Agents page
Página de exploración de agentes.

Diseño:
- limpia
- muy visual
- grid aireado
- filtros elegantes, no pesados

Debe incluir:
- barra de búsqueda superior
- filtros por categoría, rating, newest, price, integrations
- grid de product cards clickeables
- cards con hover premium

Cada product card:
- nombre
- descripción breve
- precio
- rating
- developer
- imagen o icono
- tags

---

## 3. Specific Agent Page
Cuando el usuario entra a un agente específico.

Diseño:
- muy claro
- gran jerarquía visual
- CTA de compra siempre visible (sticky)
- layout editorial en 2 o 3 columnas

Debe incluir:
- nombre del agente
- reseñas
- qué hace
- qué problema resuelve
- qué necesitás para usarlo
- qué entrega
- cuánto cuesta
- quién lo hizo
- detalles técnicos avanzados
- video si existe
- botón de compra visible todo el tiempo

Lenguaje claro primero.  
Los detalles técnicos deben existir, pero secundarios visualmente.

---

## 4. Request an Agent Page
Página para pedir un agente que no exista.

Diseño:
- formulario elegante dentro de un gran contenedor redondeado
- simple y amable
- nada técnico visualmente

Campos:
- categoría
- función
- descripción detallada
- requisitos
- tipo de input/output esperado

---

## 5. Become a Developer Page
Landing/formulario para postularse como dev.

Debe verse profesional y confiable.
Contenido:
- beneficios de publicar en la plataforma
- proceso
- requisitos
- formulario de alta

Campos:
- perfil GitHub
- verificación de identidad
- LinkedIn opcional
- experiencia
- tipo de agentes que construye

---

## 6. Compras / Estado de agentes contratados
Página de historial del cliente.

Diseño:
- limpio, ordenado, amigable
- cards o filas premium, no tablas duras

Mostrar:
- fecha
- agente
- estado
- último update
- forma de ver resultado
- reintentar / volver a usar
- soporte

Estados:
- En proceso
- Terminado
- Cancelado

---

## 7. Interfaz de compra
Al tocar comprar:
- resumen del agente
- descripción breve
- precio total
- gateway externo de pago

Luego del pago:
mostrar una pantalla / modal full-screen elegante:
- pago confirmado
- completar requirements
- aviso de que se notificará por mail cuando termine
- CTA para ir a la página de compras/estado

Esta pantalla debe sentirse premium y tranquila, no como checkout genérico.

---

## 8. Perfil del developer
Página pública del developer.

Mostrar:
- nombre
- foto
- agentes creados
- rating promedio
- GitHub
- LinkedIn si subió
- mini bio
- catálogo de agentes

Diseño muy parecido a un perfil curado / talento destacado.

---

# LADO DEV

El lado dev NO debe tener la misma estética narrativa de la home cliente, pero sí debe compartir el lenguaje visual premium, limpio y minimalista.

Debe verse como:
- panel moderno
- sofisticado
- muy claro
- modular
- elegante
- menos editorial que cliente, más utilitario pero igual de lindo

## 1. Dev Dashboard
Métricas principales:
- Revenue total
- Revenue mensual
- Agentes activos
- Cantidad de tareas completadas
- métricas de visitas y conversión

Usar cards grandes, aireadas, modernas.

## 2. Crear tu agente
Formulario para publicar agente.

Campos:
- repo / link con Dockerfile
- precio
- descripción completa
- icono / imagen
- video opcional
- parámetros para usuario
- tech stack
- integraciones
- output type

Diseñarlo en secciones modulares, claras y muy bien jerarquizadas.

## 3. Billeteras / payouts
Pantalla para definir dónde recibe ingresos.

## 4. Sugerencias / pedidos de la comunidad
Lista de requests hechos por clientes:
- idea solicitada
- categoría
- cuántas personas la pidieron
- posibilidad de marcar que el dev la va a construir

## 5. Mis agentes
Listado de agentes publicados con:
- editar
- activar
- poner en descanso
- eliminar
- ver reseñas
- ver estado de aprobación
- revenue por agente

Estados posibles:
- en revisión
- aprobado
- rechazado
- pausado
- activo

---

# SISTEMA DE COMPONENTES

Usar un sistema de diseño consistente:
- navbar minimal
- buttons pill
- chips/tags redondeados
- cards grandes
- profile cards
- product cards
- stats cards
- search bars anchas
- dropdowns suaves
- modals elegantes
- sticky CTA sections
- hover animations sutiles
- microinteracciones premium

---

# TONO DEL COPY EN LA UI

Quiero lenguaje:
- claro
- confiable
- poco técnico
- moderno
- directo
- premium
- amigable

Evitar copy demasiado corporativo o demasiado developer-centric en el lado cliente.

---