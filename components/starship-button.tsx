"use client"

interface StarshipButtonProps {
  title: string
  onClick: () => void
  isActive?: boolean
}

export function StarshipButton({ title, onClick, isActive = false }: StarshipButtonProps) {
  // Calculate height based on title length
  const baseHeight = 40
  const heightPerChar = 1.5
  const calculatedHeight = Math.max(baseHeight, baseHeight + (title.length - 10) * heightPerChar)
  const height = Math.min(calculatedHeight, 80) // Max height of 80px

  return (
    <button
      onClick={onClick}
      className={`
        relative group transition-all duration-300 transform hover:scale-105
        ${isActive ? "scale-105" : ""}
      `}
      style={{ width: "120px", height: `${height}px` }}
    >
      {/* Button Base - Starship Style */}
      <div
        className={`
          absolute inset-0 rounded-lg transition-all duration-300
          ${
            isActive
              ? "bg-gradient-to-b from-[#01ADEF] via-[#0194D1] to-[#08075C] shadow-lg shadow-[#01ADEF]/50"
              : "bg-gradient-to-b from-gray-600 via-gray-700 to-gray-800 hover:from-[#01ADEF]/80 hover:via-[#0194D1]/80 hover:to-[#08075C]/80"
          }
        `}
        style={{
          boxShadow: isActive
            ? "0 0 20px rgba(1, 173, 239, 0.6), inset 0 2px 4px rgba(255,255,255,0.2), inset 0 -2px 4px rgba(0,0,0,0.3)"
            : "0 4px 8px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.1), inset 0 -2px 4px rgba(0,0,0,0.2)",
        }}
      />

      {/* Button Border Frame */}
      <div
        className={`
          absolute inset-0 rounded-lg border-2 transition-all duration-300
          ${isActive ? "border-white/40" : "border-gray-400/30 group-hover:border-white/30"}
        `}
      />

      {/* Corner Details */}
      <div className="absolute top-1 left-1 w-2 h-2 bg-white/20 rounded-full" />
      <div className="absolute top-1 right-1 w-2 h-2 bg-white/20 rounded-full" />
      <div className="absolute bottom-1 left-1 w-2 h-2 bg-white/20 rounded-full" />
      <div className="absolute bottom-1 right-1 w-2 h-2 bg-white/20 rounded-full" />

      {/* Center Lines */}
      <div className="absolute top-1/2 left-2 right-2 h-px bg-white/10 transform -translate-y-1/2" />

      {/* Button Text */}
      <div className="absolute inset-0 flex items-center justify-center p-2">
        <span
          className={`
            text-xs font-bold text-center leading-tight transition-all duration-300
            ${isActive ? "text-white drop-shadow-lg" : "text-gray-200 group-hover:text-white"}
          `}
          style={{
            textShadow: isActive ? "0 0 8px rgba(255,255,255,0.5)" : "none",
            fontSize: title.length > 15 ? "10px" : "12px",
          }}
        >
          {title}
        </span>
      </div>

      {/* Active Indicator */}
      {isActive && (
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-1 bg-[#01ADEF] rounded-full animate-pulse" />
      )}

      {/* Hover Glow Effect */}
      <div
        className={`
          absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300
          ${isActive ? "opacity-100" : ""}
        `}
        style={{
          background: "radial-gradient(circle at center, rgba(1, 173, 239, 0.2) 0%, transparent 70%)",
        }}
      />
    </button>
  )
}
