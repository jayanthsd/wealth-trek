## Context

The existing UI is built with standard Tailwind CSS utility classes and a purple/indigo color palette. While functional, it lacks the high-end, premium aesthetic required for the "Wealth Trek" brand. The "Midnight Ink" redesign introduces a dark-mode first, gold-accented theme with advanced CSS techniques (OKLCH, glassmorphism) and smooth interactive animations.

## Goals / Non-Goals

**Goals:**
- Implement a complete visual overhaul using the "Midnight Ink" palette.
- Achieve an "Apple-esque" precision in typography and spacing.
- Introduce fluidic, scroll-driven animations for the landing page.
- Ensure consistent theme application across all premium components.
- Maintain full responsiveness and accessibility.

**Non-Goals:**
- Functional changes to the underlying business logic (net worth computation, auth flows).
- Backend or API changes.
- Replacing the UI library (still using React/Tailwind/Framer Motion).

## Decisions

- **Color Space (OKLCH)**: We will use OKLCH color tokens in `globals.css`.
  - *Rationale*: OKLCH provides perceptually uniform brightness and more vibrant, natural-looking colors compared to HSL or HEX, which is critical for the "liquid gold" and "midnight charcoal" look.
  - *Alternative*: Standard HSL variables were considered but rejected as they struggle with consistent luminosity across different hues.
- **Typography (Hybrid Sans/Serif)**: Use Plus Jakarta Sans for UI elements and Cormorant Garamond for editorial highlights.
  - *Rationale*: This pairing creates a "personal balance sheet" feel—combining modern reliability with traditional wealth-management elegance.
- **Scroll-Driven Parallax (Framer Motion)**: Use `useScroll` and `useTransform` for the `FluidHero` and `ProductReveal` sections.
  - *Rationale*: Synchronizing animations with the user's scroll position creates a more immersive and high-end feel than time-based entrance animations.
- **Surface Utilities**: Create specific classes like `.surface-dark-glass` and `.surface-card`.
  - *Rationale*: Standardizing these "materials" ensures consistency across complex components like the dashboard and pricing cards.

## Risks / Trade-offs

- **[Risk] Performance Overhead**: Heavy use of backdrop filters and scroll-driven transforms can impact performance on low-end devices.
  - *Mitigation*: Use `will-change` where necessary and ensure animations are optimized. Test on mobile early.
- **[Risk] Color Accuracy**: OKLCH support is broad but can vary slightly across browsers.
  - *Mitigation*: Provide fallbacks or ensure the palette degrades gracefully if OKLCH is not supported (though unlikely in modern browsers used by our target audience).
- **[Risk] Complexity of 3D Transforms**: The `ProductReveal` 3D rotation can be tricky to get right for all viewports.
  - *Mitigation*: Use responsive breakpoints to adjust the intensity of the rotation on smaller screens.
