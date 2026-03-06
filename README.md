# TRD Remedial Website

Award-winning website for TRD Remedial - The Remedial Experts

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom theme
- **3D Graphics**: Three.js + React Three Fiber + Drei
- **Animations**: GSAP + Framer Motion
- **Smooth Scroll**: Lenis

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the website.

## Development Status

### ✅ Phase 1: Foundation (Weeks 1-2) - COMPLETED
- [x] Project setup with Next.js 14, TypeScript, Tailwind
- [x] Opening animation with video player and skip functionality
- [x] Header with scroll effects and mobile menu
- [x] Hero section with GSAP text animations and stats counter
- [x] Smooth scroll provider using Lenis
- [x] Footer component with contact info
- [x] Data structures (services, case studies, team)

### 🚧 Phase 2: Core Sections (Weeks 3-4) - NEXT
- [ ] Crisis Intervention section
- [ ] Services Showcase with 6 interactive cards
- [ ] Case Studies with interactive elements
- [ ] Why TRD section
- [ ] Leadership Team section

### ⏳ Phase 3: 3D Integration (Weeks 5-6)
- [ ] 3D model integration with Three.js
- [ ] Interactive hotspots and annotations
- [ ] 2D/3D toggle functionality

### ⏳ Phase 4: Polish & Performance (Weeks 7-8)
- [ ] Performance optimization
- [ ] Award submission preparation

## Required Assets

**See `.claude/plans/user-tasks-for-website-completion.md` for complete list**

### Immediate Needs:
- Opening animation video (<2MB WebM/MP4)
- TRD logo (SVG)
- Brand colors confirmation
- Hero section images (3-5 photos)

## Project Structure

```
src/
├── app/                # Next.js pages
├── components/
│   ├── animations/    # Animation components
│   ├── sections/      # Hero, Header, Footer
│   ├── ui/           # Reusable UI
│   ├── 3d/           # Three.js components
│   └── providers/    # Context providers
├── lib/              # Utils & constants
├── hooks/            # Custom hooks
├── data/             # Static data
└── public/           # Assets
```

## Performance Targets

- Desktop Lighthouse: 95+
- Mobile Lighthouse: 90+
- First Contentful Paint: <2s
- Frame rate: 60fps (desktop), 30fps (mobile 3D)

## License

Proprietary - TRD Remedial © 2025
