"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { StarWarsChat } from "@/components/star-wars-chat"
import { conversationStore, type ChatMessage } from "@/utils/conversation-store"

interface ChatboxWindowProps {
  onContinue?: () => void
}

export function ChatboxWindow({ onContinue }: ChatboxWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(conversationStore.getMessages())

  // Subscribe to conversation updates
  useEffect(() => {
    const unsubscribe = conversationStore.subscribe((newMessages) => {
      setMessages(newMessages)
    })

    return unsubscribe
  }, [])

  return (
    <div className="text-center p-8 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-[#08075C] mb-6">AI Conversation</h2>

      <div className="mb-6">
        <StarWarsChat showControls={true} />
      </div>

      <div className="bg-gradient-to-r from-[#01ADEF]/10 to-[#08075C]/10 rounded-2xl p-4 border border-[#01ADEF]/20">
        <p className="text-[#08075C] mb-2">
          <strong>Hold the microphone</strong> in the bottom-right corner to speak with Arash
        </p>
        <p className="text-[#01ADEF] text-sm">Your conversation history is synchronized across all pages</p>
      </div>

      {messages.length > 1 && (
        <Button onClick={onContinue} className="mt-6 bg-[#01ADEF] hover:bg-[#0194D1] text-white">
          Continue Journey
        </Button>
      )}
    </div>
  )
}
