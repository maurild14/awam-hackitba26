# Archivo: `/docs/frontend/design-system.md`


## A. Tonalidad y diseño de sistema

## 1. Overview & Creative North Star

### Creative North Star: "The Curated Intelligence"
This design system moves beyond the cold, utilitarian nature of traditional AI interfaces to create a high-end editorial experience. It treats AI agents not as scripts, but as elite digital artisans. The aesthetic is defined by **Soft Minimalism**—a philosophy that favors vast negative space, intentional asymmetry, and "tonal breathing."

By breaking the rigid "bootstrap" grid, we create a signature look that feels custom-built. High-contrast typography scales (pairing massive displays with delicate micro-labels) and ultra-rounded organic shapes (`rounded-3xl`) signal a human-centric approach to high-tech commerce.

---

## 2. Colors

The color palette is rooted in a sophisticated neutral base, punctuated by warm and soft accents that guide the eye without overwhelming the senses.

### Palette Strategy
- **Base Surfaces:** `background` (#F9F9F9) provides a soft, paper-like canvas. Use `surface_container_lowest` (#FFFFFF) for primary cards to create a crisp, clean lift.
- **Accents:** 
    - **Primary (Warm Orange):** Use for action-oriented elements and high-priority highlights.
    - **Secondary (Soft Lilac):** Use for sophisticated AI-feature callouts.
    - **Tertiary (Pale Blue):** Use for information-dense secondary elements or "stable" tech features.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to define sections. Boundaries must be established through:
1. **Background Color Shifts:** Nesting a `surface_container` inside a `surface`.
2. **Negative Space:** Using the Spacing Scale (minimum `spacing.12`) to separate logical groups.
3. **Soft Tonal Transitions:** Subtle shifts between `#F9F9F9` and `#FFFFFF`.

### The "Glass & Gradient" Rule
To elevate the UI beyond flat design, use **Glassmorphism** for floating navigation or overlay modals. Use a `surface` color with 70% opacity and a `20px` backdrop-blur. For primary CTAs, apply a subtle linear gradient from `primary` (#9B4600) to `primary_container` (#FFAE80) to add "soul" and depth.

---

## 3. Typography

The typography system uses a modern Neo-Grotesk pair to achieve an editorial feel.

- **Display & Headline (Plus Jakarta Sans):** These are the "voice" of the brand. Use `display-lg` for hero statements with a tight line-height but generous `0.02em` letter spacing. This creates an authoritative, premium "magazine" look.
- **Body (Manrope):** Chosen for its high legibility and contemporary proportions. Keep body text primarily in `on_surface` (#2F3334) for maximum readability.
- **Labels (Inter):** Small, delicate labels (uppercase with `0.05em` tracking) should be used for metadata and category tags, providing a high-contrast counterpoint to the large headlines.

---

## 4. Elevation & Depth

We reject traditional box-shadows in favor of **Tonal Layering**.

- **The Layering Principle:** Depth is achieved by stacking. A `surface_container_lowest` (#FFFFFF) card placed on a `surface` (#F9F9F9) background provides all the "lift" needed for standard UI.
- **Ambient Shadows:** For floating elements (e.g., a "Hire Agent" card), use a shadow with a blur radius of `64px`, 4% opacity, and a slight tint of the `primary` color. It should feel like a soft glow rather than a dark shadow.
- **The "Ghost Border" Fallback:** If a container lacks sufficient contrast, use a `1px` border using the `outline_variant` token at **10% opacity**. It should be felt, not seen.
- **Roundedness:** All primary containers and cards must use `rounded.xl` (3rem) or `rounded.lg` (2rem). This "ultra-roundness" removes the aggression of sharp tech interfaces.

---

## 5. Components

### Buttons
- **Primary:** Pill-shaped (`rounded-full`), using the warm orange gradient. High internal padding (`spacing.3` vertical, `spacing.8` horizontal).
- **Secondary:** Pill-shaped, `surface_container_high` background with `on_surface` text. No border.
- **States:** On hover, primary buttons should scale slightly (1.02x) rather than just changing color.

### Cards & Lists
- **The No-Divider Rule:** Forbid the use of horizontal rules (`<hr>`). Use `spacing.6` to `spacing.10` to separate list items.
- **Asymmetric Layouts:** In marketplace grids, vary the card heights or use a 2-column/1-column alternating rhythm to mimic an editorial layout.

### Input Fields
- **Styling:** Minimalist. Only a bottom-border (Ghost Border style) or a very subtle `surface_container_low` fill. 
- **Focus State:** Transition the background to `surface_container_highest` with a soft lilac `outline` at 20% opacity.

### Featured Agent Chips
- **Style:** Small, pill-shaped `label-sm` text. Use `secondary_container` for the background to denote "Specialty" or "AI Model Type."

---

## 6. Do's and Don'ts

### Do
- **Do** use vast amounts of negative space. If a section feels "full," add more padding.
- **Do** use asymmetric image placement to break the "template" feel.
- **Do** use large-scale typography (`display-lg`) for short, punchy value propositions.
- **Do** apply `backdrop-blur` to any element that sits "above" the main content layer.

### Don't
- **Don't** use 100% black (#000000). Use the `on_surface` (#2F3334) for text to maintain a premium, soft feel.
- **Don't** use sharp corners (0px to 8px). Everything in this system is organic and soft.
- **Don't** use standard "drop shadows." If the shadow looks like a shadow, it's too dark.
- **Don't** crowd the interface with icons. Let the typography and color do the heavy lifting.


# B. ORDEN Y COMPONENTES A TENER

Diseñá el frontend completo de una plataforma web con DOS interfaces totalmente separadas:

1. **Lado Cliente** → marketplace de descubrimiento, compra y uso de agentes de IA  
2. **Lado Dev** → panel para publicación, gestión y monetización de agentes

**Importante:** no comparten navegación ni estructura de dashboard. Son dos experiencias distintas.

---

# OBJETIVO DEL DISEÑO

No quiero un SaaS genérico ni una UI oscura de developer tools.  
Quiero una estética **minimalista, premium, editorial, limpia, suave y moderna**, muy parecida a la imagen de referencia.

El frontend debe verse como una mezcla entre:
- marketplace creativo premium
- landing editorial moderna
- producto tech elegante y amigable
- interfaz clara para usuarios no técnicos

---


## Estilo general
- Fondo general en **gris muy claro / off-white**
- Grandes bloques o paneles blancos con muchísimo aire
- Diseño ultra limpio, con **mucho espacio negativo**
- Sensación premium, ordenada y “expensive”
- Look amistoso, no intimidante
- Nada de visual recargado ni dashboards densos

## Layout
- Usar composición basada en **grandes tarjetas redondeadas**
- Secciones presentadas en bloques tipo “editorial cards”
- Bordes redondeados grandes: `rounded-3xl` o similar
- Sombras muy sutiles, casi imperceptibles
- Grid asimétrico elegante como en la referencia
- Mucho padding interno
- Separación generosa entre secciones

## Tipografía
- Tipografía sans moderna, grotesk / neo-grotesk
- Títulos muy grandes, protagonistas, con excelente jerarquía visual
- Headings en negro o gris muy oscuro
- Subtítulos pequeños y delicados en gris medio
- El texto debe sentirse contemporáneo y premium, como una startup de diseño/producto

## Paleta
Base:
- blanco
- gris muy claro
- negro / charcoal

Acentos suaves:
- naranja cálido
- lila / violeta claro
- azul suave / celeste pastel

Usar los acentos de manera mínima y estratégica, como en la referencia:
- pequeños íconos
- badges
- detalles en cards
- indicadores visuales
- tags o chips

## Componentes visuales
- Botones tipo pill / cápsula
- Tags pequeños redondeados
- Cards con esquinas muy redondeadas
- Íconos mínimos y limpios
- Avatares redondeados
- Trust badges, ratings, chips y mini elementos visuales elegantes
- Hover states delicados pero notorios
- Animaciones suaves y modernas

## Sensación
La UI debe transmitir:
- claridad
- confianza
- simplicidad
- curación
- sofisticación
- facilidad de uso para gente no técnica

---

# RESTRICCIONES VISUALES IMPORTANTES

- No usar una estética hacker, terminalera ni cyberpunk
- No hacer un dashboard empresarial genérico
- No hacer cajas rígidas con estilo bootstrap
- No usar exceso de gradientes fuertes
- No oscurecer la interfaz
- No saturar la pantalla con texto técnico
- No hacer tablas frías como elemento dominante en la home
- No priorizar lo técnico en la interfaz cliente





