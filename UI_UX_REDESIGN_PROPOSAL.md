# REALFORGE AI - UI/UX Redesign Proposal
## Transforming MVP to Professional B2B SaaS for Real Estate Agents

### Global Visual Direction

**Color Palette:**
- **Base Background:** Dark neutral (anthracite/very dark blue) - `hsl(220 15% 12%)`
- **Surface Cards:** Slightly lighter neutral - `hsl(220 15% 16%)`
- **Accent 1 (Primary):** Trust/Finance Green - `hsl(142 76% 36%)` for primary CTAs, success states
- **Accent 2 (Secondary):** AI/Tech Purple-Blue - `hsl(250 86% 65%)` for secondary actions, AI indicators
- **Text:** High contrast white/light gray - `hsl(0 0% 95%)` for body, `hsl(0 0% 100%)` for headings
- **Muted Text:** `hsl(220 8% 65%)` for labels, descriptions
- **Borders:** `hsl(220 15% 22%)` for subtle separation

**Typography:**
- **Primary Font:** Inter (utilitarian, highly readable)
- **Scale:** 
  - H1: `2.5rem` (40px) / `font-weight: 700`
  - H2: `2rem` (32px) / `font-weight: 600`
  - H3: `1.5rem` (24px) / `font-weight: 600`
  - Body: `1rem` (16px) / `font-weight: 400`
  - Small: `0.875rem` (14px) / `font-weight: 400`

**Spacing System (8px base):**
- `space-1`: 4px (0.25rem)
- `space-2`: 8px (0.5rem)
- `space-3`: 12px (0.75rem)
- `space-4`: 16px (1rem)
- `space-6`: 24px (1.5rem)
- `space-8`: 32px (2rem)
- `space-12`: 48px (3rem)

**Component Design Principles:**
- Cards with subtle elevation (shadow: `0 1px 3px rgba(0,0,0,0.3)`)
- Rounded corners: `8px` (0.5rem)
- Consistent border widths: `1px`
- Interactive elements have clear hover/focus states
- All CTAs follow Fitt's Law (easily clickable targets)

---

### Dashboard Layout (`/`)

**Overall Structure:**
```
┌─────────────────────────────────────────────────────────────┐
│  Fixed Navbar (64px)                                        │
├─────────────────────────────────────────────────────────────┤
│  │ Collapsible Sidebar (280px) │  Main Content Area        │
│  │                              │                           │
│  │ • Workspace                 │  • Hero Section           │
│  │ • Operations                │  • Dashboard Cards        │
│  │ • Usage Panel               │  • Charts & Tables        │
│  │                              │  • Automation Section     │
└─────────────────────────────────────────────────────────────┘
```

#### 1. Fixed Top Navbar (64px height)
- **Left:** Small logo + "REALFORGE AI" text (logo: stylized "R" in accent green)
- **Center:** Navigation tabs: Dashboard, Listings, CRM, Media, Analytics
- **Right:** User avatar + name/role + "Pro plan" badge
  - Microcopy: "Jan Makléř · Senior Agent" + badge "Pro"

#### 2. Collapsible Left Sidebar (280px width when expanded)
- **Workspace Section:**
  - Dashboard (Home icon)
  - Listings (Building icon)
  - CRM (Users icon)
  - Media (Image icon)
  - Analytics (BarChart icon)
  
- **Operations Section:**
  - Automations (Zap icon)
  - Integrations (Globe icon)
  - Settings (Settings icon)
  
- **Bottom Usage Panel:**
  - Progress bar: "85 GB / 100 GB"
  - Plan indicator: "Pro · 1,999 Kč/měsíc"
  - Link: "Billing & Usage"

#### 3. Main Content - Dashboard

**Row 1: Top Action Cards (3-column grid)**
```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  New Listing    │ │  Pipeline Today │ │  AI Queue       │
│  • Icon: Upload │ │  • New Leads: 5 │ │  • In Queue: 12 │
│  • "Nahrát      │ │  • Open Tasks: 3│ │  • Est. Cost:   │
│     nový listing│ │  • Exports: 2   │ │     1,450 Kč    │
│  • Sub: AI udělá│ │                 │ │  • This Month   │
│     fotky, popis│ │                 │ │                 │
│     za <30s"    │ │                 │ │                 │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

**Row 2: Analytics & Recent Activity (2-column grid)**
- **Left Column:** Chart "Leady za posledních 30 dní"
  - Line/area chart showing lead trends
  - Time filter: 7d / 30d / 90d
  - Microcopy: "Celkem: 142 leadů (+12% oproti minulému měsíci)"
  
- **Right Column:** "Recent Listings" Table
  ```
  ┌─────────────────────────────────────────────────────────┐
  │  Recent Listings (5 items)                              │
  ├─────┬─────────────────┬─────────┬────────────┬─────────┤
  │ Foto│ Adresa          │ Stav    │ Poslední   │ Akce    │
  │     │                 │         │ akce       │         │
  ├─────┼─────────────────┼─────────┼────────────┼─────────┤
  │ [ ] │ Na Příkopě 22   │ Draft   │ 2h ago     │ Continue│
  │ [ ] │ Václavské nám.  │ Exported│ Yesterday  │ View    │
  │ [ ] │ Karlovo nám. 5  │ Published 1d ago     │ Edit    │
  └─────┴─────────────────┴─────────┴────────────┴─────────┘
  ```

**Row 3: Automation Section (Full width)**
- **Header:** "Automatizace portálů"
- **Cards Grid (3-column):**
  ```
  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
  │  Sreality       │ │  Bezrealitky    │ │  FB Marketplace │
  │  • Status:      │ │  • Status:      │ │  • Status:      │
  │     Connected   │ │     Connected   │ │     Not Connected│
  │  • Last sync:   │ │  • Last sync:   │ │  • Last sync:   │
  │     2h ago      │ │     1d ago      │ │     Never       │
  │  • CTA: Manage  │ │  • CTA: Manage  │ │  • CTA: Connect │
  └─────────────────┘ └─────────────────┘ └─────────────────┘
  ```

---

### Hero & Marketing Section

**Position:** Above the fold, immediately after navbar
**Design:** Clean, minimal, focused on value proposition

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  [Badge: "Trusted by 250+ real estate agencies"]           │
│                                                             │
│  H1: "Jeden listing. Všechny portály. Za 30 vteřin."       │
│                                                             │
│  Subtitle: "REALFORGE AI se postará o fotky, popis i       │
│            exporty. Ty se staráš jen o klienty."           │
│                                                             │
│  [Primary CTA] "Nahrát první listing"                      │
│  [Secondary CTA] "Zobrazit demo"                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Technical Stack Section (Below hero, subtle):**
- Small section titled "Pro developery"
- Icons/logos: Next.js, Prisma, PostgreSQL, Python AI
- Microcopy: "Built with modern stack for reliability"

---

### Settings Layout (`/settings`)

**Overall Structure:**
```
┌─────────────────────────────────────────────────────────────┐
│  Settings Header                                            │
├─────────────────────────────────────────────────────────────┤
│  │ Vertical Tabs  │  Content Area (Card-based)            │
│  │ • Profile      │                                         │
│  │ • Office       │  ┌─────────────────────────────────┐   │
│  │ • Notifications│  │  Card: Section Title            │   │
│  │ • Integrations │  │  • Description                  │   │
│  │ • Billing      │  │  • Form (2-col on desktop)      │   │
│  │ • Security     │  │  • Actions                      │   │
│  │ • Data Mgmt    │  └─────────────────────────────────┘   │
│  │                │                                         │
│  │                │  [Sticky Bottom Bar]                   │
│  │                │  "Máte neuložené změny"                │
│  │                │  [Save] [Cancel]                       │
└─────────────────────────────────────────────────────────────┘
```

#### 1. Vertical Navigation Tabs (Left, 240px width)
- Active tab highlighted with accent color
- Icons for each section:
  - Profile (User icon)
  - Office (Building2 icon)
  - Notifications (Bell icon)
  - Integrations (Globe icon)
  - Billing (CreditCard icon)
  - Security (Shield icon)
  - Data Management (Database icon)

#### 2. Content Area - Card-based Layout
Each section is a card with:
- **Title** (H2 size)
- **Short description** explaining purpose
- **Form inputs** arranged in 2 columns on desktop, stacked on mobile
- **Actions** at card bottom

**Example - Profile Card:**
```
┌─────────────────────────────────────────────────┐
│  Profile                                        │
│  Manage your personal information and office    │
│  details                                        │
│                                                 │
│  [Name]        Jan Makléř          [Email]     │
│                                                 │
│  [Phone]       +420 777 123 456    [Office]    │
│                                                 │
│  [Role]        Senior Real Estate Agent        │
│                                                 │
│  [Save Changes] [Reset]                        │
└─────────────────────────────────────────────────┘
```

#### 3. Integrations Section - Detailed View
```
┌─────────────────────────────────────────────────┐
│  Integrace portálů                              │
│  Connect and manage your real estate platforms  │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Sreality                               │   │
│  │  • Logo                                 │   │
│  │  • Status: Connected                    │   │
│  │  • Last sync: Today, 10:30              │   │
│  │  • [Manage] [Disconnect]                │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Bezrealitky                            │   │
│  │  • Logo                                 │   │
│  │  • Status: Connected                    │   │
│  │  • Last sync: Yesterday, 09:15          │   │
│  │  • [Manage] [Disconnect]                │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  FB Marketplace                         │   │
│  │  • Logo                                 │   │
│  │  • Status: Not Connected               │   │
│  │  • Last sync: Never                    │   │
│  │  • [Connect]                           │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

#### 4. Sticky Bottom Bar
- Appears when form fields are modified
- Background: `hsl(220 15% 20%)` with subtle shadow
- Content: "Máte neuložené změny" + buttons "Uložit" (primary) / "Zrušit" (secondary)
- Auto-hides when all changes saved

---

### Key Components & Microcopy

#### 1. Cards
- **Dashboard Cards:** Clean, with icon + title + value + action
- **Settings Cards:** More detailed, with descriptions and forms
- **Integration Cards:** Platform-specific with status indicators

#### 2. Tables
- **Recent Listings Table:**
  - Columns: Thumbnail, Address, Status, Last Action, CTA
  - Status badges: "Draft" (gray), "Published" (green), "Exported" (blue)
  - CTA: "Continue", "View", "Edit" based on state

#### 3. Charts
- **Leads Chart:** Clean line/area chart
- **Time filters:** 7d / 30d / 90d toggle buttons
- **Summary stats:** Displayed above chart

#### 4. Badges & Status Indicators
- **Plan Badge:** "Pro" (accent green), "Business" (purple-blue), "Free" (gray)
- **Connection Status:** "Connected" (green), "Not Connected" (gray), "Error" (red)
- **Listing Status:** "Draft", "Processing", "Published", "Exported"

#### 5. CTA Buttons
- **Primary:** Green accent, for main actions ("Nahrát listing", "Uložit")
- **Secondary:** Purple-blue, for secondary actions ("Zobrazit demo", "Spravovat")
- **Ghost/Outline:** For less important actions ("Cancel", "Disconnect")

#### 6. Form Elements
- **Labels:** Clear, concise, above inputs
- **Inputs:** Consistent height, border radius, focus states
- **Validation:** Real-time feedback with appropriate colors
- **Help text:** Below inputs where needed

#### 7. Microcopy Guidelines
- **Use active voice:** "AI will create photos" not "Photos will be created by AI"
- **Be concise:** "Upload new listing" not "Click here to upload a new listing"
- **Use Czech naturally:** "Nahrát nový listing" (not overly formal)
- **Provide context:** "Last sync: 2 hours ago" not just "2h"
- **Error messages:** Helpful, actionable ("Please enter a valid phone number")
- **Empty states:** Encouraging ("No listings yet. Upload your first one!")

---

### Responsive Behavior

**Desktop (≥1024px):**
- Full sidebar visible
- 2-3 column grids
- Horizontal navigation in navbar

**Tablet (768px-1023px):**
- Sidebar collapses to icons only
- 2-column grids
- Navigation moves to hamburger menu if needed

**Mobile (<768px):**
- Sidebar hidden (accessible via menu)
- All grids stack to single column
- Forms stack vertically
- Bottom navigation bar for key actions

---

### Implementation Notes for React/Next.js + Tailwind

1. **Update globals.css** with new color palette
2. **Create new layout components:**
   - `DashboardLayout.tsx` with navbar + sidebar structure
   - `SettingsLayout.tsx` with vertical tabs
3. **Extend existing Shadcn components** with new variants for accent colors
4. **Implement responsive grids** using Tailwind's grid utilities
5. **Add new icons** for real estate specific actions
6. **Create reusable card components** for dashboard items
7. **Implement form state management** for settings pages
8. **Add loading skeletons** for better UX during data fetching

This redesign transforms REALFORGE AI from an MVP demo into a professional B2B SaaS tool that real estate agents will want to use daily, focusing on their workflow and productivity rather than technical implementation details.