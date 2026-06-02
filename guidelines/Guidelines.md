# Windows Port Monitor - Design Guidelines

## Aesthetic Stance: Data-Dense Technical Interface

Inspired by Bloomberg Terminal and professional system monitoring tools. Maximum information density with functional color coding and minimal decorative elements.

## Typography

### Primary Fonts
- **Display/Headings**: DM Sans (geometric sans, clean and technical)
- **Body/UI Labels**: DM Sans
- **Data/Code**: JetBrains Mono (for ports, PIDs, process names, paths)

### Type Scale
- Display: 24px, weight 600
- Heading: 18px, weight 600
- Body: 14px, weight 400
- Data: 13px, weight 400 (mono)
- Caption: 12px, weight 400

## Color System

### Dark Mode Foundation
- **Background**: `#0a0e14` (deep charcoal, nearly black)
- **Surface**: `#151a21` (elevated panels)
- **Surface Hover**: `#1c2228`
- **Border**: `#2d333b` (subtle dividers)

### Functional Colors
- **Success/Listening**: `#3fb950` (active listening ports)
- **Warning/Established**: `#d29922` (established connections)
- **Danger/Blocked**: `#f85149` (blocked or suspicious ports)
- **Info/TCP**: `#58a6ff` (TCP protocol indicator)
- **Info/UDP**: `#a371f7` (UDP protocol indicator)
- **Muted**: `#6e7681` (inactive states, labels)

### Text Colors
- **Primary**: `#e6edf3` (main text)
- **Secondary**: `#8b949e` (supporting text)
- **Tertiary**: `#6e7681` (de-emphasized text)

## Component Patterns

### Data Table
- Dense row height: 36px
- Alternating row background: transparent / `rgba(255,255,255,0.02)`
- Hover state: `rgba(255,255,255,0.05)`
- Monospace font for port numbers, PIDs, and process names
- Status indicators as colored dots (8px diameter)
- Right-align numeric columns

### Cards/Panels
- Background: `--surface`
- Border: 1px solid `--border`
- Border radius: 8px
- Padding: 16px
- No shadows (flat design)

### Buttons
- Primary: Filled with accent color
- Secondary: Border with transparent background
- Danger: Filled with red
- Height: 32px
- Border radius: 6px
- Monospace font for action buttons (START, STOP, KILL)

### Status Badges
- Small pills with colored background at 15% opacity
- Colored text matching background
- Border radius: 4px
- Padding: 2px 8px
- Uppercase, 11px font size

### Charts/Graphs
- Use functional colors for different metrics
- Thin lines (1-2px)
- Minimal grid lines
- No background fill
- Crisp, technical aesthetic

## Layout Principles

1. **Grid-based**: Use CSS Grid for main layout sections
2. **Maximum density**: Minimize whitespace in data areas, generous spacing in control areas
3. **Fixed header**: Keep main controls always visible
4. **Scrollable content**: Tables and lists scroll independently
5. **Split panels**: Resizable panels for port list vs. process details
6. **Responsive breakpoint**: ~1000px (collapse to single column)

## Interaction Patterns

1. **Real-time updates**: Live refresh of port/process data
2. **Row selection**: Click row to see details
3. **Multi-select**: Checkbox column for batch operations
4. **Quick actions**: Contextual buttons on hover
5. **Filter/Search**: Instant search with highlight
6. **Sort**: Click column headers to sort

## Data Display

1. **Use real-looking data**: Actual port numbers (80, 443, 3000, 5432, 8080)
2. **Real process names**: chrome.exe, node.exe, postgres.exe, System
3. **Realistic PIDs**: 4-5 digit numbers
4. **Actual protocols**: TCP, UDP, TCP6, UDP6
5. **IP addresses**: 0.0.0.0, 127.0.0.1, ::, specific IPs
6. **States**: LISTENING, ESTABLISHED, TIME_WAIT, CLOSE_WAIT

## Accessibility

- Minimum contrast ratio: 4.5:1 for body text
- Interactive elements: 3:1 contrast minimum
- Focus visible on all interactive elements
- Status communicated through icons + color (not color alone)
- Keyboard navigation support

## Animation

- Minimal, functional only
- Row highlight: 150ms ease
- Data refresh: Subtle fade (200ms)
- Panel resize: Smooth 250ms
- No decorative animation
