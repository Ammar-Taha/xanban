# Xanban Design System

Reference: [Figma — Kanban Task Management Web App](https://www.figma.com/design/dOOXJi8HUC0IqJ4uPyTYUh/kanban-task-management-web-app?node-id=0-9066) (Design System frame).

---

## 1. Colors

### Primary
| Token | Hex | RGB | HSL | Usage |
|-------|-----|-----|-----|--------|
| **Main Purple** | `#635FC7` | 99, 95, 199 | 242°, 48%, 58% | Primary actions, links, accents |
| **Main Purple (Hover)** | `#A8A4FF` | 168, 164, 255 | 243°, 100%, 82% | Hover state for primary |

### Neutrals — Light theme
| Token | Hex | RGB | HSL | Usage |
|-------|-----|-----|-----|--------|
| **Black** | `#000112` | 0, 1, 18 | 237°, 100%, 4% | Primary text (light mode) |
| **Dark Grey** | `#2B2C37` | 43, 44, 55 | 235°, 12%, 19% | Secondary surfaces (dark) |
| **Lines (Light)** | `#E4EBFA` | 228, 235, 250 | 221°, 69%, 94% | Borders, dividers (light) |
| **Light Grey (Light BG)** | `#F4F7FD` | 244, 247, 253 | 220°, 69%, 97% | Light background |
| **Medium Grey** | `#828FA3` | 130, 143, 163 | 216°, 15%, 57% | Secondary text, labels |
| **White** | `#FFFFFF` | 255, 255, 255 | 0°, 0%, 100% | Background, cards; stroke: Lines (Light) |

### Neutrals — Dark theme
| Token | Hex | RGB | HSL | Usage |
|-------|-----|-----|-----|--------|
| **Very Dark Grey (Dark BG)** | `#20212C` | 32, 33, 44 | 235°, 16%, 15% | Page background (dark) |
| **Dark Grey** | `#2B2C37` | 43, 44, 55 | 235°, 12%, 19% | Cards, elevated surfaces (dark) |
| **Lines (Dark)** | `#3E3F4E` | 62, 63, 78 | 236°, 11%, 27% | Borders, dividers (dark) |
| **Medium Grey** | `#828FA3` | 130, 143, 163 | 216°, 15%, 57% | Secondary text (both themes) |

### Semantic
| Token | Hex | RGB | HSL | Usage |
|-------|-----|-----|-----|--------|
| **Red** | `#EA5555` | 234, 85, 85 | 0°, 78%, 63% | Destructive, errors, required |
| **Red (Hover)** | `#FF9898` | 255, 152, 152 | 0°, 100%, 80% | Hover for destructive |

---

## 2. Typography

**Font family:** Plus Jakarta Sans (Google Fonts).

| Style | Weight | Size | Line height | Letter spacing | Use |
|-------|--------|------|-------------|---------------|-----|
| **Heading (XL)** | Bold (700) | 24px | 30px | — | Page titles |
| **Heading (L)** | Bold (700) | 18px | 23px | — | Section headings |
| **Heading (M)** | Bold (700) | 15px | 19px | — | Card titles, buttons |
| **Heading (S)** | Bold (700) | 12px | 15px | 2.4px (≈20%) | Labels, small headings |
| **Body (L)** | Medium (500) | 13px | 23px | — | Body copy, descriptions |
| **Body (M)** | Bold (700) | 12px | 15px | — | Captions, dense text |

---

## 3. Border radius

| Token | Value | Use |
|-------|--------|-----|
| **Small** | 2px | Checkbox inner, small controls |
| **Medium** | 4px | Inputs, checkboxes, dropdowns |
| **Large** | 6px | Color swatches, cards, panels |
| **XL** | 8px | Modals, popovers |
| **Button S** | 20px | Small buttons (pill) |
| **Button L** | 24px | Large primary button (pill) |

---

## 4. Interactive elements (components)

### Buttons
- **Button Primary (L):** Background Main Purple, radius 24px, text Heading (M), white. Hover: Main Purple (Hover).
- **Button Primary (S):** Background Main Purple, radius 20px, text style as per design, white. Hover: Main Purple (Hover).
- **Button Secondary:** Light fill (e.g. Light Grey Light BG or transparent), stroke Lines (Light), text Main Purple. Hover: slightly darker fill.
- **Button Destructive:** Background Red, radius 20px, white text. Hover: Red (Hover).

### Subtask checkbox
- **Idle:** Container bg Light Grey (Light BG), radius 4px; inner box white with Lines (Light) stroke, radius 2px.
- **Hovered:** Container bg Main Purple 25% opacity; inner box white with Lines (Light) stroke.
- **Completed:** Container bg Light Grey (Light BG); inner box Main Purple with white check; label text 50% opacity.

### Dropdown
- **Idle:** Container fill + stroke Lines (Light) / Lines (Dark), radius 4px; label Body (L) Black; chevron.
- **Active:** Same container with Main Purple 1px stroke; Body (L) Black.

### Text field
- **Idle:** White (or theme BG) fill, stroke Lines (Light) / Lines (Dark), radius 4px; placeholder Body (L) 25% opacity.
- **Focus:** Stroke Main Purple.
- **Error:** Stroke Red; helper text Body (L) Red (e.g. “Can’t be empty”).

---

## 5. Theming summary

| Role | Light | Dark |
|------|--------|------|
| **Background** | White / Light Grey (Light BG) | Very Dark Grey (Dark BG) |
| **Surface / card** | White, border Lines (Light) | Dark Grey, border Lines (Dark) |
| **Primary text** | Black | White |
| **Secondary text** | Medium Grey | Medium Grey |
| **Borders** | Lines (Light) | Lines (Dark) |
| **Primary accent** | Main Purple | Main Purple |
| **Destructive** | Red | Red |

---

*Extracted from the Design System frame (node 0-9066) in the [Kanban Task Management Web App](https://www.figma.com/design/dOOXJi8HUC0IqJ4uPyTYUh/kanban-task-management-web-app?node-id=0-9066) Figma file.*
