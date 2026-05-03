---
name: Honey Amber
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#e4beb5'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#ab8981'
  outline-variant: '#5b403a'
  surface-tint: '#ffb4a2'
  primary: '#ffb4a2'
  on-primary: '#611200'
  primary-container: '#fe572d'
  on-primary-container: '#550e00'
  inverse-primary: '#b42900'
  secondary: '#c6c6c7'
  on-secondary: '#2f3131'
  secondary-container: '#454747'
  on-secondary-container: '#b4b5b5'
  tertiary: '#c8c6c5'
  on-tertiary: '#303030'
  tertiary-container: '#929090'
  on-tertiary-container: '#2a2a2a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdad2'
  primary-fixed-dim: '#ffb4a2'
  on-primary-fixed: '#3c0700'
  on-primary-fixed-variant: '#891d00'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#e4e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1b1c1c'
  on-tertiary-fixed-variant: '#474746'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-lg:
    fontFamily: Epilogue
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Epilogue
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Epilogue
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Epilogue
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Epilogue
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-bold:
    fontFamily: Epilogue
    fontSize: 14px
    fontWeight: '700'
    lineHeight: '1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-margin: 24px
  gutter: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
This design system is built to evoke an appetite for modern culinary experiences. The brand personality is energetic, premium, and highly tactile, blending the sleekness of high-end technology with the warmth of a vibrant food culture. The target audience is the urban epicurean—users who value both speed and the aesthetic presentation of their meals.

The visual style is defined by **Modern Glassmorphism**. It utilizes deep translucent layers to create a sense of physical depth without clutter. The interface relies on vibrant background blurs to guide the eye and soft, atmospheric shadows to suggest "floating" interactive elements. The aesthetic is high-contrast, ensuring that photography of food remains the hero while the UI provides a sophisticated, translucent framework.

## Colors
The palette is rooted in a high-octane contrast between a deep charcoal environment and a vivid primary accent. 

- **Primary (#ef4d23):** A high-saturation orange used for calls to action, price points, and active states. It mimics the warmth of a kitchen flame or honey under light.
- **Secondary (#ffffff):** Pure white is reserved for high-contrast typography and iconography to ensure legibility against dark, blurred backgrounds.
- **Surface Neutrals:** The background uses a deep matte black, while glass layers use semi-transparent variations of charcoal to maintain depth and hierarchy.

## Typography
This design system employs **Epilogue** for its geometric precision and editorial weight. The typographic scale is designed for high-contrast readability, using heavy weights for food names and navigation to create a bold, modern voice.

Large headlines should use tight letter-spacing to feel impactful and grounded. Body copy is set with generous line-height to ensure comfort when reading descriptions of dishes or ingredients. Labels are often transformed to uppercase to provide a distinct visual break between information types and descriptive text.

## Layout & Spacing
The layout follows a fluid 12-column grid for desktop and a 4-column grid for mobile devices. Given the heavy use of rounded corners and glass cards, the spacing rhythm is generous to prevent the UI from feeling cramped.

A base unit of 8px dictates all padding and margins. Vertical rhythm is established through "Stack" tokens, where 32px (stack-lg) is used between major sections and 16px (stack-md) is used between related card elements. Grid margins are fixed at 24px on mobile to ensure content stays within the visual safe zone of contemporary device displays.

## Elevation & Depth
Depth is the cornerstone of this design system, achieved through **Glassmorphism**. Surfaces are categorized by their "Z-index" hierarchy:

1.  **Base Layer:** The deep matte background (#121212).
2.  **Mid Layer (Cards):** Glass panels with a 12% white opacity and a `backdrop-filter: blur(20px)`. These feature a subtle 1px inner border (white at 10% opacity) to define edges against the dark background.
3.  **Top Layer (Modals/Overlays):** Thicker glass panels with a 20% white opacity and a `backdrop-filter: blur(40px)`, accompanied by a soft, large-radius shadow with a 40% opacity black tint.

Interactive elements use a "glow" elevation rather than traditional shadows, where the Primary Orange color creates a subtle outer bloom when an element is focused or active.

## Shapes
The shape language is ultra-modern and organic. This design system uses an **XL/2XL** corner radius strategy to soften the high-contrast color palette and create a friendly, accessible feel.

Standard cards and large containers utilize a 24px (2XL) radius. Buttons and input fields use a 16px (XL) radius. This consistency in heavy rounding reinforces the "liquid" feel of the glass components. Small elements like chips or badges should be fully pill-shaped to differentiate them from larger interactive cards.

## Components
- **Buttons:** Primary buttons are solid Orange (#ef4d23) with white text. They must include a `transform: scale(1.05)` hover effect and a `transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)` to provide a bouncy, tactile response.
- **Cards:** Food item cards use the mid-layer glass style. On hover, the card should lift using a `translateY(-8px)` transform and increase the backdrop blur intensity.
- **Chips:** Used for dietary tags (e.g., "Vegan", "Gluten-Free"). These are outlined with the primary orange or have a subtle dark-glass fill.
- **Input Fields:** Semi-transparent dark backgrounds with a 1px border that glows Orange (#ef4d23) upon focus.
- **Lists:** Clean rows with 1px semi-transparent separators. Each list item should have a subtle scale-up or highlight effect when tapped.
- **Smooth Transitions:** All state changes (active, hover, focus) must use a minimum of 200ms easing to maintain the premium, fluid feel of the system.