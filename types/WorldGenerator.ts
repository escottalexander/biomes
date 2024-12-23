export interface Biome {
  name: string;
  color: string;
  heightRange: [number, number];
  moistureRange: [number, number];
  temperatureRange: [number, number];
}

export interface NoiseConfig {
  scale: number;
  octaves: number;
  persistence: number;
  lacunarity: number;
  seed: number;
}

export interface WorldConfig {
  width: number;
  height: number;
  heightNoiseConfig: NoiseConfig;
  moistureNoiseConfig: NoiseConfig;
  temperatureNoiseConfig: NoiseConfig;
} 