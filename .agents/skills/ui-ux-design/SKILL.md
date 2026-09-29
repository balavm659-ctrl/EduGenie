---
name: ui-ux-design
description: >-
  Use this skill when the user asks to create, modify, or improve any frontend
  UI/UX — including pages, components, layouts, forms, navigation, styling, or
  responsive design. Activate whenever working on HTML, CSS, JSX, or any
  visual/interactive element of the application.
---

# UI/UX Design Skill

## Role

Act as a senior UI/UX designer and frontend engineer.
The goal is to create modern, professional, responsive, accessible, and
production-quality interfaces.

---

## Design Principles

- Use a clean visual hierarchy.
- Keep interfaces simple and intuitive.
- Avoid unnecessary elements.
- Maintain consistent spacing.
- Use a consistent typography system.
- Use reusable components.
- Maintain consistent border radius.
- Use subtle shadows instead of excessive shadows.
- Use animations only when they improve UX.

---

## Responsive Design

The UI must work correctly on:

- **Mobile** (< 640px)
- **Tablet** (640px – 1024px)
- **Laptop** (1024px – 1440px)
- **Desktop** (1440px – 1920px)
- **Large screens** (> 1920px)

Use responsive layouts (flexbox, grid, relative units) rather than fixed widths.

---

## Typography

Use a modern readable font (e.g. Inter, Roboto, Outfit from Google Fonts).

Maintain clear hierarchy:

| Level     | Usage                 |
| --------- | --------------------- |
| **H1**    | Page title            |
| **H2**    | Section title         |
| **H3**    | Component title       |
| **Body**  | Readable content      |
| **Caption** | Supporting information |

---

## Color System

Create a centralized design system with semantic color tokens:

- **Primary** — brand / main actions
- **Secondary** — supporting actions
- **Background** — page background
- **Surface** — card / panel backgrounds
- **Text** — primary text
- **Muted text** — secondary / helper text
- **Border** — dividers and outlines
- **Success** — positive feedback
- **Warning** — caution states
- **Error** — destructive / error feedback

Do not randomly introduce new colors. All colors must come from the design
system.

---

## Components

Build reusable components for:

- Navbar
- Sidebar
- Buttons (primary, secondary, ghost, destructive)
- Cards
- Forms
- Inputs (text, select, checkbox, radio, textarea)
- Modals / Dialogs
- Dropdowns / Menus
- Tables
- Notifications / Toasts
- Loading states (skeletons, spinners)
- Empty states
- Error states

---

## Accessibility

Follow accessibility best practices:

- Provide `<label>` elements for all inputs.
- Ensure sufficient color contrast (WCAG AA minimum).
- Use semantic HTML (`<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`).
- Support keyboard navigation (`Tab`, `Enter`, `Escape`).
- Provide visible focus states (`:focus-visible`).
- Do not rely only on color to communicate information — use icons, text, or
  patterns as well.

---

## UX

Every page should clearly answer:

1. **Where am I?** — clear page title and breadcrumb / navigation state.
2. **What can I do here?** — visible actions and content hierarchy.
3. **What should I do next?** — clear primary call-to-action.

Important actions should be visually prominent.

Forms should provide:

- Inline validation
- Descriptive error messages
- Loading / submitting states
- Success feedback

---

## Animation

Use subtle, purposeful animations:

- Button hover / press
- Card hover elevation
- Page transitions (fade, slide)
- Modal open / close
- Loading pulse / skeleton shimmer

Avoid excessive, distracting, or long-duration animations.

---

## Code Quality

- Use reusable components — avoid duplicating markup or styles.
- Avoid duplicated CSS — extract shared styles into the design system.
- Keep components focused, small, and maintainable.
- Keep styling consistent across the entire application.
- Do **not** break existing functionality when improving UI.
- Preserve existing API integrations and data flows.
- Do **not** rewrite working backend logic unnecessarily.

---

## Before Modifying UI

Before making changes, inspect:

1. Existing components and their props / usage.
2. Existing CSS / design tokens / theme files.
3. Design system conventions already in place.
4. Routing structure.
5. API integration points.
6. State management patterns.

Then improve the UI **without** unnecessarily changing functionality.

---

## Final Quality Checklist

Before completing any UI task, verify:

- [ ] Responsive layout works on all breakpoints
- [ ] Mobile layout is usable
- [ ] Typography hierarchy is correct
- [ ] Spacing is consistent
- [ ] Colors come from the design system
- [ ] Accessibility basics pass (labels, contrast, focus states)
- [ ] Hover / active / focus states exist
- [ ] Loading states are present
- [ ] Empty states are handled
- [ ] Error states are handled
- [ ] Form validation works
- [ ] Navigation is functional
- [ ] No console errors
- [ ] No broken functionality
