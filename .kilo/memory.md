# Project Memory

## Project Overview
Abbey Yung Hair Care Method Website - A mobile-centric web application guiding users through a comprehensive 21-step hair care routine.

## Tech Stack
- Next.js 15 with App Router
- React 19.1.0
- TypeScript
- Tailwind CSS v4
- ESLint

## Key Files
- `src/app/page.tsx` - Main page
- `src/app/layout.tsx` - App layout
- `src/components/StepComponent.tsx` - Step display component
- `src/data/steps.ts` - Step definitions
- `src/types.ts` - TypeScript interfaces
- `CONTEXT.md` - Project context and documentation

## Current Status
- Full 21-step method implemented with detailed steps 1-11
- Interactive step-by-step interface with optional step selection
- Timer functionality for treatment durations
- Progress tracking with visual progress bar
- Mobile-responsive design using Tailwind CSS
- Comprehensive product recommendations

## Architecture
- Server Components by default
- "use client" only for interactive elements (timers)
- Component-based structure in `src/components/`
- Tailwind CSS for mobile-first responsive design

## Future Plans
- Add local storage for progress saving
- Include product recommendations and links
- Add tutorial/help sections
- Implement user customization options
- Add notifications for timer completion

## Session Notes
- Memory initialized: 2026-01-14
