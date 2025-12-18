# Abbey Yung Hair Care Method Website

## Project Purpose
A mobile-centric web application to guide users through the Abbey Yung hair care method, a comprehensive 21-step hair care routine. The app helps users navigate optional steps, set timers for treatments, and track their progress through the routine.

## Goals
- Provide an intuitive, mobile-first interface for the hair care routine
- Allow users to select optional steps
- Implement timer functionality for treatment durations
- Ensure easy navigation between steps
- Maintain a clean, user-friendly design optimized for mobile devices

## Tech Stack
- Next.js 15 with App Router
- React 19.1.0
- TypeScript
- Tailwind CSS v4
- ESLint for code quality

## Key Features
- Step-by-step guide through the 21-step Abbey Yung method
- Optional step selection
- Built-in timers for treatment durations
- Mobile-responsive design
- Progress tracking

## Architecture Decisions
- Using Next.js App Router for modern React development
- Server Components by default, with "use client" only for interactive elements (timers)
- Component-based structure in `src/components/` for reusability
- Tailwind CSS for styling to ensure mobile-first responsive design

## Project Structure
- `src/app/` - Pages and layouts
- `src/components/` - Reusable React components
- `src/app/globals.css` - Global styles with Tailwind
- `public/` - Static assets

## Current Status
- Full 21-step Abbey Yung method implemented with detailed steps 1-11
- Interactive step-by-step interface with optional step selection
- Timer functionality for treatment durations (10 min for step 1, 20 min for step 2)
- Progress tracking with visual progress bar
- Mobile-responsive design using Tailwind CSS
- Comprehensive product recommendations for each step including between-wash care
- Lint checks passed

## Method Overview
**Pre-Shower**: Pre-Shampoo Bond Repair Treatment* (1-2x a week), Pre-Shampoo Oil Treatment* (as needed)

**In-Shower**: Shampoo (as often as needed)—including clarifying (at least 1x a week), non-clarifying, and medicated* options; Bond Repair Treatment (varies by treatment); Conditioning (pick 1-2 products every wash)—including gloss, conditioner, and mask options

**Post-Shower**: Post-Wash Bond Repair Treatment* (1-2x a week), Leave-in Conditioner & Heat Protectant (every wash), Styling* (as often as needed), Style Sealers* (as often as needed)—including serum, lotion/cream, and oil options

**Between-Wash**: Conditioning Treatment or Oil*, Heat Protection*, Dry Shampoo*

*Steps marked with an asterisk (*) are optional.

## Implementation Details
- **Data Structure**: Steps defined in `src/data/steps.ts` with TypeScript interfaces in `src/types.ts`
- **Components**: `StepComponent` handles individual steps, timers, and navigation
- **State Management**: Client-side state for current step and timer
- **Styling**: Tailwind CSS v4 for mobile-first responsive design
- **Navigation**: Previous/Next buttons with progress indication
- **Optional Steps**: User can choose to skip or perform optional steps
- **Timers**: Built-in countdown timers with visual progress bars

## Future Plans
- Add local storage for progress saving
- Include product recommendations and links
- Add tutorial/help sections
- Implement user customization options
- Add notifications for timer completion