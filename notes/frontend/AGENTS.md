# AGENTS.md — Stationery Procurement Platform

This file defines how the AI coding agent (Kiro / Antigravity) should work in this repository.

`DESIGN.md` defines how the product should look. Read `DESIGN.md` before making UI decisions and follow its tokens and patterns.

---

## 1. General Development Rules

- Stack: React + TypeScript + Tailwind CSS + shadcn/ui.
- Prefer existing design tokens from `DESIGN.md` and the Tailwind theme over inventing new colors, spacing, typography, or radius values.
- Do not introduce a new UI library, icon set, font, or styling system without first checking whether the existing stack already provides a suitable solution.
- Prefer composing existing shadcn primitives over creating new low-level UI primitives.
- Reuse existing components before creating new ones.
- Keep components focused and avoid unnecessary abstraction.
- Do not add dependencies unless they solve a real project requirement.
- Do not leave placeholder or lorem-ipsum content in completed UI. Use realistic procurement-domain content such as stationery products, organizations, suppliers, orders, baskets, deliveries, and plausible ETB prices.
- Keep existing project conventions unless there is a clear reason to change them.

---

## 2. Architecture Rules

- Organize feature code by domain where appropriate:
  `baskets/`, `organizations/`, `suppliers/`, `pricing/`, `admin/`, `deliveries/`, `auth/`.
- Keep organization-facing dashboards and administrative interfaces in separate route trees when their permissions and navigation differ.
- Shared low-level UI primitives belong in `components/ui/` and should remain compatible with shadcn conventions.
- Domain-agnostic composite components belong in `components/shared/`.
- Feature-specific components should remain close to the feature that uses them.
- Do not create a shared component merely because two components look similar. Share components when their behavior and purpose are genuinely reusable.

---

## 3. Component Rules

- Before creating a component, check whether an existing component can be reused or composed.
- When a new reusable UI pattern is introduced, update `DESIGN.md` when appropriate so the design system and implementation stay aligned.
- Domain-specific components should preserve their domain behavior and should not be reduced to generic UI primitives merely to make the code shorter.
- Data-heavy tables should remain usable on smaller screens and should not silently remove important information.
- Avoid unnecessary animation. Animation should communicate state, provide feedback, or improve visual hierarchy rather than simply decorate the interface.

---

## 4. MCP Usage Rules

Use MCPs according to their strengths. MCPs are complementary, not mutually exclusive.

### shadcn MCP — Default UI source

Use shadcn first for standard application UI:

- buttons
- cards
- dialogs
- forms
- inputs
- selects
- tabs
- dropdowns
- sheets
- tooltips
- tables
- other common interface primitives

Prefer existing shadcn components and composition before looking elsewhere.

### Vibe MCP — Alternative component source

Use Vibe when shadcn does not provide a good fit for a more complex interaction or component pattern.

Examples:

- complex navigation patterns
- richer interaction patterns
- dense application interfaces
- advanced admin workflows

Do not adopt Vibe's visual styling blindly. Adapt the component to the project's `DESIGN.md` tokens and visual language.

### React Bits MCP — Creative and motion layer

Use React Bits selectively for visual enhancement.

Good uses include:

- hero sections
- tasteful entrance animations
- empty states
- loading experiences
- subtle background effects
- progress animations
- decorative visual elements

Do not use React Bits simply because an effect looks impressive.

Avoid adding animation to:

- ordinary forms
- data tables
- navigation
- critical actions
- dense administrative interfaces

Prefer subtle, purposeful motion over distracting effects.

### Context7 MCP — Current documentation

Use Context7 when implementation depends on library APIs, configuration, or behavior that may have changed.

Useful libraries include:

- React
- React Router
- Tailwind CSS
- TypeScript
- TanStack Query
- shadcn/ui
- other project dependencies

Resolve the library with Context7 before querying its documentation.

Context7 may be used together with shadcn, Vibe, or React Bits when current documentation is needed.

### Playwright MCP — Optional Validation

Use Playwright when it provides meaningful value, such as:

- debugging a UI issue
- investigating a responsive layout problem
- verifying an important user flow
- checking a page that is difficult to validate manually
- reproducing a reported browser issue
- performing a final validation when explicitly requested

Do not run Playwright automatically after every UI change.

Manual testing by the developer is the normal development workflow.

When Playwright is used, focus on the relevant page, flow, and viewport rather than unnecessarily testing the entire application.

---

## 5. Responsive Design Rules

Use the breakpoints defined in `DESIGN.md`.

For meaningful UI changes, verify the relevant responsive states with Playwright.

At minimum, check:

- mobile: `390px`
- tablet: `768px`
- desktop: `1440px`

Pay particular attention to:

- horizontal overflow
- clipped content
- unusable controls
- tables
- navigation
- dialogs
- forms
- cards and grids

Do not blindly apply the same layout to every breakpoint. Adapt the layout to the available space.

For data-heavy tables on small screens, prefer horizontal scrolling when necessary rather than silently hiding important data.

---

## 6. Accessibility Rules

- Every form input must have an accessible label.
- Do not use placeholder text as the only label.
- Use semantic HTML where appropriate.
- Data tables should use proper table semantics when the content is genuinely tabular.
- Do not rely on color alone to communicate status.
- Interactive elements must be keyboard accessible.
- Interactive elements should have visible focus states.
- Maintain WCAG AA contrast for normal text.
- Respect the accessibility requirements of components provided by shadcn, Vibe, and React Bits.
- Prefer accessible components and patterns from the existing UI libraries rather than rebuilding accessibility behavior manually.

---

## 7. Testing Rules

- Do not automatically run browser tests after every code change.
- The developer may manually test pages during normal development.
- Run the project's build or type-check when appropriate after significant changes.
- Use Playwright when it is specifically useful for the task, such as debugging responsive behavior, testing an important flow, or investigating a browser-specific issue.
- For larger features, verify the primary user flow before considering the feature complete.
- When a bug is reported, reproduce the bug before changing the implementation when practical.
- Do not spend time testing unrelated parts of the application.

---

## 8. Design Consistency

`DESIGN.md` is the source of truth for the visual design system.

Before introducing a new visual pattern:

1. Check `DESIGN.md`.
2. Check existing components.
3. Check shadcn.
4. Consider Vibe or React Bits if the pattern genuinely requires them.
5. Add or update a design-system pattern when the new pattern is intended to be reused.

Avoid:

- arbitrary colors
- arbitrary typography
- unnecessary one-off spacing values
- random border radii
- inconsistent shadows
- excessive gradients
- excessive glassmorphism
- unnecessary animations
- generic "AI-generated" dashboard aesthetics

The goal is a cohesive product, not a collection of visually impressive components.

---

## 9. Code Quality

- Keep TypeScript types accurate.
- Avoid `any` unless there is a clear reason.
- Keep components readable.
- Avoid premature abstraction.
- Remove unused code and imports.
- Do not modify unrelated files while implementing a feature.
- Do not rewrite working code merely to match personal preferences.
- Preserve existing behavior unless the task requires changing it.

---

## 10. Definition of Done

A UI task is complete when:

- [ ] The implementation follows `DESIGN.md`.
- [ ] Existing components were reused where appropriate.
- [ ] Appropriate MCPs were used when they provide useful information or components.
- [ ] No unnecessary dependencies were introduced.
- [ ] The UI works at the relevant responsive breakpoints.
- [ ] Important interactions work.
- [ ] Relevant loading, empty, and error states work.
- [ ] Accessibility requirements are satisfied.
- [ ] No obvious console errors remain.
- [ ] No unnecessary hardcoded design values were introduced.
- [ ] `DESIGN.md` is updated when a genuinely reusable design pattern was introduced.
- [ ] Appropriate validation was performed for the scope of the change.

Playwright validation is not required for every task. Use it when it provides meaningful value or when the task specifically requires browser-level validation.

---

## 11. Priority When Rules Conflict

When making decisions, use this priority:

1. User's explicit request
2. Existing application behavior and architecture
3. `DESIGN.md`
4. This `AGENTS.md`
5. Existing project conventions
6. MCP recommendations

Do not change project architecture, design tokens, or dependencies simply because an MCP suggests an alternative.
