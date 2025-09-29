"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Html, Stars } from "@react-three/drei"
import { Suspense, useState, useEffect, useRef } from "react"
import { ArrowLeft, ExternalLink, Sparkles, Zap, Rocket, Undo2 } from "lucide-react"
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

interface ExplorationLevel {
  id: number
  name: string
  centerPosition: [number, number, number]
  icons: IconData[]
  theme: string
  colors: string[]
}

const initialLevel: ExplorationLevel = {
  id: 0,
  name: "Origin Hub",
  centerPosition: [0, 0, -10],
  theme: "origin",
  colors: ["#01ADEF", "#ffffff", "#ff6b6b", "#4ecdc4"],
  icons: [
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
  ],
}

const generateRandomPosition = (centerPos: [number, number, number], radius: number): [number, number, number] => {
  const [x, y, z] = centerPos
  const angle = Math.random() * Math.PI * 2
  const distance = Math.random() * radius + 8
  return [x + Math.cos(angle) * distance, y + (Math.random() - 0.5) * 8, z + Math.sin(angle) * distance]
}

const generateNewLevel = (levelId: number, previousLevel: ExplorationLevel): ExplorationLevel => {
  const themes = [
    {
      name: "Tech Nebula",
      theme: "technology",
      companies: ["DataFlow", "CloudSync", "AICore", "NetSecure", "DevTools", "AppForge"],
      colors: ["#01ADEF", "#4ecdc4", "#45b7d1", "#96ceb4"],
    },
    {
      name: "Commerce Galaxy",
      theme: "commerce",
      companies: ["ShopMax", "TradeHub", "MarketPlace", "SellPro", "BuyNow", "Commerce+"],
      colors: ["#feca57", "#ff9ff3", "#ff6b6b", "#54a0ff"],
    },
    {
      name: "Health Sector",
      theme: "health",
      companies: ["HealthTech", "MedCore", "WellnessHub", "CareSync", "HealthPlus", "MedFlow"],
      colors: ["#5f27cd", "#00d2d3", "#ff9ff3", "#54a0ff"],
    },
    {
      name: "Innovation Cluster",
      theme: "innovation",
      companies: ["InnovateLab", "FutureTech", "NextGen", "Quantum", "Synergy", "Evolve"],
      colors: ["#ff6b6b", "#feca57", "#48dbfb", "#0abde3"],
    },
    {
      name: "Data Universe",
      theme: "data",
      companies: ["DataCore", "InfoHub", "Analytics+", "BigData", "DataFlow", "InfoTech"],
      colors: ["#a55eea", "#26de81", "#fd79a8", "#fdcb6e"],
    },
    {
      name: "Creative Space",
      theme: "creative",
      companies: ["DesignLab", "CreativeHub", "ArtTech", "MediaFlow", "VisualCore", "Creative+"],
      colors: ["#ff7675", "#74b9ff", "#00b894", "#fdcb6e"],
    },
  ]

  const themeIndex = levelId % themes.length
  const selectedTheme = themes[themeIndex]

  // Position new level away from previous level
  const distance = 80 + levelId * 20
  const angle = levelId * 137.5 * (Math.PI / 180) // Golden angle for good distribution
  const centerPosition: [number, number, number] = [
    previousLevel.centerPosition[0] + Math.cos(angle) * distance,
    previousLevel.centerPosition[1] + (Math.random() - 0.5) * 40,
    previousLevel.centerPosition[2] + Math.sin(angle) * distance - 30,
  ]

  const icons: IconData[] = []
  const itemCount = Math.floor(Math.random() * 8) + 6 // 6-13 items per level

  for (let i = 0; i < itemCount; i++) {
    const itemType = Math.random() < 0.6 ? "customer" : Math.random() < 0.8 ? "portal" : "treasure"
    const company = selectedTheme.companies[Math.floor(Math.random() * selectedTheme.companies.length)]

    icons.push({
      id: `${selectedTheme.theme}-${itemType}-${levelId}-${i}-${Date.now()}`,
      name: itemType === "portal" ? `${company} Portal` : itemType === "treasure" ? `${company} Treasure` : company,
      website: itemType === "customer" ? `https://${company.toLowerCase()}.example.com` : "#",
      position: generateRandomPosition(centerPosition, 25),
      color: selectedTheme.colors[Math.floor(Math.random() * selectedTheme.colors.length)],
      Icon: itemType === "portal" ? "⚡" : itemType === "treasure" ? "💎" : company.substring(0, 2).toUpperCase(),
      type: itemType,
      level: levelId,
      discovered: false,
    })
  }

  return {
    id: levelId,
    name: selectedTheme.name,
    centerPosition,
    icons,
    theme: selectedTheme.theme,
    colors: selectedTheme.colors,
  }
}

function FloatingIcon({
  Icon,
  position,
  color,
  name,
  website,
  type,
  discovered,
  level,
  currentLevel,
  onPortalClick,
}: IconData & {
  currentLevel: number
  onPortalClick: (pos: [number, number, number]) => void
}) {
  const [hovered, setHovered] = useState(false)
  const [visible, setVisible] = useState(discovered)

  useEffect(() => {
    if (!discovered) {
      const timer = setTimeout(() => setVisible(true), Math.random() * 2000)
      return () => clearTimeout(timer)
    }
  }, [discovered])

  const handleClick = () => {
    // Only allow clicks on current level icons
    if (level !== currentLevel) return

    if (type === "portal") {
      onPortalClick(position)
    } else if (type === "customer" && website !== "#") {
      window.open(website, "_blank")
    }
  }

  if (!visible) return null

  const levelDiff = Math.abs(level - currentLevel)
  const isCurrentLevel = level === currentLevel
  const isPreviousLevel = level === currentLevel - 1
  const isUpperLevel = level === currentLevel + 1

  // Scale and opacity based on level
  const scale = isCurrentLevel ? 1 : levelDiff === 1 ? 0.4 : 0.2
  const opacity = isCurrentLevel ? 1 : levelDiff === 1 ? 0.6 : 0.3
  const clickable = isCurrentLevel

  const getIconStyle = () => {
    const baseStyle = {
      transform: `scale(${scale})`,
      opacity: opacity,
      cursor: clickable ? "pointer" : "default",
      pointerEvents: clickable ? "auto" : ("none" as const),
    }

    switch (type) {
      case "portal":
        return {
          ...baseStyle,
          backgroundColor: `rgba(255, 107, 107, ${0.3 * opacity})`,
          boxShadow: `0 0 ${40 * scale}px ${color}${Math.floor(128 * opacity).toString(16)}`,
          border: `2px solid rgba(255, 107, 107, ${0.6 * opacity})`,
        }
      case "treasure":
        return {
          ...baseStyle,
          backgroundColor: `rgba(255, 217, 61, ${0.3 * opacity})`,
          boxShadow: `0 0 ${50 * scale}px ${color}${Math.floor(144 * opacity).toString(16)}`,
          border: `2px solid rgba(255, 217, 61, ${0.8 * opacity})`,
        }
      default:
        return {
          ...baseStyle,
          backgroundColor:
            color === "#ffffff" ? `rgba(255,255,255,${0.1 * opacity})` : `rgba(1,173,239,${0.2 * opacity})`,
          boxShadow: `0 0 ${30 * scale}px ${color}${Math.floor(64 * opacity).toString(16)}`,
          border: `2px solid rgba(255,255,255,${0.3 * opacity})`,
        }
    }
  }

  return (
    <Html position={position} center>
      <div
        onClick={handleClick}
        onMouseEnter={() => clickable && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`flex flex-col items-center transition-all duration-500 ${
          clickable ? "cursor-pointer group" : "cursor-default"
        }`}
      >
        <div
          className={`flex items-center justify-center w-20 h-20 rounded-full backdrop-blur-sm transition-all duration-300 ${
            hovered && clickable ? "scale-125" : "scale-100"
          } ${type === "portal" && isCurrentLevel ? "animate-pulse" : ""}`}
          style={getIconStyle()}
        >
          <span className="text-2xl font-bold" style={{ color: isCurrentLevel ? color : `${color}80` }}>
            {Icon}
          </span>
          {type === "portal" && isCurrentLevel && <Zap className="absolute top-1 right-1 w-4 h-4 text-yellow-400" />}
          {type === "treasure" && isCurrentLevel && (
            <Sparkles className="absolute top-1 right-1 w-4 h-4 text-yellow-400" />
          )}
        </div>
        {isCurrentLevel && (
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
        )}
      </div>
    </Html>
  )
}

const createSpaceshipSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

  // Low frequency spaceship hum
  const oscillator1 = audioContext.createOscillator()
  const oscillator2 = audioContext.createOscillator()
  const gainNode = audioContext.createGain()
  const filter = audioContext.createBiquadFilter()

  oscillator1.type = "sawtooth"
  oscillator1.frequency.setValueAtTime(40, audioContext.currentTime) // Very low frequency

  oscillator2.type = "sine"
  oscillator2.frequency.setValueAtTime(80, audioContext.currentTime)

  filter.type = "lowpass"
  filter.frequency.setValueAtTime(200, audioContext.currentTime)

  gainNode.gain.setValueAtTime(0, audioContext.currentTime)

  oscillator1.connect(filter)
  oscillator2.connect(filter)
  filter.connect(gainNode)
  gainNode.connect(audioContext.destination)

  return { oscillator1, oscillator2, gainNode, audioContext }
}

const createWindSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

  // White noise for wind effect
  const bufferSize = audioContext.sampleRate * 2
  const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate)
  const output = noiseBuffer.getChannelData(0)

  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1
  }

  const whiteNoise = audioContext.createBufferSource()
  whiteNoise.buffer = noiseBuffer
  whiteNoise.loop = true

  const filter = audioContext.createBiquadFilter()
  filter.type = "bandpass"
  filter.frequency.setValueAtTime(300, audioContext.currentTime)

  const gainNode = audioContext.createGain()
  gainNode.gain.setValueAtTime(0, audioContext.currentTime)

  whiteNoise.connect(filter)
  filter.connect(gainNode)
  gainNode.connect(audioContext.destination)

  return { whiteNoise, gainNode, audioContext }
}

function AnimatedStars({
  isTravel,
  travelSpeed,
  currentLevel,
}: { isTravel: boolean; travelSpeed: number; currentLevel: number }) {
  const starsRef = useRef<THREE.Points>(null)
  const [starVariations, setStarVariations] = useState<{
    sizes: number[]
    colors: string[]
  }>({ sizes: [], colors: [] })

  // Generate random star variations based on current level
  useEffect(() => {
    const starCount = isTravel ? 8000 : 5000
    const sizes = []
    const colors = []

    // Different star patterns for different levels
    const levelSeed = currentLevel * 137.5 // Golden angle for variation

    for (let i = 0; i < starCount; i++) {
      // Random sizes - some bigger, some smaller based on level
      const baseSizeVariation = Math.sin(i * 0.1 + levelSeed) * 0.5 + 0.5
      const randomSize = Math.random()

      if (randomSize < 0.1) {
        sizes.push(baseSizeVariation * 3 + 2) // Big stars
      } else if (randomSize < 0.3) {
        sizes.push(baseSizeVariation * 0.5 + 0.2) // Small stars
      } else {
        sizes.push(baseSizeVariation * 1.5 + 0.8) // Normal stars
      }

      // Random colors based on level theme
      const colorRandom = Math.random()
      const levelColorSeed = Math.sin(i * 0.05 + levelSeed * 2) * 0.5 + 0.5

      if (levelColorSeed < 0.15) {
        colors.push("#8B0000") // Dark red
      } else if (levelColorSeed < 0.25) {
        colors.push("#A0522D") // Brown
      } else if (levelColorSeed < 0.35) {
        colors.push("#F5F5DC") // Beige/off-white
      } else {
        colors.push("#FFFFFF") // White
      }
    }

    setStarVariations({ sizes, colors })
  }, [currentLevel, isTravel])

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
  const [explorationLevels, setExplorationLevels] = useState<ExplorationLevel[]>([initialLevel])
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0)
  const [isSpaceTravel, setIsSpaceTravel] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(false)
  const spaceshipSoundRef = useRef<any>(null)
  const windSoundRef = useRef<any>(null)
  const controlsRef = useRef<any>()
  const { camera } = useThree()

  const currentLevel = explorationLevels[currentLevelIndex]

  useEffect(() => {
    const enableAudio = () => {
      if (!audioEnabled) {
        setAudioEnabled(true)
        document.removeEventListener("click", enableAudio)
        document.removeEventListener("keydown", enableAudio)
      }
    }

    document.addEventListener("click", enableAudio)
    document.addEventListener("keydown", enableAudio)

    return () => {
      document.removeEventListener("click", enableAudio)
      document.removeEventListener("keydown", enableAudio)
    }
  }, [audioEnabled])

  const initiateSpaceTravel = () => {
    if (isSpaceTravel) return

    setIsSpaceTravel(true)

    if (audioEnabled) {
      try {
        spaceshipSoundRef.current = createSpaceshipSound()
        windSoundRef.current = createWindSound()

        const { oscillator1, oscillator2, gainNode } = spaceshipSoundRef.current
        const { whiteNoise, gainNode: windGain } = windSoundRef.current

        oscillator1.start()
        oscillator2.start()
        whiteNoise.start()

        // Fade in sounds
        gainNode.gain.linearRampToValueAtTime(0.3, gainNode.context.currentTime + 0.5)
        windGain.gain.linearRampToValueAtTime(0.15, windGain.context.currentTime + 0.3)

        // Modulate frequency during travel for dynamic effect
        oscillator1.frequency.linearRampToValueAtTime(60, gainNode.context.currentTime + 1.5)
        oscillator2.frequency.linearRampToValueAtTime(120, gainNode.context.currentTime + 1.5)
      } catch (error) {
        console.log("[v0] Audio context creation failed:", error)
      }
    }

    // Generate new level if we don't have a next one
    const nextLevelIndex = currentLevelIndex + 1
    if (nextLevelIndex >= explorationLevels.length) {
      const newLevel = generateNewLevel(nextLevelIndex, currentLevel)
      setExplorationLevels((prev) => [...prev, newLevel])
    }

    const targetLevel = explorationLevels[nextLevelIndex] || generateNewLevel(nextLevelIndex, currentLevel)

    // Disable controls during travel
    if (controlsRef.current) {
      controlsRef.current.enabled = false
    }

    // Animate camera to new level
    const startPos = camera.position.clone()
    const endPos = new Vector3(...targetLevel.centerPosition)
    const duration = 3000

    const startTime = Date.now()
    const animateTravel = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1)
      const easedProgress = easeInOutCubic(progress)

      camera.position.lerpVectors(startPos, endPos, easedProgress)

      if (progress < 1) {
        requestAnimationFrame(animateTravel)
      } else {
        if (spaceshipSoundRef.current && windSoundRef.current) {
          try {
            const { gainNode } = spaceshipSoundRef.current
            const { gainNode: windGain } = windSoundRef.current

            gainNode.gain.linearRampToValueAtTime(0, gainNode.context.currentTime + 0.5)
            windGain.gain.linearRampToValueAtTime(0, windGain.context.currentTime + 0.5)

            setTimeout(() => {
              spaceshipSoundRef.current.oscillator1.stop()
              spaceshipSoundRef.current.oscillator2.stop()
              windSoundRef.current.whiteNoise.stop()
            }, 500)
          } catch (error) {
            console.log("[v0] Audio cleanup failed:", error)
          }
        }

        setIsSpaceTravel(false)
        setCurrentLevelIndex(nextLevelIndex)

        // Mark new level icons as discovered
        setExplorationLevels((prev) =>
          prev.map((level, index) =>
            index === nextLevelIndex
              ? { ...level, icons: level.icons.map((icon) => ({ ...icon, discovered: true })) }
              : level,
          ),
        )

        if (controlsRef.current) {
          controlsRef.current.enabled = true
          controlsRef.current.target.copy(endPos)
        }
      }
    }

    animateTravel()
  }

  const returnToPreviousLevel = () => {
    if (isSpaceTravel || currentLevelIndex === 0) return

    setIsSpaceTravel(true)

    if (audioEnabled) {
      try {
        spaceshipSoundRef.current = createSpaceshipSound()
        windSoundRef.current = createWindSound()

        const { oscillator1, oscillator2, gainNode } = spaceshipSoundRef.current
        const { whiteNoise, gainNode: windGain } = windSoundRef.current

        // Higher pitch for return journey
        oscillator1.frequency.setValueAtTime(60, gainNode.context.currentTime)
        oscillator2.frequency.setValueAtTime(120, gainNode.context.currentTime)

        oscillator1.start()
        oscillator2.start()
        whiteNoise.start()

        gainNode.gain.linearRampToValueAtTime(0.25, gainNode.context.currentTime + 0.3)
        windGain.gain.linearRampToValueAtTime(0.1, windGain.context.currentTime + 0.2)
      } catch (error) {
        console.log("[v0] Return audio creation failed:", error)
      }
    }

    const previousLevelIndex = currentLevelIndex - 1
    const targetLevel = explorationLevels[previousLevelIndex]

    if (controlsRef.current) {
      controlsRef.current.enabled = false
    }

    const startPos = camera.position.clone()
    const endPos = new Vector3(...targetLevel.centerPosition)
    const duration = 2500

    const startTime = Date.now()
    const animateReturn = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1)
      const easedProgress = easeInOutCubic(progress)

      camera.position.lerpVectors(startPos, endPos, easedProgress)

      if (progress < 1) {
        requestAnimationFrame(animateReturn)
      } else {
        if (spaceshipSoundRef.current && windSoundRef.current) {
          try {
            const { gainNode } = spaceshipSoundRef.current
            const { gainNode: windGain } = windSoundRef.current

            gainNode.gain.linearRampToValueAtTime(0, gainNode.context.currentTime + 0.3)
            windGain.gain.linearRampToValueAtTime(0, windGain.context.currentTime + 0.3)

            setTimeout(() => {
              spaceshipSoundRef.current.oscillator1.stop()
              spaceshipSoundRef.current.oscillator2.stop()
              windSoundRef.current.whiteNoise.stop()
            }, 300)
          } catch (error) {
            console.log("[v0] Return audio cleanup failed:", error)
          }
        }

        setIsSpaceTravel(false)
        setCurrentLevelIndex(previousLevelIndex)

        if (controlsRef.current) {
          controlsRef.current.enabled = true
          controlsRef.current.target.copy(endPos)
        }
      }
    }

    animateReturn()
  }

  const handlePortalClick = (portalPosition: [number, number, number]) => {
    if (isSpaceTravel) return

    // Generate deeper content within current level
    const newIcons = []
    const itemCount = Math.floor(Math.random() * 6) + 4

    for (let i = 0; i < itemCount; i++) {
      const itemType = Math.random() < 0.7 ? "customer" : Math.random() < 0.8 ? "portal" : "treasure"
      const companies =
        currentLevel.theme === "technology" ? ["DeepTech", "CoreAI", "DataDeep"] : ["DeepCorp", "CoreBiz", "DataFlow"]
      const company = companies[Math.floor(Math.random() * companies.length)]

      newIcons.push({
        id: `deep-${currentLevel.id}-${itemType}-${i}-${Date.now()}`,
        name: itemType === "portal" ? `${company} Portal` : itemType === "treasure" ? `${company} Treasure` : company,
        website: itemType === "customer" ? `https://${company.toLowerCase()}.example.com` : "#",
        position: generateRandomPosition(portalPosition, 15),
        color: currentLevel.colors[Math.floor(Math.random() * currentLevel.colors.length)],
        Icon: itemType === "portal" ? "⚡" : itemType === "treasure" ? "💎" : company.substring(0, 2).toUpperCase(),
        type: itemType,
        level: currentLevel.id,
        discovered: false,
      })
    }

    setExplorationLevels((prev) =>
      prev.map((level, index) =>
        index === currentLevelIndex ? { ...level, icons: [...level.icons, ...newIcons] } : level,
      ),
    )
  }

  // Get all icons from all levels for rendering
  const allIcons = explorationLevels.flatMap((level) => level.icons)

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.6} />

      <AnimatedStars isTravel={isSpaceTravel} travelSpeed={isSpaceTravel ? 5 : 0} currentLevel={currentLevel.id} />

      {allIcons.map((item) => (
        <FloatingIcon key={item.id} {...item} currentLevel={currentLevel.id} onPortalClick={handlePortalClick} />
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

      <Html position={[0, -12, -5]} center>
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-4">
            {/* Return to Previous Level Button */}
            <Button
              onClick={returnToPreviousLevel}
              disabled={isSpaceTravel || currentLevelIndex === 0}
              className={`bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-3 rounded-full font-bold shadow-2xl transition-all duration-300 ${
                currentLevelIndex === 0 ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
              }`}
            >
              <Undo2 className="mr-2" size={20} />
              Return
            </Button>

            {/* Explore More Button */}
            <Button
              onClick={initiateSpaceTravel}
              disabled={isSpaceTravel}
              className={`bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-full text-lg font-bold shadow-2xl transition-all duration-300 ${
                isSpaceTravel ? "animate-pulse scale-110" : "hover:scale-105"
              }`}
            >
              <Rocket className={`mr-3 ${isSpaceTravel ? "animate-spin" : ""}`} size={24} />
              {isSpaceTravel ? "Traveling..." : "Explore More"}
            </Button>
          </div>

          {/* Current Level Info */}
          <div className="text-center">
            <p className="text-white text-sm bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
              Level {currentLevel.id + 1}: <span className="font-bold text-blue-300">{currentLevel.name}</span>
            </p>
            <p className="text-white/60 text-xs mt-1">
              {currentLevelIndex > 0 && "Previous levels visible in distance • "}
              Current level interactive •{currentLevelIndex < explorationLevels.length - 1 && " Future levels await"}
            </p>
            {!audioEnabled && (
              <p className="text-yellow-300 text-xs mt-1 animate-pulse">
                🔊 Click anywhere to enable immersive travel sounds
              </p>
            )}
          </div>
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
