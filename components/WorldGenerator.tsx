import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { PerlinNoise } from '../utils/perlin';
import { Biome, WorldConfig } from '../types/WorldGenerator';
import World3DView from './World3DView';

const BIOMES: Biome[] = [
    // Water bodies - nested by depth
    {
      name: 'Deep Ocean',
      color: '#000080',
      heightRange: [0, 0.15],
      moistureRange: [0, 1],
      temperatureRange: [0, 1],
    },
    {
      name: 'Ocean',
      color: '#0000FF',
      heightRange: [0.15, 0.35],
      moistureRange: [0, 1],
      temperatureRange: [0.35, 1],
    },
    {
      name: 'Frozen Ocean',
      color: '#6191C1',
      heightRange: [0.15, 0.35],
      moistureRange: [0, 1],
      temperatureRange: [0, 0.35],
    },
    {
      name: 'Shallow Water',
      color: '#4169E1',
      heightRange: [0.35, 0.40],
      moistureRange: [0, 1],
      temperatureRange: [0.35, 1],
    },
    {
        name: 'Frozen Shallow Water',
        color: '#7B9CD3',
        heightRange: [0.35, 0.40],
        moistureRange: [0, 1],
        temperatureRange: [0, 0.35],
      },
    // Coastal
    {
      name: 'Frozen Beach',
      color: '#E8E8E8',
      heightRange: [0.40, 0.42],
      moistureRange: [0, 1],
      temperatureRange: [0, 0.35],
    },
    {
      name: 'Beach',
      color: '#FFE4B5',
      heightRange: [0.40, 0.42],
      moistureRange: [0, 1],
      temperatureRange: [0.35, 1],
    },
    // Hot climates - Low elevation
    {
      name: 'Desert',
      color: '#FFD700',
      heightRange: [0.42, 0.6],
      moistureRange: [0, 0.2],
      temperatureRange: [0.7, 1],
    },
    {
      name: 'Savanna',
      color: '#DAA520',
      heightRange: [0.42, 0.6],
      moistureRange: [0.2, 0.4],
      temperatureRange: [0.7, 1],
    },
    {
      name: 'Tropical Forest',
      color: '#228B22',
      heightRange: [0.42, 0.6],
      moistureRange: [0.4, 0.7],
      temperatureRange: [0.7, 1],
    },
    {
      name: 'Tropical Rainforest',
      color: '#006400',
      heightRange: [0.42, 0.6],
      moistureRange: [0.7, 1],
      temperatureRange: [0.7, 1],
    },
    // Temperate climates - Low elevation
    {
      name: 'Grassland',
      color: '#90EE90',
      heightRange: [0.42, 0.6],
      moistureRange: [0.2, 0.5],
      temperatureRange: [0.4, 0.7],
    },
    {
      name: 'Deciduous Forest',
      color: '#228B22',
      heightRange: [0.42, 0.6],
      moistureRange: [0.5, 0.7],
      temperatureRange: [0.4, 0.7],
    },
    {
      name: 'Temperate Rainforest',
      color: '#2E8B57',
      heightRange: [0.42, 0.6],
      moistureRange: [0.7, 1],
      temperatureRange: [0.4, 0.7],
    },
    // Cold climates - Low elevation
    {
      name: 'Tundra',
      color: '#A9A9A9',
      heightRange: [0.42, 0.6],
      moistureRange: [0, 0.5],
      temperatureRange: [0, 0.4],
    },
    {
      name: 'Taiga',
      color: '#3B5E48',
      heightRange: [0.42, 0.6],
      moistureRange: [0.5, 1],
      temperatureRange: [0, 0.4],
    },
    // Hot climates - Mid elevation (Hills)
    {
      name: 'Desert Hills',
      color: '#EDC9AF',
      heightRange: [0.6, 0.7],
      moistureRange: [0, 0.2],
      temperatureRange: [0.7, 1],
    },
    {
      name: 'Savanna Hills',
      color: '#BDB76B',
      heightRange: [0.6, 0.7],
      moistureRange: [0.2, 0.5],
      temperatureRange: [0.7, 1],
    },
    {
      name: 'Tropical Highland Forest',
      color: '#004225',
      heightRange: [0.6, 0.7],
      moistureRange: [0.5, 0.7],
      temperatureRange: [0.7, 1],
    },
    {
      name: 'Tropical Highland Rainforest',
      color: '#004B23',
      heightRange: [0.6, 0.7],
      moistureRange: [0.7, 1],
      temperatureRange: [0.7, 1],
    },
    // Temperate climates - Mid elevation (Hills)
    {
      name: 'Highland Grassland',
      color: '#7FBB6B',
      heightRange: [0.6, 0.7],
      moistureRange: [0.2, 0.5],
      temperatureRange: [0.4, 0.7],
    },
    {
      name: 'Highland Forest',
      color: '#1B4D3E',
      heightRange: [0.6, 0.7],
      moistureRange: [0.5, 0.7],
      temperatureRange: [0.4, 0.7],
    },
    {
      name: 'Highland Rainforest',
      color: '#1B3D2F',
      heightRange: [0.6, 0.7],
      moistureRange: [0.7, 1],
      temperatureRange: [0.4, 0.7],
    },
    // Cold climates - Mid elevation (Hills)
    {
      name: 'Rocky Tundra',
      color: '#8B8589',
      heightRange: [0.6, 0.7],
      moistureRange: [0, 0.5],
      temperatureRange: [0, 0.4],
    },
    {
      name: 'Highland Taiga',
      color: '#2B4538',
      heightRange: [0.6, 0.7],
      moistureRange: [0.5, 1],
      temperatureRange: [0, 0.4],
    },
    // Mountains (High elevation)
    {
      name: 'Snowy Peak',
      color: '#FFFFFF',
      heightRange: [0.7, 1],
      moistureRange: [0, 1],
      temperatureRange: [0, 0.35],
    },
    {
      name: 'Rocky Peak',
      color: '#808080',
      heightRange: [0.7, 1],
      moistureRange: [0, 0.5],
      temperatureRange: [0.35, 1],
    },
    {
      name: 'Vegetated Peak',
      color: '#4A6741',
      heightRange: [0.7, 1],
      moistureRange: [0.5, 1],
      temperatureRange: [0.35, 1],
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
    scale: 50,
    octaves: 6,
    persistence: 0.5,
    lacunarity: 2,
    seed: 0,
  },
  moistureNoiseConfig: {
    scale: 100,
    octaves: 6,
    persistence: 0.5,
    lacunarity: 2,
    seed: 0,
  },
  temperatureNoiseConfig: {
    scale: 110,
    octaves: 6,
    persistence: 0.1,
    lacunarity: 2,
    seed: 0,
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
  const [baseSeed, setBaseSeed] = useState(123456);
  const [currentRows, setCurrentRows] = useState<Array<Array<[number, number, string]>>>([]);
  const [currentCols, setCurrentCols] = useState<Array<Array<[number, number, string]>>>([]);
  const [viewportOffset, setViewportOffset] = useState({ x: 1000, y: 1000 });
  const [tooltip, setTooltip] = useState<{ show: boolean; text: string; x: number; y: number }>({
    show: false,
    text: '',
    x: 0,
    y: 0
  });
  const pixelSize = 4;
  const cols = Math.floor(config.width / pixelSize);
  const rows = Math.floor(config.height / pixelSize);
  const [show3D, setShow3D] = useState(false);
  const [previewsVisible, setPreviewsVisible] = useState(false);

  // Set random seed after initial render (client-side only)
  useEffect(() => {
    setBaseSeed(Math.floor(Math.random() * 1000000));
  }, []); // Empty dependency array means this runs once after mount

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
    const moveAmount = 3; // Number of rows to add at once
    const newRows: Array<Array<[number, number, string]>> = [];
    
    for (let step = 0; step < moveAmount; step++) {
      const y = direction === 'top' ? -(step + 1) : rows + step;
      const adjustedY = y + viewportOffset.y;
      
      // Check if this row already exists
      const rowExists = currentRows.some(row => 
        row.some(([_, rowY]) => rowY === adjustedY)
      );
      
      if (!rowExists) {
        const newRow: Array<[number, number, string]> = [];
        for (let x = -currentCols.length; x < cols + currentCols.length; x++) {
          const adjustedX = x + viewportOffset.x;
          const biome = generatePixel(adjustedX, adjustedY);
          newRow.push([adjustedX, adjustedY, biome.color]);
        }
        newRows.push(newRow);
      }
    }

    if (newRows.length > 0) {
      setCurrentRows(prev => direction === 'top' ? 
        [...newRows, ...prev] : 
        [...prev, ...newRows]
      );
    }

    // Always update viewport by moveAmount
    setViewportOffset(prev => ({
      ...prev,
      y: prev.y + (direction === 'top' ? -moveAmount : moveAmount)
    }));
  }, [cols, currentCols.length, currentRows, generatePixel, rows, viewportOffset]);

  const addColumn = useCallback((direction: 'left' | 'right') => {
    const moveAmount = 3; // Number of columns to add at once
    const newCols: Array<Array<[number, number, string]>> = [];
    
    for (let step = 0; step < moveAmount; step++) {
      const x = direction === 'left' ? -(step + 1) : cols + step;
      const adjustedX = x + viewportOffset.x;
      
      // Check if this column already exists
      const colExists = currentCols.some(col => 
        col.some(([colX]) => colX === adjustedX)
      );
      
      if (!colExists) {
        const newCol: Array<[number, number, string]> = [];
        for (let y = -currentRows.length; y < rows + currentRows.length; y++) {
          const adjustedY = y + viewportOffset.y;
          const biome = generatePixel(adjustedX, adjustedY);
          newCol.push([adjustedX, adjustedY, biome.color]);
        }
        newCols.push(newCol);
      }
    }

    if (newCols.length > 0) {
      setCurrentCols(prev => direction === 'left' ? 
        [...newCols, ...prev] : 
        [...prev, ...newCols]
      );
    }

    // Always update viewport by moveAmount
    setViewportOffset(prev => ({
      ...prev,
      x: prev.x + (direction === 'left' ? -moveAmount : moveAmount)
    }));
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

  const generateNoisePreview = (type: 'height' | 'moisture' | 'temperature', size: number) => {
    const noise = new PerlinNoise(config[`${type}NoiseConfig`].seed);
    let svgContent = '';
    const previewPixelSize = 2;
    const cols = Math.floor(size / previewPixelSize);
    const rows = Math.floor(size / previewPixelSize);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const noiseValue = (generateOctaveNoise(
          noise,
          x + viewportOffset.x,
          y + viewportOffset.y,
          config[`${type}NoiseConfig`]
        ) + 1) / 2;
        
        const colorValue = Math.floor(noiseValue * 255);
        const color = `rgb(${colorValue},${colorValue},${colorValue})`;
        
        svgContent += `<rect 
          x="${x * previewPixelSize}" 
          y="${y * previewPixelSize}" 
          width="${previewPixelSize}" 
          height="${previewPixelSize}" 
          fill="${color}"
        />`;
      }
    }

    return svgContent;
  };

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
        const { color } = getBiome(height, moisture, temperature);
        
        svgContent += `<rect 
          x="${x * pixelSize}" 
          y="${y * pixelSize}" 
          width="${pixelSize}" 
          height="${pixelSize}" 
          fill="${color}"
          data-biome="${biome.name}"
          data-height="${height.toFixed(2)}"
          data-moisture="${moisture.toFixed(2)}"
          data-temperature="${temperature.toFixed(2)}"
          class="biome-tile"
        />`;
      }
    }

    // Add extra rows and columns relative to viewport
    currentRows.forEach(row => {
      row.forEach(([x, y, color]) => {
        const relativeX = (x - viewportOffset.x) * pixelSize;
        const relativeY = (y - viewportOffset.y) * pixelSize;
        const height = (generateOctaveNoise(heightNoise, x, y, config.heightNoiseConfig) + 1) / 2;
        const moisture = (generateOctaveNoise(moistureNoise, x, y, config.moistureNoiseConfig) + 1) / 2;
        const temperature = (generateOctaveNoise(temperatureNoise, x, y, config.temperatureNoiseConfig) + 1) / 2;
        const biome = getBiome(height, moisture, temperature);
        svgContent += `<rect 
          x="${relativeX}" 
          y="${relativeY}" 
          width="${pixelSize}" 
          height="${pixelSize}" 
          fill="${color}"
          data-biome="${biome.name}"
          data-height="${height.toFixed(2)}"
          data-moisture="${moisture.toFixed(2)}"
          data-temperature="${temperature.toFixed(2)}"
          class="biome-tile"
        />`;
      });
    });

    currentCols.forEach(col => {
      col.forEach(([x, y, color]) => {
        const relativeX = (x - viewportOffset.x) * pixelSize;
        const relativeY = (y - viewportOffset.y) * pixelSize;
        const height = (generateOctaveNoise(heightNoise, x, y, config.heightNoiseConfig) + 1) / 2;
        const moisture = (generateOctaveNoise(moistureNoise, x, y, config.moistureNoiseConfig) + 1) / 2;
        const temperature = (generateOctaveNoise(temperatureNoise, x, y, config.temperatureNoiseConfig) + 1) / 2;
        const biome = getBiome(height, moisture, temperature);
        svgContent += `<rect 
          x="${relativeX}" 
          y="${relativeY}" 
          width="${pixelSize}" 
          height="${pixelSize}" 
          fill="${color}"
          data-biome="${biome.name}"
          data-height="${height.toFixed(2)}"
          data-moisture="${moisture.toFixed(2)}"
          data-temperature="${temperature.toFixed(2)}"
          class="biome-tile"
        />`;
      });
    });

    svgRef.current.innerHTML = svgContent;

    // Add event listeners for hover effects
    const tiles = svgRef.current.getElementsByClassName('biome-tile');
    Array.from(tiles).forEach(tile => {
      tile.addEventListener('mouseenter', (e) => {
        const rect = (e.target as SVGRectElement).getBoundingClientRect();
        const element = e.target as SVGRectElement;
        const biomeName = element.getAttribute('data-biome');
        const height = element.getAttribute('data-height');
        const moisture = element.getAttribute('data-moisture');
        const temperature = element.getAttribute('data-temperature');
        
        setTooltip({
          show: true,
          text: `${biomeName}\nHeight: ${height}\nMoisture: ${moisture}\nTemp: ${temperature}`,
          x: rect.left + rect.width / 2,
          y: rect.top - 10
        });
      });
      tile.addEventListener('mouseleave', () => {
        setTooltip(prev => ({ ...prev, show: false }));
      });
    });

    // Generate preview maps
    const previewSize = 200;
    ['height', 'moisture', 'temperature'].forEach((type) => {
      const previewSvg = document.getElementById(`${type}-preview`);
      if (previewSvg) {
        previewSvg.innerHTML = generateNoisePreview(type as 'height' | 'moisture' | 'temperature', previewSize);
      }
    });
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
    setViewportOffset({ x: 1000, y: 1000 });
  }, [config]);

  const generateHeightMap = useCallback(() => {
    const heightMap: number[][] = [];
    const heightNoise = new PerlinNoise(config.heightNoiseConfig.seed);
    
    for (let y = 0; y < rows; y++) {
      heightMap[y] = [];
      for (let x = 0; x < cols; x++) {
        const height = (generateOctaveNoise(
          heightNoise,
          x + viewportOffset.x,
          y + viewportOffset.y,
          config.heightNoiseConfig
        ) + 1) / 2;
        heightMap[y][x] = height;
      }
    }
    return heightMap;
  }, [cols, rows, config.heightNoiseConfig, viewportOffset]);

  const generateBiomeColors = useCallback(() => {
    const colors: string[][] = [];
    const heightNoise = new PerlinNoise(config.heightNoiseConfig.seed);
    const moistureNoise = new PerlinNoise(config.moistureNoiseConfig.seed);
    const temperatureNoise = new PerlinNoise(config.temperatureNoiseConfig.seed);
    
    for (let y = 0; y < rows; y++) {
      colors[y] = [];
      for (let x = 0; x < cols; x++) {
        const height = (generateOctaveNoise(heightNoise, x + viewportOffset.x, y + viewportOffset.y, config.heightNoiseConfig) + 1) / 2;
        const moisture = (generateOctaveNoise(moistureNoise, x + viewportOffset.x, y + viewportOffset.y, config.moistureNoiseConfig) + 1) / 2;
        const temperature = (generateOctaveNoise(temperatureNoise, x + viewportOffset.x, y + viewportOffset.y, config.temperatureNoiseConfig) + 1) / 2;
        
        const biome = getBiome(height, moisture, temperature);
        colors[y][x] = biome.color;
      }
    }
    return colors;
  }, [cols, rows, config, viewportOffset]);

  const heightMap = useMemo(() => generateHeightMap(), [generateHeightMap]);
  const biomeColors = useMemo(() => generateBiomeColors(), [generateBiomeColors]);

  return (
    <div className="world-generator">
      <div className="preview-section">
        <button 
          className="preview-toggle"
          onClick={() => setPreviewsVisible(!previewsVisible)}
        >
          {previewsVisible ? '▼ Hide' : '▶ Show'} Noise Maps
        </button>
        <div className={`preview-maps ${previewsVisible ? 'visible' : ''}`}>
          <div className="preview-container">
            <h3>Height Map</h3>
            <svg
              id="height-preview"
              width="200"
              height="200"
              style={{ border: '1px solid #ccc' }}
            />
          </div>
          <div className="preview-container">
            <h3>Moisture Map</h3>
            <svg
              id="moisture-preview"
              width="200"
              height="200"
              style={{ border: '1px solid #ccc' }}
            />
          </div>
          <div className="preview-container">
            <h3>Temperature Map</h3>
            <svg
              id="temperature-preview"
              width="200"
              height="200"
              style={{ border: '1px solid #ccc' }}
            />
          </div>
        </div>
      </div>
      <div className="controls">
        <div className="seed-info">
          <p>Base Seed: {baseSeed}</p>
          <p>Coords: ({viewportOffset.x}, {viewportOffset.y})</p>
        </div>
        <div className="world-controls">
          <button onClick={regenerateWorld}>New Seed</button>
        </div>
        <div className="map-container">
          <button className="nav-button top" onClick={() => addRow('top')}>↑</button>
          <div className="horizontal-container">
            <button className="nav-button left" onClick={() => addColumn('left')}>←</button>
            <div className="svg-container">
              <svg
                ref={svgRef}
                width={config.width}
                height={config.height}
                style={{ border: '1px solid #ccc' }}
              />
              {tooltip.show && (
                <div className="tooltip" style={{
                  position: 'fixed',
                  left: `${tooltip.x}px`,
                  top: `${tooltip.y}px`,
                  transform: 'translate(-50%, -100%)',
                  whiteSpace: 'pre-line'
                }}>
                  {tooltip.text}
                </div>
              )}
            </div>
            <button className="nav-button right" onClick={() => addColumn('right')}>→</button>
          </div>
          <button className="nav-button bottom" onClick={() => addRow('bottom')}>↓</button>
        </div>
      </div>
      <button
        onClick={() => setShow3D(!show3D)}
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          padding: '8px 16px',
          backgroundColor: show3D ? '#ff4444' : '#4444ff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          zIndex: 1000,
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}
      >
        {show3D ? 'Show 2D' : 'Show 3D'}
      </button>
      
      <World3DView 
        heightMap={heightMap}
        biomeColors={biomeColors}
        isVisible={show3D} 
      />
      
      {!show3D && (
        <canvas
          // ... your existing canvas props
        />
      )}
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
        .map-container {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .horizontal-container {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .nav-button {
          padding: 12px 20px;
          font-size: 20px;
          background: white;
          border: 1px solid #ccc;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .nav-button:hover {
          background: #f0f0f0;
        }
        .svg-container {
          border: 1px solid #ccc;
          border-radius: 8px;
        }
        .tooltip {
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          pointer-events: none;
          z-index: 1000;
          text-align: left;
        }
        .preview-section {
          width: 100%;
          max-width: 800px;
          margin-bottom: 1rem;
        }
        .preview-toggle {
          width: 100%;
          padding: 8px;
          background: #f0f0f0;
          border: 1px solid #ccc;
          border-radius: 4px;
          cursor: pointer;
          text-align: left;
          font-size: 14px;
          transition: background-color 0.2s;
        }
        .preview-toggle:hover {
          background: #e0e0e0;
        }
        .preview-maps {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease-out, padding 0.3s ease-out;
          padding: 0 1rem;
          background: white;
          border: 1px solid #ccc;
          border-top: none;
          border-radius: 0 0 4px 4px;
          display: flex;
          gap: 1rem;
          justify-content: center;
        }
        .preview-maps.visible {
          max-height: 300px;
          padding: 1rem;
        }
        .preview-container {
          opacity: 0;
          transform: translateY(-10px);
          transition: opacity 0.3s ease-out, transform 0.3s ease-out;
        }
        .preview-maps.visible .preview-container {
          opacity: 1;
          transform: translateY(0);
        }
        .preview-container:nth-child(1) { transition-delay: 0.1s; }
        .preview-container:nth-child(2) { transition-delay: 0.2s; }
        .preview-container:nth-child(3) { transition-delay: 0.3s; }
      `}</style>
    </div>
  );
}; 