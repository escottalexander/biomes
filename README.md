# Procedural World Generator

A procedural world generator that uses Perlin noise to create infinite, explorable terrain with various biomes. The generator creates coherent landscapes by combining three layers of Perlin noise:

- Height map (terrain elevation)
- Moisture map (affects biome distribution)
- Temperature map (influences climate zones)

## Features

- Infinite terrain generation
- 2D and 3D visualization
- Multiple biomes based on height, moisture, and temperature
- Real-time terrain exploration
- Mobile-responsive design

## How It Works

The generator uses layered Perlin noise with different seeds to create natural-looking terrain. Each point in the world is determined by:
1. Height value (determines elevation)
2. Moisture value (affects vegetation)
3. Temperature value (influences climate)

These values combine to select appropriate biomes, creating a diverse and coherent world.

## Credits

Inspired by:
- [5/9's blog post on on-chain worlds](https://www.fiveoutofnine.com/blog/on-chain-worlds-with-terrain-generation)
- [Henrik Kniberg's terrain generation video](https://www.youtube.com/watch?v=CSa5O6knuwI)

## Live Demo

[View the live demo](https://perlin-noise-world-gen.vercel.app)

## License

MIT
