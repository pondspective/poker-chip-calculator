# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a poker chip calculator and tournament timer application built with Next.js 15 and React 19. The main application consists of a single comprehensive component that provides:

- Poker chip stack calculation and tracking
- Tournament blind timer with customizable levels
- Multi-player stack comparison
- Configurable chip denominations and blind structures
- Import/export functionality for tournament configurations

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks

## Architecture

### Modular Component Structure (Refactored)
- **Main component**: `poker-chip-calculator.tsx` - Orchestrates the application by composing smaller components and hooks
- **UI components**: 
  - `components/ui/` - shadcn/ui components for consistent styling
  - `components/timer-display.tsx` - Timer UI with manual/automatic modes
  - `components/settings-dialog.tsx` - Tournament configuration management
  - `components/player-tabs.tsx` - Player stack management and chip input
  - `components/stack-comparison.tsx` - Player comparison display
- **Custom hooks**:
  - `hooks/use-timer.ts` - Timer functionality, auto-advance, sound alerts
  - `hooks/use-players.ts` - Player state management, chip calculations
- **Utility modules**:
  - `lib/types.ts` - TypeScript interfaces and types
  - `lib/tournament-configs.ts` - Default tournament configurations
  - `lib/poker-utils.ts` - Utility functions for calculations and formatting
- **Page integration**: `app/page.tsx` imports and renders the main component

### Key Features
- **Tournament Management**: Predefined tournament configurations with customizable chip denominations and blind structures
- **Timer System**: Automated blind level progression with audio alerts and manual controls
- **Multi-player Tracking**: Support for tracking multiple player stacks with real-time big blind calculations
- **Manual Mode**: Option to directly input blind levels without timer progression
- **Configuration Presets**: Built-in chip color schemes for different poker formats (Standard, WSOP, Cash Game, etc.)

### State Management
- **Custom hooks**: `useTimer` and `usePlayers` encapsulate complex state logic
- **Local state**: Tournament configuration and UI state managed in main component
- **Real-time calculations**: Chip totals and big blind ratios calculated automatically
- **Separation of concerns**: Timer logic, player management, and UI rendering are separated

### Data Structures
- `TournamentConfig`: Contains chip configurations and blind structure
- `PlayerStack`: Tracks individual player chip counts and calculated values
- `TimerState`: Manages tournament timer and progression settings
- `BlindLevel`: Defines small blind, big blind, ante, and duration for each level

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Icons**: Lucide React
- **TypeScript**: Full type safety throughout the application