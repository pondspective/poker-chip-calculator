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

### Core Component Structure
- **Main component**: `poker-chip-calculator.tsx` - Single comprehensive React component containing all functionality
- **UI components**: Located in `components/ui/` - shadcn/ui components for consistent styling
- **Page integration**: `app/page.tsx` imports and renders the main component

### Key Features
- **Tournament Management**: Predefined tournament configurations with customizable chip denominations and blind structures
- **Timer System**: Automated blind level progression with audio alerts and manual controls
- **Multi-player Tracking**: Support for tracking multiple player stacks with real-time big blind calculations
- **Manual Mode**: Option to directly input blind levels without timer progression
- **Configuration Presets**: Built-in chip color schemes for different poker formats (Standard, WSOP, Cash Game, etc.)

### State Management
- Uses React hooks (useState, useEffect, useRef) for local state management
- Complex state objects for tournament configuration, timer state, and player stacks
- Real-time calculations for chip totals and big blind ratios

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