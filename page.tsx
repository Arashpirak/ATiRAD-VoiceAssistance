"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, Html, Stars } from "@react-three/drei"
import { Suspense } from "react"
import {
  Home,
  User,
  Mail,
  Phone,
  Settings,
  Heart,
  Star,
  Camera,
  Music,
  Globe,
  Zap,
  Shield,
  Compass,
  Rocket,
  Palette,
} from "lucide-react"

// Icon data with 3D positions and different distances
const iconData = [
  { Icon: Home, position: [2, 1, -5], color: "#3b82f6" },
  { Icon: User, position: [-3, 2, -8], color: "#ef4444" },
  { Icon: Mail, position: [4, -1, -12], color: "#10b981" },
  { Icon: Phone, position: [-2, -2, -6], color: "#f59e0b" },
  { Icon: Settings, position: [1, 3, -15], color: "#8b5cf6" },
  { Icon: Heart, position: [-4, 0, -10], color: "#ec4899" },
  { Icon: Star, position: [3, 2, -7], color: "#fbbf24" },
  { Icon: Camera, position: [-1, -3, -9], color: "#06b6d4" },
  { Icon: Music, position: [5, 1, -11], color: "#84cc16" },
  { Icon: Globe, position: [-5, 2, -13], color: "#6366f1" },
  { Icon: Zap, position: [2, -1, -16], color: "#f97316" },
  { Icon: Shield, position: [-3, 1, -14], color: "#22c55e" },
  { Icon: Compass, position: [4, 3, -8], color: "#a855f7" },
  { Icon: Rocket, position: [-2, -1, -18], color: "#ef4444" },
  { Icon: Palette, position: [1, -2, -20], color: "#06b6d4" },
]

function FloatingIcon({ Icon, position, color }: { Icon: any; position: [number, number, number]; color: string }) {
  return (
    <Html position={position} center>
      <div
        className="flex items-center justify-center w-16 h-16 rounded-full backdrop-blur-sm border border-white/20 hover:scale-110 transition-transform duration-300 cursor-pointer"
        style={{
          backgroundColor: `${color}20`,
          boxShadow: `0 0 20px ${color}40`,
        }}
      >
        <Icon size={32} color={color} />
      </div>
    </Html>
  )
}

function Scene() {
  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />

      {/* Stars background */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {/* Floating icons */}
      {iconData.map((item, index) => (
        <FloatingIcon key={index} Icon={item.Icon} position={item.position} color={item.color} />
      ))}

      {/* Camera controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={50}
        autoRotate={true}
        autoRotateSpeed={0.5}
      />
    </>
  )
}

export default function InfiniteSpace() {
  return (
    <div className="w-full h-screen bg-black overflow-hidden">
      <Canvas
        camera={{
          position: [0, 0, 0],
          fov: 75,
          near: 0.1,
          far: 1000,
        }}
      >
        <Suspense fallback={null}>
          <Scene />
          <Environment preset="night" />
        </Suspense>
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 text-white">
          <h1 className="text-2xl font-bold mb-2">Infinite Space</h1>
          <p className="text-sm opacity-80">Drag to rotate • Scroll to zoom • Click icons to interact</p>
        </div>
      </div>

      {/* Navigation hint */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
          <div className="flex items-center gap-2">
            <Compass size={16} />
            <span>Navigate the space</span>
          </div>
        </div>
      </div>
    </div>
  )
}
