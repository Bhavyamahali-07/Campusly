import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, Sphere, Box, Stars } from '@react-three/drei';
import { Suspense } from 'react';

function GeometricCampus() {
  return (
    <group>
      {/* Central "Core" */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <Box args={[1.5, 1.5, 1.5]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#0ea5e9" opacity={0.8} transparent wireframe />
        </Box>
      </Float>

      {/* Orbiting Elements */}
      <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
        <Sphere args={[0.3, 32, 32]} position={[2, 1, 1]}>
          <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.5} />
        </Sphere>
      </Float>

      <Float speed={1} rotationIntensity={0.8} floatIntensity={1.5}>
        <Sphere args={[0.2, 32, 32]} position={[-2, -1, 0.5]}>
          <meshStandardMaterial color="#818cf8" emissive="#4f46e5" emissiveIntensity={0.5} />
        </Sphere>
      </Float>
    </group>
  );
}

export default function CampusScene() {
  return (
    <div className="w-full h-full absolute inset-0 -z-10 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        <Suspense fallback={null}>
          <GeometricCampus />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            autoRotate 
            autoRotateSpeed={0.5} 
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
