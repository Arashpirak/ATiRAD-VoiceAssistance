"use client"

import { useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import * as THREE from "three"

interface ExplorationNodeProps {
  position: [number, number, number]
  type: "icon" | "portal" | "treasure"
  level: number
  onClick: () => void
}

export function ExplorationNode({ position, type, level, onClick }: ExplorationNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)

  // Animate the node
  useFrame((state) => {
    if (meshRef.current) {
      // Floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.2

      // Rotation based on type
      if (type === "portal") {
        meshRef.current.rotation.y = state.clock.elapsedTime * 0.5
        meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
      } else {
        meshRef.current.rotation.y = state.clock.elapsedTime * 0.2
      }

      // Scale based on hover and level
      const baseScale = 0.5 + level * 0.1
      const targetScale = hovered ? baseScale * 1.3 : baseScale
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
    }
  })

  const getNodeColor = () => {
    switch (type) {
      case "portal":
        return "#ff6b6b" // Red for portals
      case "treasure":
        return "#ffd93d" // Gold for treasures
      default:
        return "#74c0fc" // Blue for regular icons
    }
  }

  const getNodeGeometry = () => {
    switch (type) {
      case "portal":
        return <octahedronGeometry args={[1, 0]} />
      case "treasure":
        return <dodecahedronGeometry args={[1, 0]} />
      default:
        return <icosahedronGeometry args={[1, 0]} />
    }
  }

  const getNodeIcon = () => {
    switch (type) {
      case "portal":
        return "🌀"
      case "treasure":
        return "💎"
      default:
        return "⭐"
    }
  }

  const handleClick = () => {
    setClicked(true)
    onClick()
    setTimeout(() => setClicked(false), 200)
  }

  return (
    <group position={position}>
      {/* Main node mesh */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {getNodeGeometry()}
        <meshStandardMaterial
          color={getNodeColor()}
          emissive={getNodeColor()}
          emissiveIntensity={hovered ? 0.3 : 0.1}
          transparent
          opacity={clicked ? 0.7 : 0.9}
        />
      </mesh>

      {/* Glow effect */}
      <mesh position={[0, 0, 0]} scale={hovered ? 1.5 : 1.2}>
        {getNodeGeometry()}
        <meshBasicMaterial color={getNodeColor()} transparent opacity={0.1} />
      </mesh>

      {/* Node label */}
      {hovered && (
        <Html position={[0, 2, 0]} center>
          <div className="bg-background/90 backdrop-blur-sm rounded-lg p-2 text-center pointer-events-none">
            <div className="text-2xl mb-1">{getNodeIcon()}</div>
            <div className="text-sm font-medium text-foreground capitalize">{type}</div>
            <div className="text-xs text-muted-foreground">Level {level}</div>
            {type === "portal" && <div className="text-xs text-blue-400 mt-1">Click to explore deeper</div>}
          </div>
        </Html>
      )}

      {/* Particle trail for special nodes */}
      {(type === "portal" || type === "treasure") && (
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={20}
              array={new Float32Array(Array.from({ length: 60 }, () => (Math.random() - 0.5) * 4))}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial size={0.05} color={getNodeColor()} transparent opacity={0.6} />
        </points>
      )}
    </group>
  )
}
