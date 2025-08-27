"use client"

import { useEffect, useRef, useState } from "react"
import { conversationStore, type ChatMessage } from "@/utils/conversation-store"

interface StarWarsChatProps {
  messages: ChatMessage[]; // Added to fix TypeScript error
  isTyping?: boolean
  showControls?: boolean
}

export function StarWarsChat({ messages, isTyping = false, showControls = false }: StarWarsChatProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  // Removed local messages state to use prop directly
  // const [messages, setMessages] = useState<ChatMessage[]>(conversationStore.getMessages())

  // Subscribe to conversation updates
  useEffect(() => {
    const unsubscribe = conversationStore.subscribe((newMessages) => {
      // setMessages(newMessages) // No longer needed as messages is a prop
    })

    return unsubscribe
  }, [])

  // Auto-scroll to bottom when new messages or typing state changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const clearConversation = () => {
    conversationStore.clearMessages()
  }

  return (
    <div className="relative w-full h-96 bg-gradient-to-b from-gray-50 to-white rounded-lg overflow-hidden border border-[#01ADEF]/20">
      {/* Chat messages container with subtle perspective */}
      <div
        ref={containerRef}
        className="relative h-full overflow-y-auto scrollbar-hide"
        style={{
          perspective: "1000px",
          perspectiveOrigin: "center bottom",
        }}
      >
        <div className="flex flex-col justify-end min-h-full p-4 space-y-3">
          {messages.length === 0 && (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500 text-center">Start a conversation by holding the microphone button</p>
            </div>
          )}

          {messages.map((message, index) => {
            // Calculate subtle depth effect - newer messages (higher index) are closer
            const totalMessages = messages.length
            const depthFactor = (totalMessages - index - 1) / Math.max(totalMessages - 1, 1)
            const scale = 1 - depthFactor * 0.15 // Scale from 0.85 to 1 (subtle difference)
            const opacity = 1 - depthFactor * 0.4 // Opacity from 0.6 to 1
            const translateZ = depthFactor * -50 // Move back in 3D space (reduced)
            const rotateX = depthFactor * 8 // Subtle tilt back for perspective (reduced)

            return (
              <div
                key={message.id}
                className={`transition-all duration-300 ${
                  message.sender === "user" ? "flex justify-end" : "flex justify-start"
                }`}
                style={{
                  transform: `translateZ(${translateZ}px) rotateX(${rotateX}deg) scale(${scale})`,
                  opacity: opacity,
                  transformOrigin: "center bottom",
                  marginBottom: `${depthFactor * 4}px`, // Reduced spacing difference
                }}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                    message.sender === "user"
                      ? "bg-[#01ADEF] text-white rounded-br-md"
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
                  }`}
                  style={{
                    fontSize: `${0.9 + (1 - depthFactor) * 0.1}rem`, // Font size from 0.9rem to 1rem (subtle)
                    fontWeight: Math.round(400 + (1 - depthFactor) * 100), // Weight from 400 to 500 (subtle)
                  }}
                >
                  <div className="flex items-start space-x-2">
                    <span
                      className={`${message.sender === "user" ? "text-white/80" : "text-gray-500"} text-xs font-medium`}
                    >
                      {message.sender === "user" ? "You" : "Arash"}
                    </span>
                  </div>
                  <p className="mt-1 leading-relaxed">{message.text}</p>
                </div>
              </div>
            )
          })}

          {/* Typing indicator */}
          {isTyping && (
            <div
              className="flex justify-start transition-all duration-300"
              style={{
                transform: "translateZ(0px) rotateX(0deg) scale(1)",
                opacity: 1,
              }}
            >
              <div className="bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                <div className="flex items-start space-x-2 mb-1">
                  <span className="text-xs font-medium text-gray-500">Arash</span>
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Subtle gradient overlay for depth effect */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-transparent via-transparent to-white/20" />

      {/* Controls (optional) */}
      {showControls && messages.length > 0 && (
        <div className="absolute top-2 right-2">
          <button
            onClick={clearConversation}
            className="text-xs text-gray-500 hover:text-red-500 bg-white/80 px-2 py-1 rounded transition-colors"
          >
            Clear Chat
          </button>
        </div>
      )}
    </div>
  )
}