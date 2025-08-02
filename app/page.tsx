"use client"

import { useState, useEffect, useRef } from "react"
import { Mic, Users, Volume2, VolumeX } from "lucide-react"
// import { Button } from "@/components/ui/button"
import Link from "next/link"
import { StarWarsChat } from "@/components/star-wars-chat"
import { conversationStore, type ChatMessage } from "@/utils/conversation-store"

type RecordingState =
  | "idle"
  | "requesting-permission"
  | "ready"
  | "recording"
  | "processing"
  | "waiting-llm"
  | "generating-voice"
  | "playing-response"

export default function VoiceAssistant() {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle")
  const [progress, setProgress] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [permissionsGranted, setPermissionsGranted] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volumeLevel, setVolumeLevel] = useState(0)
  const [aiVolumeLevel, setAiVolumeLevel] = useState(0)
  const [messages, setMessages] = useState<ChatMessage[]>(conversationStore.getMessages())
  const [showChat, setShowChat] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const isRecordingRef = useRef(false)

  // Subscribe to conversation updates
  useEffect(() => {
    const unsubscribe = conversationStore.subscribe((newMessages) => {
      setMessages(newMessages)
      if (newMessages.length > 0) {
        setShowChat(true)
      }
    })

    // Check if there are existing messages
    const existingMessages = conversationStore.getMessages()
    if (existingMessages.length > 0) {
      setShowChat(true)
    }

    return unsubscribe
  }, [])

  // Add message to conversation store
  const addMessage = (text: string, sender: "user" | "ai") => {
    conversationStore.addMessage(text, sender)
  }

  // Request permissions and play intro
  useEffect(() => {
    const initializeApp = async () => {
      setRecordingState("requesting-permission")

      try {
        // Request microphone permission
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        streamRef.current = stream

        // Setup audio context for visualization
        audioContextRef.current = new AudioContext()
        const source = audioContextRef.current.createMediaStreamSource(stream)
        analyserRef.current = audioContextRef.current.createAnalyser()
        analyserRef.current.fftSize = 256
        source.connect(analyserRef.current)

        setPermissionsGranted(true)

        // Start continuous volume monitoring
        startVolumeMonitoring()

        // Play intro message and add to chat only if no existing messages
        const existingMessages = conversationStore.getMessages()
        if (existingMessages.length === 0) {
          await playIntroMessage()
        }
        setRecordingState("ready")
      } catch (error) {
        console.error("Permission denied:", error)
        setRecordingState("idle")
      }
    }

    initializeApp()

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
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
      const normalizedVolume = Math.min(average / 50, 1) // Normalize to 0-1

      setVolumeLevel(normalizedVolume)

      if (isRecordingRef.current) {
        setIsListening(average > 15) // Threshold for voice detection during recording
      }

      animationFrameRef.current = requestAnimationFrame(monitor)
    }

    monitor()
  }

  const playIntroMessage = async () => {
    const message = "Hi, my name is Arash, what is your name? You could hold the Mic icon in corner to speak with me."

    // Add AI message to chat
    addMessage(message, "ai")

    if (isMuted) return

    const utterance = new SpeechSynthesisUtterance(message)
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
        resolve()
      }
      speechSynthesis.speak(utterance)
    })
  }

  const startRecording = () => {
    if (!streamRef.current || recordingState !== "ready") return

    isRecordingRef.current = true
    setRecordingState("recording")
    setProgress(0)
    audioChunksRef.current = []

    // Setup media recorder
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

    // Progress timer (10 seconds)
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
      addMessage("Hello, my name is John. Nice to meet you!", "user")

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
    // Add AI response to chat
    addMessage(text, "ai")

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

  // Generate volume waves next to mic button
  const generateVolumeWaves = () => {
    const waves = []
    const waveCount = 8 // Increased from 4 to 8

    for (let i = 0; i < waveCount; i++) {
      const isActive = volumeLevel > (i + 1) * 0.125 // Adjusted threshold
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#08075C] via-[#01ADEF] to-white overflow-hidden relative">
      {/* Voice Interface Overlay */}
      <div className="fixed inset-0 z-20 pointer-events-none">
        {/* AI Voice Volume Bar - Top Left */}
        <div className="absolute top-8 left-8 flex flex-col items-center gap-2 pointer-events-auto">
          <span className="text-white text-xs font-medium">AI Voice</span>
          <div className="flex items-end h-12 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 px-4 py-2">
            {generateAiVolumeWaves()}
          </div>
        </div>

        {/* Header (title box, left-centered) */}
        <div className="absolute top-8 left-48 pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 shadow-2xl border border-[#01ADEF]/20">
            <h1 className="text-3xl font-bold text-[#08075C] mb-2">AI Voice Assistant</h1>
            <p className="text-[#01ADEF] font-medium">Intelligent voice-powered chatbot service</p>
          </div>
        </div>

        {/* Top-right controls */}
        <div className="absolute top-8 right-8 flex gap-4 pointer-events-auto">
          {/* Mute / Un-mute */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsMuted(!isMuted)}
            className="bg-white/95 border-[#01ADEF]/30 text-[#08075C] hover:bg-white shadow-xl"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </Button>

          {/* Customers page button */}
          <Link href="/customers">
            <Button
              variant="outline"
              size="icon"
              className="bg-white/95 border-[#01ADEF]/30 text-[#08075C] hover:bg-white shadow-xl"
            >
              <Users size={20} />
            </Button>
          </Link>
        </div>

        {/* Main Content */}
        <div className="flex flex-col items-center justify-center h-screen px-8">
          <div className="text-center max-w-4xl">
            <div className="bg-white/95 backdrop-blur-md rounded-3xl p-12 shadow-2xl border border-[#01ADEF]/20 mb-8">
              <h2 className="text-6xl font-bold text-[#08075C] mb-6">Hello, I'm Arash</h2>
              <p className="text-2xl text-[#01ADEF] mb-8 font-medium">Your AI Voice Assistant</p>

              {/* Show chat or welcome message */}
              {showChat ? (
                <div className="mb-6">
                  <StarWarsChat messages={messages} isTyping={isTyping} />
                </div>
              ) : (
                <div className="bg-gradient-to-r from-[#01ADEF]/10 to-[#08075C]/10 rounded-2xl p-6 border border-[#01ADEF]/20">
                  <p className="text-xl text-[#08075C] mb-4">What's your name? Hold the microphone and tell me!</p>
                  <p className="text-[#01ADEF]">
                    I can help you with information, answer questions, or assist with various tasks.
                  </p>
                </div>
              )}
            </div>

            {/* Sign In Button */}
            <div className="flex justify-center">
              <Link href="/pathway">
                <Button className="bg-[#01ADEF] hover:bg-[#0194D1] text-white px-8 py-3 rounded-full text-lg font-semibold shadow-xl border-2 border-white/20 pointer-events-auto">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 3D Robot Animation - Left of Status Message */}
        <div className="absolute bottom-8 left-72 pointer-events-none">
          <div className="relative w-24 h-32">
            {/* Robot Body */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-20 bg-gradient-to-b from-[#01ADEF] to-[#0194D1] rounded-lg shadow-lg animate-bounce">
              {/* Robot Head */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-white rounded-full shadow-lg border-2 border-[#01ADEF]">
                {/* Eyes */}
                <div className="absolute top-3 left-2 w-2 h-2 bg-[#01ADEF] rounded-full animate-pulse"></div>
                <div className="absolute top-3 right-2 w-2 h-2 bg-[#01ADEF] rounded-full animate-pulse"></div>
                {/* Mouth */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-[#01ADEF] rounded-full"></div>
                {/* Antenna */}
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0.5 h-3 bg-[#08075C]"></div>
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-[#01ADEF] rounded-full animate-ping"></div>
              </div>

              {/* Robot Arms */}
              <div className="absolute top-2 -left-3 w-2 h-8 bg-[#01ADEF] rounded-full transform rotate-12 animate-pulse"></div>
              <div className="absolute top-2 -right-3 w-2 h-8 bg-[#01ADEF] rounded-full transform -rotate-12 animate-pulse"></div>

              {/* Robot Chest Panel */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-8 h-6 bg-white/20 rounded border border-white/40">
                <div className="absolute top-1 left-1 w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                <div className="absolute top-1 right-1 w-1 h-1 bg-red-400 rounded-full animate-pulse"></div>
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-0.5 bg-white/60 rounded"></div>
              </div>

              {/* Robot Legs */}
              <div className="absolute -bottom-6 left-2 w-2 h-6 bg-[#0194D1] rounded-full"></div>
              <div className="absolute -bottom-6 right-2 w-2 h-6 bg-[#0194D1] rounded-full"></div>

              {/* Robot Feet */}
              <div className="absolute -bottom-8 left-1 w-4 h-2 bg-[#08075C] rounded-full"></div>
              <div className="absolute -bottom-8 right-1 w-4 h-2 bg-[#08075C] rounded-full"></div>
            </div>

            {/* Floating particles around robot */}
            <div
              className="absolute top-0 left-0 w-1 h-1 bg-[#01ADEF] rounded-full animate-ping"
              style={{ animationDelay: "0s" }}
            ></div>
            <div
              className="absolute top-4 right-0 w-1 h-1 bg-white rounded-full animate-ping"
              style={{ animationDelay: "0.5s" }}
            ></div>
            <div
              className="absolute bottom-12 left-2 w-1 h-1 bg-[#01ADEF] rounded-full animate-ping"
              style={{ animationDelay: "1s" }}
            ></div>
            <div
              className="absolute bottom-8 right-4 w-1 h-1 bg-white rounded-full animate-ping"
              style={{ animationDelay: "1.5s" }}
            ></div>
          </div>
        </div>

        {/* Status Message - Bottom Left Corner */}
        <div className="absolute bottom-8 left-8 pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-2xl border border-[#01ADEF]/20 max-w-sm">
            <p className="text-[#08075C] font-semibold">{getStatusText()}</p>
            {recordingState === "recording" && (
              <p className="text-[#01ADEF] text-sm mt-2">{Math.ceil((100 - progress) / 10)} seconds remaining</p>
            )}
          </div>
        </div>

        {/* Mic Button with Volume Visualization - Bottom Right */}
        <div className="absolute bottom-8 right-8 flex items-center gap-4 pointer-events-auto">
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

        {/* Footer */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
          <p className="text-white/80 text-sm drop-shadow-lg">
            Perfect for websites, WordPress plugins, and custom integrations
          </p>
        </div>
      </div>
    </div>
  )
}
