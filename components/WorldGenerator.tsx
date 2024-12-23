import { useEffect, useRef, useState, useCallback } from 'react';
import { PerlinNoise } from '../utils/perlin';
import { Biome, WorldConfig } from '../types/WorldGenerator';

const BIOMES: Biome[] = [
  {
    name: 'Deep Ocean',
    color: '#000080',
    heightRange: [0, 0.2],
    moistureRange: [0, 1],
    temperatureRange: [0, 1],
  },
  {
    name: 'Frozen Ocean',
    color: '#7B9CD3',
    heightRange: [0.2, 0.3],
    moistureRange: [0, 1],
    temperatureRange: [0, 0.2],
  },
  {
    name: 'Ocean',
    color: '#0000FF',
    heightRange: [0.2, 0.3],
    moistureRange: [0, 1],
    temperatureRange: [0.2, 1],
  },
  {
    name: 'Frozen Beach',
    color: '#E8E8E8',
    heightRange: [0.3, 0.35],
    moistureRange: [0, 1],
    temperatureRange: [0, 0.2],
  },
  {
    name: 'Beach',
    color: '#FFE4B5',
    heightRange: [0.3, 0.35],
    moistureRange: [0, 1],
    temperatureRange: [0.2, 1],
  },
  {
    name: 'Desert',
    color: '#FFD700',
    heightRange: [0.35, 0.8],
    moistureRange: [0, 0.2],
    temperatureRange: [0.7, 1],
  },
  {
    name: 'Savanna',
    color: '#DAA520',
    heightRange: [0.35, 0.6],
    moistureRange: [0.2, 0.4],
    temperatureRange: [0.7, 1],
  },
  {
    name: 'Tropical Rainforest',
    color: '#006400',
    heightRange: [0.35, 0.7],
    moistureRange: [0.7, 1],
    temperatureRange: [0.7, 1],
  },
  {
    name: 'Grassland',
    color: '#90EE90',
    heightRange: [0.35, 0.6],
    moistureRange: [0.2, 0.4],
    temperatureRange: [0.4, 0.7],
  },
  {
    name: 'Deciduous Forest',
    color: '#228B22',
    heightRange: [0.35, 0.7],
    moistureRange: [0.4, 0.7],
    temperatureRange: [0.4, 0.7],
  },
  {
    name: 'Temperate Rainforest',
    color: '#2E8B57',
    heightRange: [0.35, 0.7],
    moistureRange: [0.7, 1],
    temperatureRange: [0.4, 0.7],
  },
  {
    name: 'Tundra',
    color: '#A9A9A9',
    heightRange: [0.35, 0.6],
    moistureRange: [0, 0.4],
    temperatureRange: [0, 0.4],
  },
  {
    name: 'Taiga',
    color: '#3B5E48',
    heightRange: [0.35, 0.7],
    moistureRange: [0.4, 1],
    temperatureRange: [0, 0.4],
  },
  {
    name: 'Snowy Mountains',
    color: '#FFFFFF',
    heightRange: [0.7, 1],
    moistureRange: [0, 1],
    temperatureRange: [0, 0.3],
  },
  {
    name: 'Mountains',
    color: '#808080',
    heightRange: [0.7, 1],
    moistureRange: [0, 1],
    temperatureRange: [0.3, 1],
  },
];

const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

const generateSeedFromBase = (baseSeed: number, type: 'height' | 'moisture' | 'temperature'): number => {
  return hashString(`${baseSeed}-${type}`);
};

const defaultConfig: WorldConfig = {
  width: 800,
  height: 600,
  heightNoiseConfig: {
    scale: 100,
    octaves: 6,
    persistence: 0.5,
    lacunarity: 2,
    seed: generateSeedFromBase(Math.floor(Math.random() * 1000000), 'height'),
  },
  moistureNoiseConfig: {
    scale: 150,
    octaves: 4,
    persistence: 0.5,
    lacunarity: 2,
    seed: generateSeedFromBase(Math.floor(Math.random() * 1000000), 'moisture'),
  },
  temperatureNoiseConfig: {
    scale: 200,
    octaves: 4,
    persistence: 0.5,
    lacunarity: 2,
    seed: generateSeedFromBase(Math.floor(Math.random() * 1000000), 'temperature'),
  },
};

const generateOctaveNoise = (
  noise: PerlinNoise,
  x: number,
  y: number,
  config: WorldConfig['heightNoiseConfig']
): number => {
  let amplitude = 1;
  let frequency = 1;
  let noiseValue = 0;
  let amplitudeSum = 0;

  for (let i = 0; i < config.octaves; i++) {
    const sampleX = (x / config.scale) * frequency;
    const sampleY = (y / config.scale) * frequency;
    
    noiseValue += noise.noise(sampleX, sampleY) * amplitude;
    amplitudeSum += amplitude;

    amplitude *= config.persistence;
    frequency *= config.lacunarity;
  }

  return noiseValue / amplitudeSum;
};

const getBiome = (height: number, moisture: number, temperature: number): Biome => {
  return BIOMES.find(
    (biome) =>
      height >= biome.heightRange[0] &&
      height < biome.heightRange[1] &&
      moisture >= biome.moistureRange[0] &&
      moisture < biome.moistureRange[1] &&
      temperature >= biome.temperatureRange[0] &&
      temperature < biome.temperatureRange[1]
  ) || BIOMES[0];
};

export const WorldGenerator: React.FC<{ config?: Partial<WorldConfig> }> = ({
  config: userConfig,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [config, setConfig] = useState({ ...defaultConfig, ...userConfig });
  const [baseSeed, setBaseSeed] = useState(Math.floor(Math.random() * 1000000));
  const [currentRows, setCurrentRows] = useState<Array<Array<[number, number, string]>>>([]);
  const [currentCols, setCurrentCols] = useState<Array<Array<[number, number, string]>>>([]);
  const [viewportOffset, setViewportOffset] = useState({ x: 0, y: 0 });
  const pixelSize = 4;
  const cols = Math.floor(config.width / pixelSize);
  const rows = Math.floor(config.height / pixelSize);

  const generatePixel = useCallback((x: number, y: number) => {
    const heightNoise = new PerlinNoise(config.heightNoiseConfig.seed);
    const moistureNoise = new PerlinNoise(config.moistureNoiseConfig.seed);
    const temperatureNoise = new PerlinNoise(config.temperatureNoiseConfig.seed);

    const height = (generateOctaveNoise(
      heightNoise,
      x,
      y,
      config.heightNoiseConfig
    ) + 1) / 2;

    const moisture = (generateOctaveNoise(
      moistureNoise,
      x,
      y,
      config.moistureNoiseConfig
    ) + 1) / 2;

    const temperature = (generateOctaveNoise(
      temperatureNoise,
      x,
      y,
      config.temperatureNoiseConfig
    ) + 1) / 2;

    return getBiome(height, moisture, temperature);
  }, [config]);

  const addRow = useCallback((direction: 'top' | 'bottom') => {
    const newRow: Array<[number, number, string]> = [];
    const y = direction === 'top' ? -1 : rows;
    const adjustedY = y + viewportOffset.y;
    
    // Check if this row already exists
    const rowExists = currentRows.some(row => 
      row.some(([_, rowY]) => rowY === adjustedY)
    );
    
    if (!rowExists) {
      for (let x = -currentCols.length; x < cols + currentCols.length; x++) {
        const adjustedX = x + viewportOffset.x;
        const biome = generatePixel(adjustedX, adjustedY);
        newRow.push([adjustedX, adjustedY, biome.color]);
      }
      setCurrentRows(prev => direction === 'top' ? [newRow, ...prev] : [...prev, newRow]);
    }

    // Always update viewport
    if (direction === 'top') {
      setViewportOffset(prev => ({ ...prev, y: prev.y - 1 }));
    } else {
      setViewportOffset(prev => ({ ...prev, y: prev.y + 1 }));
    }
  }, [cols, currentCols.length, currentRows, generatePixel, viewportOffset]);

  const addColumn = useCallback((direction: 'left' | 'right') => {
    const newCol: Array<[number, number, string]> = [];
    const x = direction === 'left' ? -1 : cols;
    const adjustedX = x + viewportOffset.x;
    
    // Check if this column already exists
    const colExists = currentCols.some(col => 
      col.some(([colX]) => colX === adjustedX)
    );
    
    if (!colExists) {
      for (let y = -currentRows.length; y < rows + currentRows.length; y++) {
        const adjustedY = y + viewportOffset.y;
        const biome = generatePixel(adjustedX, adjustedY);
        newCol.push([adjustedX, adjustedY, biome.color]);
      }
      setCurrentCols(prev => direction === 'left' ? [newCol, ...prev] : [...prev, newCol]);
    }

    // Always update viewport
    if (direction === 'left') {
      setViewportOffset(prev => ({ ...prev, x: prev.x - 1 }));
    } else {
      setViewportOffset(prev => ({ ...prev, x: prev.x + 1 }));
    }
  }, [cols, currentCols, currentRows.length, generatePixel, rows, viewportOffset]);

  const handleKeyPress = (event: KeyboardEvent) => {
    switch (event.key.toLowerCase()) {
      case 'w':
        addRow('top');
        break;
      case 's':
        addRow('bottom');
        break;
      case 'a':
        addColumn('left');
        break;
      case 'd':
        addColumn('right');
        break;
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [addRow, addColumn]); // Include the functions used in handleKeyPress

  useEffect(() => {
    if (!svgRef.current) return;

    const heightNoise = new PerlinNoise(config.heightNoiseConfig.seed);
    const moistureNoise = new PerlinNoise(config.moistureNoiseConfig.seed);
    const temperatureNoise = new PerlinNoise(config.temperatureNoiseConfig.seed);

    let svgContent = '';

    // Generate base world
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const height = (generateOctaveNoise(
          heightNoise,
          x + viewportOffset.x,
          y + viewportOffset.y,
          config.heightNoiseConfig
        ) + 1) / 2;

        const moisture = (generateOctaveNoise(
          moistureNoise,
          x + viewportOffset.x,
          y + viewportOffset.y,
          config.moistureNoiseConfig
        ) + 1) / 2;

        const temperature = (generateOctaveNoise(
          temperatureNoise,
          x + viewportOffset.x,
          y + viewportOffset.y,
          config.temperatureNoiseConfig
        ) + 1) / 2;

        const biome = getBiome(height, moisture, temperature);
        
        svgContent += `<rect x="${x * pixelSize}" y="${
          y * pixelSize
        }" width="${pixelSize}" height="${pixelSize}" fill="${
          biome.color
        }" />`;
      }
    }

    // Add extra rows and columns relative to viewport
    currentRows.forEach(row => {
      row.forEach(([x, y, color]) => {
        const relativeX = (x - viewportOffset.x) * pixelSize;
        const relativeY = (y - viewportOffset.y) * pixelSize;
        svgContent += `<rect x="${relativeX}" y="${relativeY}" width="${pixelSize}" height="${pixelSize}" fill="${color}" />`;
      });
    });

    currentCols.forEach(col => {
      col.forEach(([x, y, color]) => {
        const relativeX = (x - viewportOffset.x) * pixelSize;
        const relativeY = (y - viewportOffset.y) * pixelSize;
        svgContent += `<rect x="${relativeX}" y="${relativeY}" width="${pixelSize}" height="${pixelSize}" fill="${color}" />`;
      });
    });

    svgRef.current.innerHTML = svgContent;
  }, [config, currentRows, currentCols, viewportOffset]);

  const regenerateWorld = useCallback(() => {
    const newBaseSeed = Math.floor(Math.random() * 1000000);
    setBaseSeed(newBaseSeed);
    const newConfig = {
      ...config,
      heightNoiseConfig: {
        ...config.heightNoiseConfig,
        seed: generateSeedFromBase(newBaseSeed, 'height'),
      },
      moistureNoiseConfig: {
        ...config.moistureNoiseConfig,
        seed: generateSeedFromBase(newBaseSeed, 'moisture'),
      },
      temperatureNoiseConfig: {
        ...config.temperatureNoiseConfig,
        seed: generateSeedFromBase(newBaseSeed, 'temperature'),
      },
    };
    setConfig(newConfig);
    setCurrentRows([]);
    setCurrentCols([]);
    setViewportOffset({ x: 0, y: 0 });
  }, [config]);

  return (
    <div className="world-generator">
      <div className="controls">
        <div className="seed-info">
          <p>Base Seed: {baseSeed}</p>
          <p>Height Seed: {config.heightNoiseConfig.seed}</p>
          <p>Moisture Seed: {config.moistureNoiseConfig.seed}</p>
          <p>Temperature Seed: {config.temperatureNoiseConfig.seed}</p>
          <p>Viewport: ({viewportOffset.x}, {viewportOffset.y})</p>
        </div>
        <button onClick={regenerateWorld}>Regenerate World</button>
        <div className="direction-controls">
          <button onClick={() => addRow('top')}>↑</button>
          <div className="horizontal-controls">
            <button onClick={() => addColumn('left')}>←</button>
            <button onClick={() => addColumn('right')}>→</button>
          </div>
          <button onClick={() => addRow('bottom')}>↓</button>
        </div>
      </div>
      <div className="svg-container">
        <svg
          ref={svgRef}
          width={config.width}
          height={config.height}
          style={{ border: '1px solid #ccc' }}
        />
      </div>
      <style jsx>{`
        .world-generator {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        .controls {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        .seed-info {
          text-align: center;
        }
        .seed-info p {
          margin: 0.25rem 0;
        }
        .direction-controls {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        .horizontal-controls {
          display: flex;
          gap: 1rem;
        }
        .svg-container {
          border: 1px solid #ccc;
          border-radius: 8px;
        }
        button {
          padding: 0.5rem 1rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          background: white;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        button:hover {
          background: #f0f0f0;
        }
      `}</style>
    </div>
  );
}; 