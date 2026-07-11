---
name: StallBox Design System
colors:
  surface: '#f5faf8'
  surface-dim: '#d6dbd9'
  surface-bright: '#f5faf8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f5f2'
  surface-container: '#eaefed'
  surface-container-high: '#e4e9e7'
  surface-container-highest: '#dee4e1'
  on-surface: '#171d1c'
  on-surface-variant: '#3d4947'
  inverse-surface: '#2c3130'
  inverse-on-surface: '#edf2f0'
  outline: '#6d7a77'
  outline-variant: '#bcc9c6'
  surface-tint: '#006a61'
  primary: '#00685f'
  on-primary: '#ffffff'
  primary-container: '#008378'
  on-primary-container: '#f4fffc'
  inverse-primary: '#6bd8cb'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#924628'
  on-tertiary: '#ffffff'
  tertiary-container: '#b05e3d'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#89f5e7'
  primary-fixed-dim: '#6bd8cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#005049'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdbce'
  tertiary-fixed-dim: '#ffb59a'
  on-tertiary-fixed: '#370e00'
  on-tertiary-fixed-variant: '#773215'
  background: '#f5faf8'
  on-background: '#171d1c'
  surface-variant: '#dee4e1'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-padding-mobile: 16px
  container-padding-desktop: 32px
  gutter: 24px
  section-gap: 40px
---

## Brand & Style
The design system is built on the philosophy of **Intelligent Hospitality**. It balances the rigorous efficiency required for enterprise management with a welcoming, approachable interface for kitchen staff and administrators. 

The visual style is **Corporate Modern** with a high-tech edge. It utilizes a "Clean-Tech" aesthetic: heavy use of whitespace, crisp typography, and purposeful color application to signal AI-driven insights. The interface should feel reliable and fast, evoking a sense of calm control in high-pressure canteen environments.

## Colors
The palette is rooted in professional teals and greens to promote a sense of freshness and health, appropriate for food services. 

- **Primary Teal (#0D9488):** Used for primary actions, navigation states, and brand-critical elements.
- **Secondary Emerald (#10B981):** Applied to "Success" states and "Available" status indicators.
- **AI Indigo (#6366F1):** Reserved exclusively for AI-powered features, such as demand forecasting, smart recommendations, and automated inventory alerts.
- **Surface Strategy:** Content lives on White cards (#FFFFFF) set against a Light Gray background (#F9FAFB) to provide clear depth and separation without heavy borders.

## Typography
This design system utilizes **Inter** for all roles to ensure maximum legibility and a systematic, utilitarian feel. The scale emphasizes clear hierarchy, especially in data-dense dashboard environments.

- **Headlines:** Use tighter letter spacing and semi-bold weights to maintain a professional, high-tech appearance.
- **Labels:** Small labels use a semi-bold weight and slight tracking to ensure readability in status badges and table headers.
- **Body:** Standard body text prioritizes comfort for long-term use by administrators monitoring inventory and sales data.

## Layout & Spacing
The system follows an **8px spacing rhythm** to ensure mathematical consistency across all components.

- **Layout Model:** A 12-column fluid grid for desktop dashboards, collapsing to a single column for mobile views. 
- **Margins:** 32px on desktop to provide breathing room; 16px on mobile to maximize screen real estate.
- **Alignment:** Content is grouped into logical card-based modules. Internal card padding should consistently use 24px (3 units) for balance.

## Elevation & Depth
Depth is achieved through **Tonal Layering** and **Ambient Shadows**.

- **Level 0 (Background):** #F9FAFB.
- **Level 1 (Cards/Surface):** White #FFFFFF with a subtle 1px border (#E5E7EB) and a "Soft Ambient" shadow (0px 4px 6px -1px rgba(0, 0, 0, 0.05)).
- **Level 2 (Dropdowns/Modals):** High-diffusion shadows (0px 10px 15px -3px rgba(0, 0, 0, 0.1)) to indicate clear interaction priority.
- **AI Highlight:** Components featuring AI insights utilize a subtle 2px left-border or glow in **AI Indigo** to distinguish them from standard data.

## Shapes
The shape language is **friendly yet structured**. 
- **Base Components:** Buttons and input fields use a 0.5rem (8px) radius.
- **Container Elements:** Large cards and status sections use a 1rem (16px) radius to soften the technical nature of the data.
- **Selection Indicators:** Active states in navigation or toggle groups use fully rounded (pill-shaped) ends for clear visibility.

## Components

### Buttons
- **Primary:** Solid Teal with white text. High contrast, 8px corner radius.
- **AI Primary:** Solid Indigo with white text. Reserved for "Generate Report" or "Predict Demand."
- **Secondary:** Transparent with Teal border and text.

### Status Indicators (Pills)
- **Available:** Emerald background (10% opacity) with Emerald text.
- **Low Stock:** Orange background (10% opacity) with Orange text.
- **Unavailable:** Gray-400 text with light gray background.
- **Recommended (AI):** Indigo background (10% opacity) with Indigo text and a small sparkle icon.

### Data Tables
Tables are the core of the system. They feature:
- No vertical borders; light horizontal dividers only.
- Fixed headers with `label-md` typography.
- Alternating row highlights on hover for better tracking.

### Cards
Cards are the primary container. They must always have a 16px corner radius and a subtle shadow. AI cards feature a gradient top-border in Indigo.

### Input Fields
Clean, outlined boxes with a 1px border. On focus, the border transitions to Primary Teal with a 3px soft outer glow.