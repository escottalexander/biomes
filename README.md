# Perlin Noise World Generator

An interactive 2D world generator that uses multiple layers of Perlin noise to create diverse, procedurally generated terrain with various biomes.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- Real-time world generation using Perlin noise
- Multiple biome types based on height, moisture, and temperature
- Interactive navigation using WASD keys or arrow buttons
- Infinite world generation in any direction
- Deterministic world generation using seeds

## Controls

- **W/↑**: Move viewport up
- **A/←**: Move viewport left
- **S/↓**: Move viewport down
- **D/→**: Move viewport right
- **Regenerate World**: Creates a new world with fresh random seeds

## Technical Implementation

### Perlin Noise

The world generation uses three layers of Perlin noise:
1. **Height**: Determines elevation (oceans, beaches, land, mountains)
2. **Moisture**: Controls humidity (deserts, grasslands, forests)
3. **Temperature**: Affects climate zones (frozen, temperate, tropical)

Each noise layer uses different parameters:
- Height: Large scale (100) with 6 octaves for varied terrain
- Moisture: Medium scale (150) with 4 octaves for weather patterns
- Temperature: Largest scale (200) with 4 octaves for climate zones

### Biome System

Biomes are determined by combining three factors:
- Height (0-1): From deep ocean to mountain peaks
- Moisture (0-1): From arid to very wet
- Temperature (0-1): From frozen to tropical

Examples:
- Deep Ocean: height 0-0.2
- Desert: height 0.35-0.8, moisture 0-0.2, temperature 0.7-1
- Snowy Mountains: height 0.7-1, temperature 0-0.3

### World Generation

1. Uses a single base seed for deterministic generation
2. Derives separate seeds for height, moisture, and temperature using a hash function
3. Generates terrain in chunks as the user explores
4. Maintains viewport position while adding new terrain
5. Caches generated terrain to prevent regeneration

### Technical Stack

- Next.js for the framework
- TypeScript for type safety
- SVG for rendering
- Custom Perlin noise implementation
- React hooks for state management

## Architecture

```
├── components/
│   └── WorldGenerator.tsx    # Main world generation component
├── utils/
│   └── perlin.ts            # Perlin noise implementation
├── types/
│   └── WorldGenerator.ts    # TypeScript interfaces
└── pages/
    └── index.tsx            # Main page component
```
