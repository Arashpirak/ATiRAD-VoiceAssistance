"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Html, Stars } from "@react-three/drei"
import { Suspense, useState, useEffect, useRef } from "react"
import { ArrowLeft, ExternalLink, Sparkles, Zap, Rocket } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Vector3 } from "three"
import type * as THREE from "three"

interface IconData {
  id: string
  name: string
  website: string
  position: [number, number, number]
  color: string
  Icon: string
  type: "customer" | "portal" | "treasure"
  level: number
  discovered: boolean
}

const initialCustomers: IconData[] = [
  {
    id: "tech-1",
    name: "TechCorp",
    website: "https://techcorp.example.com",
    position: [2, 1, -5],
    color: "#01ADEF",
    Icon: "TC",
    type: "customer",
    level: 0,
    discovered: true,
  },
  {
    id: "health-1",
    name: "HealthPlus",
    website: "https://healthplus.example.com",
    position: [-3, 2, -8],
    color: "#ffffff",
    Icon: "H+",
    type: "customer",
    level: 0,
    discovered: true,
  },
  {
    id: "portal-1",
    name: "Tech Portal",
    website: "#",
    position: [4, -1, -12],
    color: "#ff6b6b",
    Icon: "⚡",
    type: "portal",
    level: 0,
    discovered: true,
  },
  {
    id: "shop-1",
    name: "ShopMart",
    website: "https://shopmart.example.com",
    position: [-2, -2, -6],
    color: "#ffffff",
    Icon: "SM",
    type: "customer",
    level: 0,
    discovered: true,
  },
  {
    id: "treasure-1",
    name: "Hidden Gem",
    website: "#",
    position: [1, 3, -15],
    color: "#ffd93d",
    Icon: "💎",
    type: "treasure",
    level: 0,
    discovered: true,
  },
]

const generateRandomPosition = (centerPos: [number, number, number], radius: number): [number, number, number] => {
  const [x, y, z] = centerPos
  const angle = Math.random() * Math.PI * 2
  const distance = Math.random() * radius + 5
  return [x + Math.cos(angle) * distance, y + (Math.random() - 0.5) * 10, z + Math.sin(angle) * distance - 10]
}

const generateNewContent = (level: number, centerPos: [number, number, number]): IconData[] => {
  const companies = ["DataFlow", "CloudSync", "AICore", "NetSecure", "DevTools", "AppForge", "CodeBase", "TechFlow"]
  const colors = ["#01ADEF", "#ffffff", "#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57", "#ff9ff3"]

  const newItems: IconData[] = []
  const itemCount = Math.floor(Math.random() * 6) + 4 // 4-9 items per level

  for (let i = 0; i < itemCount; i++) {
    const itemType = Math.random() < 0.7 ? "customer" : Math.random() < 0.8 ? "portal" : "treasure"
    const company = companies[Math.floor(Math.random() * companies.length)]

    newItems.push({
      id: `${itemType}-${level}-${i}-${Date.now()}`,
      name: itemType === "portal" ? `${company} Portal` : itemType === "treasure" ? `${company} Treasure` : company,
      website: itemType === "customer" ? `https://${company.toLowerCase()}.example.com` : "#",
      position: generateRandomPosition(centerPos, 15 + level * 5),
      color: colors[Math.floor(Math.random() * colors.length)],
      Icon: itemType === "portal" ? "⚡" : itemType === "treasure" ? "💎" : company.substring(0, 2).toUpperCase(),
      type: itemType,
      level: level + 1,
      discovered: false,
    })
  }

  return newItems
}

function FloatingIcon({
  Icon,
  position,
  color,
  name,
  website,
  type,
  discovered,
  onPortalClick,
}: IconData & { onPortalClick: (pos: [number, number, number]) => void }) {
  const [hovered, setHovered] = useState(false)
  const [visible, setVisible] = useState(discovered)

  useEffect(() => {
    if (!discovered) {
      const timer = setTimeout(() => setVisible(true), Math.random() * 2000)
      return () => clearTimeout(timer)
    }
  }, [discovered])

  const handleClick = () => {
    if (type === "portal") {
      onPortalClick(position)
    } else if (type === "customer" && website !== "#") {
      window.open(website, "_blank")
    }
  }

  if (!visible) return null

  const getIconStyle = () => {
    switch (type) {
      case "portal":
        return {
          backgroundColor: "rgba(255, 107, 107, 0.3)",
          boxShadow: `0 0 40px ${color}80`,
          border: "2px solid rgba(255, 107, 107, 0.6)",
        }
      case "treasure":
        return {
          backgroundColor: "rgba(255, 217, 61, 0.3)",
          boxShadow: `0 0 50px ${color}90`,
          border: "2px solid rgba(255, 217, 61, 0.8)",
        }
      default:
        return {
          backgroundColor: color === "#ffffff" ? "rgba(255,255,255,0.1)" : "rgba(1,173,239,0.2)",
          boxShadow: `0 0 30px ${color}40`,
          border: "2px solid rgba(255,255,255,0.3)",
        }
    }
  }

  return (
    <Html position={position} center>
      <div
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`flex flex-col items-center cursor-pointer group transition-all duration-500 ${
          visible ? "opacity-100 scale-100" : "opacity-0 scale-50"
        }`}
      >
        <div
          className={`flex items-center justify-center w-20 h-20 rounded-full backdrop-blur-sm transition-all duration-300 ${
            hovered ? "scale-125" : "scale-100"
          } ${type === "portal" ? "animate-pulse" : ""}`}
          style={getIconStyle()}
        >
          <span className="text-2xl font-bold" style={{ color }}>
            {Icon}
          </span>
          {type === "portal" && <Zap className="absolute top-1 right-1 w-4 h-4 text-yellow-400" />}
          {type === "treasure" && <Sparkles className="absolute top-1 right-1 w-4 h-4 text-yellow-400" />}
        </div>
        <div className="mt-2 text-center">
          <p className="text-white text-sm font-medium">{name}</p>
          <div className="flex items-center gap-1 text-xs text-white/60 group-hover:text-white/80 transition-colors">
            {type === "customer" ? (
              <>
                <ExternalLink size={12} />
                <span>Visit Site</span>
              </>
            ) : type === "portal" ? (
              <span className="text-red-300">Click to explore deeper</span>
            ) : (
              <span className="text-yellow-300">Special discovery</span>
            )}
          </div>
        </div>
      </div>
    </Html>
  )
}

const spaceLocations = [
  {
    name: "Tech Nebula",
    position: [50, 20, -80],
    theme: "technology",
    companies: ["TechFlow", "DataCore", "CloudSync", "AIVision", "CodeForge", "NetSecure"],
    colors: ["#01ADEF", "#4ecdc4", "#45b7d1", "#96ceb4"],
  },
  {
    name: "Commerce Galaxy",
    position: [-60, -30, -100],
    theme: "commerce",
    companies: ["ShopMax", "TradeHub", "MarketPlace", "SellPro", "BuyNow", "Commerce+"],
    colors: ["#feca57", "#ff9ff3", "#ff6b6b", "#54a0ff"],
  },
  {
    name: "Health Sector",
    position: [30, -50, -120],
    theme: "health",
    companies: ["HealthTech", "MedCore", "WellnessHub", "CareSync", "HealthPlus", "MedFlow"],
    colors: ["#5f27cd", "#00d2d3", "#ff9ff3", "#54a0ff"],
  },
  {
    name: "Innovation Cluster",
    position: [-40, 60, -150],
    theme: "innovation",
    companies: ["InnovateLab", "FutureTech", "NextGen", "Quantum", "Synergy", "Evolve"],
    colors: ["#ff6b6b", "#feca57", "#48dbfb", "#0abde3"],
  },
]

const generateLocationContent = (location: (typeof spaceLocations)[0], level: number): IconData[] => {
  const newItems: IconData[] = []
  const itemCount = Math.floor(Math.random() * 8) + 6 // 6-13 items per location

  for (let i = 0; i < itemCount; i++) {
    const itemType = Math.random() < 0.6 ? "customer" : Math.random() < 0.8 ? "portal" : "treasure"
    const company = location.companies[Math.floor(Math.random() * location.companies.length)]
    const basePos = location.position

    // Spread items around the location center
    const angle = (i / itemCount) * Math.PI * 2
    const radius = Math.random() * 25 + 10
    const height = (Math.random() - 0.5) * 20

    newItems.push({
      id: `${location.theme}-${itemType}-${level}-${i}-${Date.now()}`,
      name: itemType === "portal" ? `${company} Portal` : itemType === "treasure" ? `${company} Treasure` : company,
      website: itemType === "customer" ? `https://${company.toLowerCase()}.example.com` : "#",
      position: [basePos[0] + Math.cos(angle) * radius, basePos[1] + height, basePos[2] + Math.sin(angle) * radius],
      color: location.colors[Math.floor(Math.random() * location.colors.length)],
      Icon: itemType === "portal" ? "⚡" : itemType === "treasure" ? "💎" : company.substring(0, 2).toUpperCase(),
      type: itemType,
      level: level + 1,
      discovered: false,
    })
  }

  return newItems
}

function AnimatedStars({ isTravel, travelSpeed }: { isTravel: boolean; travelSpeed: number }) {
  const starsRef = useRef<THREE.Points>(null)

  useFrame(() => {
    if (starsRef.current && isTravel) {
      starsRef.current.position.z += travelSpeed
      if (starsRef.current.position.z > 50) {
        starsRef.current.position.z = -50
      }
    }
  })

  return (
    <Stars
      ref={starsRef}
      radius={100}
      depth={50}
      count={isTravel ? 8000 : 5000}
      factor={isTravel ? 8 : 4}
      saturation={0}
      fade
      speed={isTravel ? travelSpeed * 2 : 1}
    />
  )
}

function Scene() {
  const [allIcons, setAllIcons] = useState<IconData[]>(initialCustomers)
  const [explorationLevel, setExplorationLevel] = useState(0)
  const [isSpaceTravel, setIsSpaceTravel] = useState(false)
  const [currentLocationIndex, setCurrentLocationIndex] = useState(-1) // -1 means starting location
  const controlsRef = useRef<any>()
  const { camera } = useThree()

  const initiateSpaceTravel = () => {
    if (isSpaceTravel) return // Prevent multiple travels at once

    setIsSpaceTravel(true)
    const nextLocationIndex = (currentLocationIndex + 1) % spaceLocations.length
    const targetLocation = spaceLocations[nextLocationIndex]

    // Disable controls during travel
    if (controlsRef.current) {
      controlsRef.current.enabled = false
    }

    // Animate camera to new location
    const startPos = camera.position.clone()
    const endPos = new Vector3(...targetLocation.position)
    const duration = 3000 // 3 seconds travel time
    const startTime = Date.now()

    const animateTravel = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Smooth easing function
      const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1)
      const easedProgress = easeInOutCubic(progress)

      // Interpolate camera position
      camera.position.lerpVectors(startPos, endPos, easedProgress)

      if (progress < 1) {
        requestAnimationFrame(animateTravel)
      } else {
        // Travel complete
        setIsSpaceTravel(false)
        setCurrentLocationIndex(nextLocationIndex)

        // Generate new content at this location
        const newContent = generateLocationContent(targetLocation, explorationLevel)
        setAllIcons((prev) => [...prev, ...newContent])
        setExplorationLevel((prev) => prev + 1)

        // Re-enable controls
        if (controlsRef.current) {
          controlsRef.current.enabled = true
          controlsRef.current.target.copy(endPos)
        }
      }
    }

    animateTravel()
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (controlsRef.current && !isSpaceTravel) {
        const currentPos = controlsRef.current.object.position
        const distance = Math.sqrt(currentPos.x ** 2 + currentPos.y ** 2 + currentPos.z ** 2)

        // Generate new content when user explores far enough
        if (distance > 20 + explorationLevel * 15) {
          const newContent = generateNewContent(explorationLevel, [currentPos.x, currentPos.y, currentPos.z])
          setAllIcons((prev) => [...prev, ...newContent])
          setExplorationLevel((prev) => prev + 1)
        }
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [explorationLevel, isSpaceTravel])

  const handlePortalClick = (portalPosition: [number, number, number]) => {
    if (isSpaceTravel) return // Prevent clicks during travel
    const deeperContent = generateNewContent(explorationLevel + 1, portalPosition)
    setAllIcons((prev) => [...prev, ...deeperContent])
    setExplorationLevel((prev) => prev + 1)
  }

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.6} />

      <AnimatedStars isTravel={isSpaceTravel} travelSpeed={isSpaceTravel ? 5 : 0} />

      {allIcons.map((item) => (
        <FloatingIcon key={item.id} {...item} onPortalClick={handlePortalClick} />
      ))}

      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={100}
        autoRotate={!isSpaceTravel}
        autoRotateSpeed={0.2}
      />

      <Html position={[0, -8, -5]} center>
        <div className="flex flex-col items-center">
          <Button
            onClick={initiateSpaceTravel}
            disabled={isSpaceTravel}
            className={`bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-full text-lg font-bold shadow-2xl transition-all duration-300 ${
              isSpaceTravel ? "animate-pulse scale-110" : "hover:scale-105"
            }`}
          >
            <Rocket className={`mr-3 ${isSpaceTravel ? "animate-spin" : ""}`} size={24} />
            {isSpaceTravel ? "Traveling Through Space..." : "Explore More"}
          </Button>

          {currentLocationIndex >= 0 && (
            <div className="mt-4 text-center">
              <p className="text-white text-sm bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
                Current Location:{" "}
                <span className="font-bold text-blue-300">{spaceLocations[currentLocationIndex].name}</span>
              </p>
            </div>
          )}
        </div>
      </Html>
    </>
  )
}

export default function CustomersShowcase() {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-[#08075C] via-[#01ADEF] to-[#08075C] overflow-hidden">
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
        </Suspense>
      </Canvas>

      {/* Header */}
      <div className="absolute top-4 left-4 z-10">
        <Link href="/">
          <Button
            variant="outline"
            size="sm"
            className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm mb-4"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Assistant
          </Button>
        </Link>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white border border-white/20">
          <h1 className="text-2xl font-bold mb-2">Infinite Customer Universe</h1>
          <p className="text-sm opacity-80">Explore deeper to discover more customers and hidden treasures</p>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-white text-sm border border-white/20">
          <p>🔍 Explore to discover • ⚡ Click portals for deeper levels • 💎 Find hidden treasures</p>
        </div>
      </div>
    </div>
  )
}
