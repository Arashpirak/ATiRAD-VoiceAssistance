"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, Mic, Users, Volume2, VolumeX, Pin, PinOff, Lock, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { WINDOW_REGISTRY, type WindowConfig } from "@/windows/window-registry"
import { ModernPinButton } from "@/components/modern-pin-button"
import { conversationStore } from "@/utils/conversation-store"

type RecordingState =
  | "idle"
  | "requesting-permission"
  | "ready"
  | "recording"
  | "processing"
  | "waiting-llm"
  | "generating-voice"
  | "playing-response"

interface WindowState extends WindowConfig {
  position: { x: number; y: number; scale: number; depth: number }
  isPinned: boolean
}

export default function PathwayPage() {
  const [currentWindowId, setCurrentWindowId] = useState<string>("sign-in")
  const [aiVolumeLevel, setAiVolumeLevel] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false) // Track login status
  const [windows, setWindows] = useState<WindowState[]>(() =>
    WINDOW_REGISTRY.map((window) => ({
      ...window,
      position: { ...window.initialPosition },
      isPinned: ["how-we-help", "features", "pricing"].includes(window.id), // Default pins
    })),
  )
  const [pinnedWindows, setPinnedWindows] = useState<string[]>(["how-we-help", "features", "pricing"]) // Default 3 pinned
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  // Voice interface states
  const [recordingState, setRecordingState] = useState<RecordingState>("idle")
  const [progress, setProgress] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volumeLevel, setVolumeLevel] = useState(0)

  // Audio refs for voice interface
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const voiceAudioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const isRecordingRef = useRef(false)

  // Audio context for movement sound
  const audioContextRef = useRef<AudioContext | null>(null)

  // Listen for login status changes from sign-in window
  useEffect(() => {
    const handleStorageChange = () => {
      const loginStatus = localStorage.getItem("isLoggedIn") === "true"
      setIsLoggedIn(loginStatus)
    }

    // Check initial login status
    handleStorageChange()

    // Listen for changes
    window.addEventListener("storage", handleStorageChange)

    // Custom event for same-tab updates
    window.addEventListener("loginStatusChanged", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("loginStatusChanged", handleStorageChange)
    }
  }, [])

  // Filter windows based on auth requirements
  const visibleWindows = windows.filter((window) => {
    if (window.requiresAuth && !isLoggedIn) {
      return false // Hide auth-required windows for non-logged users
    }
    return true
  })

  // Initialize audio contexts
  useEffect(() => {
    const initAudio = async () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }

      // Initialize voice interface
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        streamRef.current = stream

        voiceAudioContextRef.current = new AudioContext()
        const source = voiceAudioContextRef.current.createMediaStreamSource(stream)
        analyserRef.current = voiceAudioContextRef.current.createAnalyser()
        analyserRef.current.fftSize = 256
        source.connect(analyserRef.current)

        setRecordingState("ready")
        startVolumeMonitoring()
      } catch (error) {
        console.error("Microphone permission denied:", error)
        setRecordingState("idle")
      }
    }

    const handleFirstInteraction = () => {
      initAudio()
      document.removeEventListener("click", handleFirstInteraction)
      document.removeEventListener("keydown", handleFirstInteraction)
    }

    document.addEventListener("click", handleFirstInteraction)
    document.addEventListener("keydown", handleFirstInteraction)

    return () => {
      document.removeEventListener("click", handleFirstInteraction)
      document.removeEventListener("keydown", handleFirstInteraction)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (voiceAudioContextRef.current) {
        voiceAudioContextRef.current.close()
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [])

  const startVolumeMonitoring = () => {
    if (!analyserRef.current) return

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)

    const monitor = () => {
      if (!analyserRef.current) return

      analyserRef.current.getByteFrequencyData(dataArray)
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length
      const normalizedVolume = Math.min(average / 50, 1)

      setVolumeLevel(normalizedVolume)

      if (isRecordingRef.current) {
        setIsListening(average > 15)
      }

      animationFrameRef.current = requestAnimationFrame(monitor)
    }

    monitor()
  }

  const startRecording = () => {
    if (!streamRef.current || recordingState !== "ready") return

    isRecordingRef.current = true
    setRecordingState("recording")
    setProgress(0)
    audioChunksRef.current = []

    mediaRecorderRef.current = new MediaRecorder(streamRef.current)

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data)
      }
    }

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
      await processAudio(audioBlob)
    }

    mediaRecorderRef.current.start()

    let currentProgress = 0
    progressIntervalRef.current = setInterval(() => {
      currentProgress += 1
      setProgress(currentProgress)

      if (currentProgress >= 100) {
        stopRecording()
      }
    }, 100)
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecordingRef.current) {
      isRecordingRef.current = false
      mediaRecorderRef.current.stop()
      setRecordingState("processing")
      setIsListening(false)

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }

  const processAudio = async (audioBlob: Blob) => {
    try {
      setRecordingState("processing")

      // Add user message (simulated transcription)
      conversationStore.addMessage("Hello, my name is John. Nice to meet you!", "user")

      const formData = new FormData()
      formData.append("audio", audioBlob, "recording.wav")

      setRecordingState("waiting-llm")
      setIsTyping(true)

      const response = await fetch("/api/process-voice", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      setRecordingState("generating-voice")

      if (data.success) {
        await playResponse(data.response)
      } else {
        await playResponse("I'm sorry, I couldn't process your request. Please try again.")
      }
    } catch (error) {
      console.error("Error processing audio:", error)
      await playResponse("There was an error processing your request. Please try again.")
    }

    setIsTyping(false)
    setRecordingState("ready")
    setProgress(0)
  }

  const playResponse = async (text: string) => {
    // Add AI response to conversation store
    conversationStore.addMessage(text, "ai")

    if (isMuted) {
      setRecordingState("ready")
      return
    }

    setRecordingState("playing-response")

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 0.8

    // Monitor AI voice volume
    const monitorAiVolume = () => {
      if (speechSynthesis.speaking) {
        setAiVolumeLevel(Math.random() * 0.8 + 0.2) // Simulate AI voice volume
        requestAnimationFrame(monitorAiVolume)
      } else {
        setAiVolumeLevel(0)
      }
    }

    return new Promise<void>((resolve) => {
      utterance.onstart = () => monitorAiVolume()
      utterance.onend = () => {
        setAiVolumeLevel(0)
        setRecordingState("ready")
        resolve()
      }
      speechSynthesis.speak(utterance)
    })
  }

  const getStatusText = () => {
    switch (recordingState) {
      case "requesting-permission":
        return "Requesting microphone permission..."
      case "ready":
        return "Ready to listen - Hold the microphone to speak"
      case "recording":
        return isListening ? "Listening to your voice..." : "Speak now, I'm listening"
      case "processing":
        return "Processing your recorded voice..."
      case "waiting-llm":
        return "Sending to AI brain for analysis..."
      case "generating-voice":
        return "Generating voice response..."
      case "playing-response":
        return "Playing AI response..."
      default:
        return "Initializing voice assistant..."
    }
  }

  const generateVolumeWaves = () => {
    const waves = []
    const waveCount = 8

    for (let i = 0; i < waveCount; i++) {
      const isActive = volumeLevel > (i + 1) * 0.125
      const height = isActive ? 15 + volumeLevel * 40 + Math.sin(Date.now() * 0.01 + i) * 8 : 6
      const opacity = isActive ? 0.9 : 0.2

      waves.push(
        <div
          key={i}
          className="bg-white rounded-full transition-all duration-150"
          style={{
            width: "2px",
            height: `${height}px`,
            marginRight: "2px",
            opacity: opacity,
            boxShadow: isActive ? "0 0 8px rgba(1, 173, 239, 0.6)" : "none",
          }}
        />,
      )
    }

    return waves
  }

  // Generate AI voice volume bars (different style) - 50% wider
  const generateAiVolumeWaves = () => {
    const waves = []
    const waveCount = 8 // Increased count for wider bar

    for (let i = 0; i < waveCount; i++) {
      const isActive = aiVolumeLevel > (i + 1) * 0.125
      const height = isActive ? 20 + aiVolumeLevel * 30 + Math.sin(Date.now() * 0.015 + i) * 5 : 8
      const opacity = isActive ? 0.9 : 0.3

      waves.push(
        <div
          key={i}
          className="bg-gradient-to-t from-[#01ADEF] to-white rounded-t-full transition-all duration-200"
          style={{
            width: "4px",
            height: `${height}px`,
            marginRight: "3px",
            opacity: opacity,
            boxShadow: isActive ? "0 0 10px rgba(1, 173, 239, 0.8)" : "none",
          }}
        />,
      )
    }

    return waves
  }

  // Play movement sound - Faster speed
  const playMovementSound = () => {
    if (!audioContextRef.current || isMuted) return // Respect mute state

    try {
      const oscillator = audioContextRef.current.createOscillator()
      const gainNode = audioContextRef.current.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContextRef.current.destination)

      oscillator.frequency.setValueAtTime(80, audioContextRef.current.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(40, audioContextRef.current.currentTime + 0.5) // Reduced from 0.8

      gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.1, audioContextRef.current.currentTime + 0.05) // Reduced from 0.1
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.5) // Reduced from 0.8

      oscillator.type = "sine"
      oscillator.start(audioContextRef.current.currentTime)
      oscillator.stop(audioContextRef.current.currentTime + 0.5) // Reduced from 0.8
    } catch (error) {
      console.log("Audio playback failed:", error)
    }
  }

  const unlockNextWindow = () => {
    // No longer needed since all windows are unlocked by default
    const currentIndex = visibleWindows.findIndex((w) => w.id === currentWindowId)
    if (currentIndex < visibleWindows.length - 1) {
      const nextWindow = visibleWindows[currentIndex + 1]
      navigateToWindow(nextWindow.id)
    }
  }

  const navigateToWindow = async (windowId: string) => {
    const targetWindow = visibleWindows.find((w) => w.id === windowId)
    if (!targetWindow || windowId === currentWindowId || isTransitioning) return

    // Check if window requires auth and user is not logged in
    if (targetWindow.requiresAuth && !isLoggedIn) {
      alert("Please sign in to access this feature.")
      return
    }

    setIsTransitioning(true)
    playMovementSound()

    setWindows((prev) =>
      prev.map((window) => {
        if (window.id === currentWindowId) {
          // Move current window to its original position
          return { ...window, position: { ...window.initialPosition } }
        } else if (window.id === windowId) {
          // Bring target window to center
          return { ...window, position: { x: 0, y: 0, scale: 1.0, depth: 0 } }
        }
        return window
      }),
    )

    await new Promise((resolve) => setTimeout(resolve, 600)) // Reduced from 1000ms to 600ms

    setCurrentWindowId(windowId)
    setIsTransitioning(false)
  }

  const togglePin = (windowId: string) => {
    const window = visibleWindows.find((w) => w.id === windowId)
    if (!window) return

    if (pinnedWindows.includes(windowId)) {
      // Unpin
      setPinnedWindows((prev) => prev.filter((id) => id !== windowId))
      setWindows((prev) => prev.map((w) => (w.id === windowId ? { ...w, isPinned: false } : w)))
    } else {
      // Pin (max 10)
      if (pinnedWindows.length < 10) {
        setPinnedWindows((prev) => [...prev, windowId])
        setWindows((prev) => prev.map((w) => (w.id === windowId ? { ...w, isPinned: true } : w)))
      }
    }
  }

  const navigateToPinnedWindow = (windowId: string) => {
    navigateToWindow(windowId)
  }

  const navigateToPreviousWindow = () => {
    const currentIndex = visibleWindows.findIndex((w) => w.id === currentWindowId)
    if (currentIndex > 0) {
      navigateToWindow(visibleWindows[currentIndex - 1].id)
    }
  }

  const navigateToNextWindow = () => {
    const currentIndex = visibleWindows.findIndex((w) => w.id === currentWindowId)
    if (currentIndex < visibleWindows.length - 1) {
      navigateToWindow(visibleWindows[currentIndex + 1].id)
    }
  }

  // Handle scroll navigation
  useEffect(() => {
    const handleWheelEvent = (e: WheelEvent) => {
      e.preventDefault()

      if (isTransitioning) return

      const currentIndex = visibleWindows.findIndex((w) => w.id === currentWindowId)

      if (e.deltaY > 0 && currentIndex < visibleWindows.length - 1) {
        navigateToWindow(visibleWindows[currentIndex + 1].id)
      } else if (e.deltaY < 0 && currentIndex > 0) {
        navigateToWindow(visibleWindows[currentIndex - 1].id)
      }
    }

    window.addEventListener("wheel", handleWheelEvent, { passive: false })
    return () => window.removeEventListener("wheel", handleWheelEvent)
  }, [currentWindowId, isTransitioning, visibleWindows])

  const currentWindow = visibleWindows.find((w) => w.id === currentWindowId)
  const CurrentWindowComponent = currentWindow?.component

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#08075C] via-[#01ADEF] to-white overflow-hidden relative">
      {/* Static Pathway Background - Always Visible */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Pathway Lines */}
        <svg className="absolute inset-0 w-full h-full">
          <line
            x1="5%"
            y1="20%"
            x2="48%"
            y2="85%"
            stroke="rgba(255, 255, 255, 0.4)"
            strokeWidth="2"
            className="drop-shadow-lg"
          />
          <line
            x1="95%"
            y1="20%"
            x2="52%"
            y2="85%"
            stroke="rgba(255, 255, 255, 0.4)"
            strokeWidth="2"
            className="drop-shadow-lg"
          />
          <line x1="48%" y1="85%" x2="52%" y2="85%" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        </svg>

        {/* All Pathway Windows - Always Visible at Different Depths and Sides */}
        {visibleWindows.map((window, index) => {
          const isActive = window.id === currentWindowId
          const opacityEffect = isActive ? 0 : Math.max(0.3, 1 - window.position.depth * 0.15)

          return (
            <div
              key={window.id}
              className={`absolute transition-all duration-600 ease-out cursor-pointer hover:scale-105`}
              style={{
                left: `${50 + window.position.x}%`,
                top: `${40 + window.position.y}%`,
                transform: `translate(-50%, -50%) scale(${Math.max(0.05, window.position.scale)})`,
                opacity: opacityEffect,
                zIndex: isActive ? 0 : 10 - window.position.depth,
                pointerEvents: "auto", // Allow interaction with all windows
              }}
            >
              <div className="relative">
                {/* Pin Icon - Top Left of Window - Show for ALL windows including active */}
                <div className="absolute -top-2 -left-2 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      togglePin(window.id)
                    }}
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm
                      ${
                        window.isPinned
                          ? "bg-[#01ADEF] text-white shadow-lg shadow-[#01ADEF]/50 border border-white/20"
                          : "bg-white/20 text-white hover:bg-[#01ADEF] hover:text-white border border-white/30"
                      }
                    `}
                  >
                    {window.isPinned ? <PinOff size={14} /> : <Pin size={14} />}
                  </button>
                </div>

                {/* Auth Required Icon - Top Right */}
                {window.requiresAuth && !isLoggedIn && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-orange-500 text-white shadow-lg border border-white/20">
                      <Lock size={14} />
                    </div>
                  </div>
                )}

                {/* Clickable Title above window */}
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                  <div
                    className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg border transition-all duration-300 ${
                      window.requiresAuth && !isLoggedIn
                        ? "bg-gray-300/70 text-gray-500 border-gray-400/30 cursor-not-allowed"
                        : "bg-white/90 text-[#08075C] border-[#01ADEF]/30 hover:bg-[#01ADEF] hover:text-white cursor-pointer transform hover:scale-110"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!isActive) {
                        navigateToWindow(window.id)
                      }
                    }}
                  >
                    {window.title}
                    {window.requiresAuth && !isLoggedIn && " 🔒"}
                  </div>
                </div>

                {/* Window */}
                <div
                  className={`border-3 bg-white/10 backdrop-blur-sm rounded-lg p-8 min-w-[250px] min-h-[180px] flex flex-col justify-center items-center shadow-2xl transition-all duration-300 hover:bg-white/20 border-white/60`}
                  style={{
                    boxShadow: `0 0 40px rgba(1, 173, 239, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.1)`,
                    borderColor: index % 2 === 0 ? "#01ADEF" : "#ffffff",
                    filter: window.requiresAuth && !isLoggedIn ? "grayscale(50%)" : "none",
                  }}
                  onClick={() => !isActive && navigateToWindow(window.id)}
                >
                  <div className="text-center">
                    <h3 className="font-bold text-xl mb-3 text-white">{window.title}</h3>
                    <p className="text-sm leading-relaxed text-white/90">{window.description}</p>
                    {window.requiresAuth && !isLoggedIn && (
                      <div className="mt-3 text-orange-300 text-xs">🔒 Sign in required</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {/* Floor grid effect */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32 opacity-20"
          style={{
            background: `linear-gradient(90deg, transparent 49%, rgba(255,255,255,0.3) 50%, transparent 51%), 
                        linear-gradient(0deg, transparent 49%, rgba(255,255,255,0.3) 50%, transparent 51%)`,
            backgroundSize: "50px 50px",
            transform: `perspective(500px) rotateX(60deg)`,
          }}
        />
      </div>

      {/* AI Voice Volume Bar - Top Left */}
      <div className="absolute top-8 left-8 flex flex-col items-center gap-2 z-20">
        <span className="text-white text-xs font-medium">AI Voice</span>
        <div className="flex items-end h-12 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 px-4 py-2">
          {generateAiVolumeWaves()}
        </div>
      </div>

      {/* Header */}
      <div className="absolute top-4 left-48 z-20">
        <Link href="/">
          <Button
            variant="outline"
            size="sm"
            className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Assistant
          </Button>
        </Link>
      </div>

      {/* Top Right Controls */}
      <div className="absolute top-4 right-4 flex gap-4 z-20">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMuted(!isMuted)}
          className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </Button>

        <Link href="/customers">
          <Button
            variant="outline"
            size="icon"
            className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
          >
            <Users size={20} />
          </Button>
        </Link>
      </div>

      {/* Login Status Indicator */}
      {isLoggedIn && (
        <div className="absolute top-4 right-32 z-20">
          <div className="bg-green-500/20 border border-green-400/30 text-green-100 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
            ✓ Signed In
          </div>
        </div>
      )}

      {/* Status Message - Bottom Left Corner */}
      <div className="absolute bottom-8 left-8 z-20">
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 shadow-2xl border border-white/30 max-w-sm">
          <p className="text-white font-semibold">{getStatusText()}</p>
          {recordingState === "recording" && (
            <p className="text-white/80 text-sm mt-2">{Math.ceil((100 - progress) / 10)} seconds remaining</p>
          )}
        </div>
      </div>

      {/* Mic Button with Volume Visualization - Bottom Right */}
      <div className="absolute bottom-8 right-8 flex items-center gap-4 z-20">
        {/* Volume Visualization next to mic */}
        <div className="flex items-end h-16 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 flex-row px-7">
          {generateVolumeWaves()}
        </div>

        {/* Mic Button with label */}
        <div className="flex flex-col items-center">
          {/* Hold to speak text */}
          <div className="mb-2">
            <span className="text-white text-sm font-medium bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full">
              Hold to speak
            </span>
          </div>

          {/* Mic Button */}
          <div className="relative">
            {/* Outer pulse rings */}
            {(recordingState === "recording" || recordingState === "playing-response") && (
              <>
                <div className="absolute inset-0 rounded-full bg-[#01ADEF]/30 animate-ping" />
                <div className="absolute inset-0 rounded-full bg-white/20 animate-ping animation-delay-75" />
              </>
            )}

            {/* Voice activity indicator */}
            {isListening && recordingState === "recording" && (
              <div className="absolute inset-0 rounded-full bg-green-400/40 animate-pulse" />
            )}

            {/* Mic Button */}
            <button
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              disabled={recordingState !== "ready"}
              className={`
                relative w-20 h-20 rounded-full flex items-center justify-center
                transition-all duration-200 transform shadow-2xl border-3
                ${
                  recordingState === "ready"
                    ? "bg-white border-[#01ADEF] text-[#01ADEF] hover:bg-[#01ADEF] hover:text-white hover:scale-105 cursor-pointer"
                    : "bg-gray-300 border-gray-400 text-gray-500 cursor-not-allowed"
                }
                ${recordingState === "recording" ? "scale-110 bg-red-500 border-red-400 text-white" : ""}
              `}
            >
              <Mic size={32} />

              {/* Progress ring */}
              {recordingState === "recording" && (
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle cx="50%" cy="50%" r="35" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="35"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 35}`}
                    strokeDashoffset={`${2 * Math.PI * 35 * (1 - progress / 100)}`}
                    className="transition-all duration-100"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Active Window - Only visible when active */}
      <div className="flex items-center justify-center min-h-screen p-8 relative z-15">
        <div
          className={`bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-[#01ADEF]/20 max-w-4xl w-full transition-all duration-600 ease-out relative ${
            isTransitioning ? "scale-90 opacity-70" : "scale-100 opacity-100"
          }`}
        >
          {/* Left Navigation Arrow - 5% width */}
          <div className="absolute left-0 top-0 bottom-0 w-[5%] flex items-center justify-center">
            <button
              onClick={navigateToPreviousWindow}
              disabled={visibleWindows.findIndex((w) => w.id === currentWindowId) === 0}
              className={`
                w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm shadow-lg
                ${
                  visibleWindows.findIndex((w) => w.id === currentWindowId) === 0
                    ? "bg-gray-300/50 text-gray-400 cursor-not-allowed"
                    : "bg-[#01ADEF]/20 text-[#01ADEF] hover:bg-[#01ADEF] hover:text-white border border-[#01ADEF]/30 hover:scale-110"
                }
              `}
              title="Previous window"
            >
              <ChevronLeft size={24} />
            </button>
          </div>

          {/* Right Navigation Arrow - 95% width */}
          <div className="absolute right-0 top-0 bottom-0 w-[5%] flex items-center justify-center">
            <button
              onClick={navigateToNextWindow}
              disabled={visibleWindows.findIndex((w) => w.id === currentWindowId) === visibleWindows.length - 1}
              className={`
                w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm shadow-lg
                ${
                  visibleWindows.findIndex((w) => w.id === currentWindowId) === visibleWindows.length - 1
                    ? "bg-gray-300/50 text-gray-400 cursor-not-allowed"
                    : "bg-[#01ADEF]/20 text-[#01ADEF] hover:bg-[#01ADEF] hover:text-white border border-[#01ADEF]/30 hover:scale-110"
                }
              `}
              title="Next window"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {CurrentWindowComponent && <CurrentWindowComponent onContinue={unlockNextWindow} />}

          {/* Pin Button for Active Window - Bottom Right Corner */}
          {currentWindow && (
            <div className="absolute bottom-4 right-4">
              <button
                onClick={() => togglePin(currentWindow.id)}
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm shadow-lg
                  ${
                    currentWindow.isPinned
                      ? "bg-[#01ADEF] text-white shadow-[#01ADEF]/50 border-2 border-white/20 hover:bg-[#0194D1]"
                      : "bg-white/20 text-[#08075C] hover:bg-[#01ADEF] hover:text-white border-2 border-[#01ADEF]/30"
                  }
                  hover:scale-110 active:scale-95
                `}
                title={currentWindow.isPinned ? "Unpin this window" : "Pin this window"}
              >
                {currentWindow.isPinned ? <PinOff size={20} /> : <Pin size={20} />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pinned Windows Buttons - Under Main Window */}
      {pinnedWindows.length > 0 && (
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex flex-wrap gap-4 justify-center max-w-5xl">
            {pinnedWindows.map((windowId) => {
              const window = visibleWindows.find((w) => w.id === windowId)
              if (!window) return null

              return (
                <ModernPinButton
                  key={windowId}
                  title={window.title}
                  onClick={() => navigateToPinnedWindow(windowId)}
                  isActive={windowId === currentWindowId}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Navigation Hint */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
        <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm">
          All windows accessible • 🔒 = Sign in required • Click titles/windows to navigate
        </div>
      </div>
    </div>
  )
}
