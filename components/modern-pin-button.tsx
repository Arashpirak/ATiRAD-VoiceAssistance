"use client"

interface ModernPinButtonProps {
  title: string
  onClick: () => void
  isActive?: boolean
}

export function ModernPinButton({ title, onClick, isActive = false }: ModernPinButtonProps) {
  // Calculate height based on title length
  const baseHeight = 45
  const heightPerChar = 1.2
  const calculatedHeight = Math.max(baseHeight, baseHeight + (title.length - 10) * heightPerChar)
  const height = Math.min(calculatedHeight, 75) // Max height of 75px

  return (
    <button
      onClick={onClick}
      className={`
        relative group transition-all duration-300 transform hover:scale-105 hover:-translate-y-1
        ${isActive ? "scale-105 -translate-y-1" : ""}
      `}
      style={{ width: "140px", height: `${height}px` }}
    >
      {/* Button Base - Modern Glass Style */}
      <div
        className={`
          absolute inset-0 rounded-2xl transition-all duration-300 backdrop-blur-md
          ${
            isActive
              ? "bg-gradient-to-br from-[#01ADEF]/90 via-[#0194D1]/80 to-[#08075C]/90 shadow-xl shadow-[#01ADEF]/40"
              : "bg-white/10 hover:bg-gradient-to-br hover:from-[#01ADEF]/60 hover:via-[#0194D1]/50 hover:to-[#08075C]/60"
          }
        `}
        style={{
          boxShadow: isActive
            ? "0 8px 32px rgba(1, 173, 239, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)"
            : "0 4px 16px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1)",
        }}
      />

      {/* Border Glow */}
      <div
        className={`
          absolute inset-0 rounded-2xl border transition-all duration-300
          ${
            isActive
              ? "border-white/40 shadow-[0_0_20px_rgba(1,173,239,0.6)]"
              : "border-white/20 group-hover:border-white/40 group-hover:shadow-[0_0_15px_rgba(1,173,239,0.3)]"
          }
        `}
      />

      {/* Modern Corner Accents */}
      <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-white/30 rounded-tl-lg" />
      <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-white/30 rounded-tr-lg" />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-white/30 rounded-bl-lg" />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-white/30 rounded-br-lg" />

      {/* Center Highlight Line */}
      <div className="absolute top-1/2 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-y-1/2" />

      {/* Button Text */}
      <div className="absolute inset-0 flex items-center justify-center p-3">
        <span
          className={`
            text-center leading-tight font-semibold transition-all duration-300
            ${isActive ? "text-white drop-shadow-lg" : "text-white/90 group-hover:text-white"}
          `}
          style={{
            textShadow: isActive ? "0 2px 8px rgba(0,0,0,0.3)" : "0 1px 4px rgba(0,0,0,0.2)",
            fontSize: title.length > 15 ? "11px" : title.length > 12 ? "12px" : "13px",
          }}
        >
          {title}
        </span>
      </div>

      {/* Active Indicator Dot */}
      {isActive && (
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full animate-pulse shadow-lg" />
      )}

      {/* Hover Glow Effect */}
      <div
        className={`
          absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none
          ${isActive ? "opacity-100" : ""}
        `}
        style={{
          background: "radial-gradient(circle at center, rgba(1, 173, 239, 0.15) 0%, transparent 70%)",
        }}
      />
    </button>
  )
}
