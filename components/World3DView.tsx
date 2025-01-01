import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface World3DViewProps {
  heightMap: number[][];
  biomeColors: string[][];
  isVisible: boolean;
}

const World3DView = ({ heightMap, biomeColors, isVisible }: World3DViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Height scaling function
  const getScaledHeight = (height: number) => {
    const baseScale = 20;
    const expScale = 100;
    return (height * baseScale) + (Math.pow(height, 3) * expScale);
  };

  useEffect(() => {
    if (!containerRef.current || !isVisible) return;

    // Setup scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Setup camera
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    // Position camera high up and looking down
    camera.position.set(0, 250, 0);
    camera.lookAt(0, 0, 0);

    // Setup renderer
    const renderer = new THREE.WebGLRenderer();
    rendererRef.current = renderer;
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Add controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 50;
    controls.maxDistance = 400;
    controls.maxPolarAngle = Math.PI / 2;
    controls.minPolarAngle = 0;
    controls.target.set(0, 0, 0);

    const size = 200;
    // Create a single stretched terrain with higher resolution
    const geometry = new THREE.PlaneGeometry(
      250,  // width
      250,  // height
      size,  // widthSegments - doubled from 200
      size   // heightSegments - doubled from 200
    );

    // Update the color array size to match new resolution
    const vertices = geometry.attributes.position.array as Float32Array;
    const colors = new Float32Array((size + 1) * (size + 1) * 3); // (widthSegments + 1) * (heightSegments + 1) * 3

    // Update the grid mapping loop
    for (let i = 0; i <= size; i++) {
      for (let j = 0; j <= size; j++) {
        const index = (i * (size + 1) + j) * 3;
        
        // Map grid position to heightMap position
        const heightMapI = Math.floor((i / size) * (heightMap.length - 1));
        const heightMapJ = Math.floor((j / size) * (heightMap[0].length - 1));
        
        // Use the scaling function
        const height = heightMap[heightMapI][heightMapJ];
        vertices[index + 2] = getScaledHeight(height);
        
        // Set color
        const color = new THREE.Color(biomeColors[heightMapI][heightMapJ]);
        colors[index] = color.r;
        colors[index + 1] = color.g;
        colors[index + 2] = color.b;
      }
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.attributes.position.needsUpdate = true;

    const material = new THREE.MeshPhongMaterial({
      vertexColors: true,
      flatShading: true,
    });

    const terrain = new THREE.Mesh(geometry, material);
    terrain.rotation.x = -Math.PI / 2;
    scene.add(terrain);

    // Create water plane
    const waterGeometry = new THREE.PlaneGeometry(250, 250, 1, 1);
    const waterMaterial = new THREE.MeshPhongMaterial({
      color: '#4444FF',
      transparent: true,
      opacity: 0.7,
      shininess: 200,
      side: THREE.DoubleSide
    });

    const waterPlane = new THREE.Mesh(waterGeometry, waterMaterial);
    waterPlane.rotation.x = -Math.PI / 2;
    const waterLevel = 0.4;
    const scaledWaterHeight = getScaledHeight(waterLevel);
    waterPlane.position.y = scaledWaterHeight;
    waterPlane.position.x = 0;
    waterPlane.position.z = 0;
    scene.add(waterPlane);

    // Update the scene background and lighting setup
    // After creating the scene
    scene.background = new THREE.Color('#87CEEf'); // Sky blue background

    // Update the lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // Increased from 0.5
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5); // Increased from 1.0
    directionalLight.position.set(1, 1, 1); // Adjusted position for better shadows
    scene.add(directionalLight);

    // Optional: Add a hemisphere light for more natural lighting
    const hemisphereLight = new THREE.HemisphereLight(
      0xffffff, // Sky color
      0x8d8d8d, // Ground color
      0.5       // Intensity
    );
    scene.add(hemisphereLight);

    // Animation loop
    const animate = () => {
      if (!isVisible) return;
      
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [heightMap, biomeColors, isVisible]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: isVisible ? 'block' : 'none',
      }}
    />
  );
};

export default World3DView; 