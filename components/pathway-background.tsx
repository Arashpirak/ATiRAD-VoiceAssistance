"use client"

import { useEffect, useState } from "react"

interface PathwaySection {
  id: number
  title: string
  description: string
  position: { x: number; y: number; scale: number; depth: number }
}

const pathwaySections: PathwaySection[] = [
  {
    id: 1,
    title: "Welcome & Introduction",
    description: "Meet Arash - Your AI Voice Assistant",
    position: { x: -45, y: 15, scale: 1.0, depth: 0 },
  },
  {
    id: 2,
    title: "How We Help",
    description: "24/7 Voice-Powered Customer Support",
    position: { x: 35, y: 5, scale: 0.7, depth: 1 },
  },
  {
    id: 3,
    title: "How to Use",
    description: "Simple Integration in 3 Steps",
    position: { x: -25, y: -5, scale: 0.5, depth: 2 },
  },
  {
    id: 4,
    title: "Features",
    description: "Advanced AI Conversation Capabilities",
    position: { x: 20, y: -12, scale: 0.35, depth: 3 },
  },
  {
    id: 5,
    title: "Pricing Plans",
    description: "Flexible Solutions for Every Business",
    position: { x: -12, y: -18, scale: 0.25, depth: 4 },
  },
  {
    id: 6,
    title: "Get Started",
    description: "WordPress Plugin & Custom Integration",
    position: { x: 8, y: -22, scale: 0.18, depth: 5 },
  },
]

export default function PathwayBackground() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Create scrollable area */}
      <div className="absolute inset-0 h-[400vh]" />

      {/* Pathway Lines - Exact perspective from image */}
      <svg className="absolute inset-0 w-full h-full" style={{ transform: `translateY(${scrollY * 0.3}px)` }}>
        {/* Left diagonal line */}
        <line
          x1="5%"
          y1="20%"
          x2="48%"
          y2="85%"
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth="2"
          className="drop-shadow-lg"
        />
        {/* Right diagonal line */}
        <line
          x1="95%"
          y1="20%"
          x2="52%"
          y2="85%"
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth="2"
          className="drop-shadow-lg"
        />
        {/* Horizon line */}
        <line x1="48%" y1="85%" x2="52%" y2="85%" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />
      </svg>

      {/* Pathway Windows */}
      {pathwaySections.map((section, index) => {
        const parallaxOffset = scrollY * (0.05 + index * 0.02)
        const scaleEffect = section.position.scale * (1 + scrollY * 0.0002)
        const opacityEffect = Math.max(0.2, 1 - scrollY * 0.0008 - section.position.depth * 0.1)

        return (
          <div
            key={section.id}
            className="absolute transition-all duration-500 ease-out"
            style={{
              left: `${50 + section.position.x}%`,
              top: `${40 + section.position.y + parallaxOffset}%`,
              transform: `translate(-50%, -50%) scale(${Math.max(0.05, scaleEffect)})`,
              opacity: opacityEffect,
              zIndex: 10 - section.position.depth,
            }}
          >
            {/* Window Frame */}
            <div className="relative">
              {/* Title above window */}
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                <div className="bg-white/90 text-[#08075C] px-4 py-2 rounded-full text-sm font-bold shadow-lg border border-[#01ADEF]/30">
                  {section.id}. {section.title}
                </div>
              </div>

              {/* Window */}
              <div
                className="border-3 border-white/60 bg-white/10 backdrop-blur-sm rounded-lg p-8 min-w-[250px] min-h-[180px] flex flex-col justify-center items-center shadow-2xl hover:bg-white/20 transition-all duration-300 cursor-pointer"
                style={{
                  boxShadow: `0 0 40px rgba(1, 173, 239, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.1)`,
                  borderColor: index % 2 === 0 ? "#01ADEF" : "#ffffff",
                }}
              >
                <div className="text-center">
                  <h3 className="text-white font-bold text-xl mb-3">{section.title}</h3>
                  <p className="text-white/90 text-sm leading-relaxed">{section.description}</p>
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {/* Depth fog effect */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#08075C]/70"
        style={{ transform: `translateY(${scrollY * 0.2}px)` }}
      />

      {/* Floor grid effect */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 opacity-20"
        style={{
          background: `linear-gradient(90deg, transparent 49%, rgba(255,255,255,0.3) 50%, transparent 51%), 
                      linear-gradient(0deg, transparent 49%, rgba(255,255,255,0.3) 50%, transparent 51%)`,
          backgroundSize: "50px 50px",
          transform: `perspective(500px) rotateX(60deg) translateY(${scrollY * 0.1}px)`,
        }}
      />
    </div>
  )
}
