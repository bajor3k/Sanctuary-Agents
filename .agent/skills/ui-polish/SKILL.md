---
name: ui-polish
description: Guide for ensuring UI consistency and premium aesthetics. Use when creating new pages/components or refining existing ones.
---
# UI Polish Skill
This skill ensures that all UI components and pages follow the project's design system and maintain a "premium" aesthetic.
## When to use this skill
- When creating a new page or component.
- When the user asks to "make it look good" or "match the design".
- When fixing UI inconsistencies.
## Design System Initialization
Before writing any UI code, you **MUST** read these files to ground yourself in the current design system:
1.  `src/app/globals.css` (for global variables and base styles)
2.  `tailwind.config.ts` (for theme colors, font families, and extensions)
3.  `src/components/AppShell.tsx` (to understand the layout structure)
4.  `src/components/ui/*.tsx` (check at least one primitive like `Button.tsx` or `Card.tsx` to see usage patterns)
## Aesthetic Rules
### 1. Typography
-   **Headers**: Use `font-bold` for main headers. Ensure a clear hierarchy (`text-3xl`, `text-xl`, `text-lg`).
-   **Body**: Use `text-muted-foreground` for secondary text to reduce visual noise.
-   **Font**: Trust the `font-sans` configured in Tailwind (usually Inter or similar).
### 2. Spacing & Layout
-   **Consistency**: Use standard Tailwind spacing steps (`4`, `6`, `8`, `12`). Avoid arbitrary pixels (`[37px]`).
-   **Containers**: Use `container mx-auto p-6` for page roots unless full-width is required.
-   **Gap**: Always use `gap-` classes in Flex/Grid instead of margins on children.
### 3. Visuals (The "Matrix" Theme)
-   **Dark Mode**: Design primarily for dark mode.
-   **Cards**: Use the `Card` component. Add subtle borders (`border-border`) and shadows.
-   **Glassmorphism**: Use `bg-background/95 backdrop-blur` for overlays/sticky headers.
-   **Gradients**: Use subtle gradients for backgrounds or text accents if appropriate (e.g., `bg-gradient-to-r`).
### 4. Interactions
-   **Hover States**: All interactive elements (buttons, cards, list items) MUST have a hover state (e.g., `hover:bg-accent`).
-   **Transitions**: Add `transition-all duration-200` to interactive elements for smoothness.
-   **Motion**: Use `framer-motion` for entry animations (e.g., fade-in for page load).
## Component Usage
**DO NOT** create custom styles for standard elements. Use the existing UI library:
-   Buttons: `import { Button } from "@/components/ui/button"`
-   Inputs: `import { Input } from "@/components/ui/input"`
-   Cards: `import { Card, CardHeader, ... } from "@/components/ui/card"`
-   Dialogs: `import { Dialog, ... } from "@/components/ui/dialog"`
## Checklist Before Implementation
-   [ ] Did I check `tailwind.config.ts` for existing colors?
-   [ ] Am I using the `cn()` utility for class merging?
-   [ ] Am I importing Shadcn UI primitives instead of writing raw HTML/CSS?
-   [ ] Have I added `hover` states to interactive elements?
-   [ ] Is the spacing consistent with the rest of the app (multiples of 4)?
