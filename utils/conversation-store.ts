"use client"

interface ChatMessage {
  id: string
  text: string
  sender: "user" | "ai"
  timestamp: number
}

class ConversationStore {
  private messages: ChatMessage[] = []
  private listeners: ((messages: ChatMessage[]) => void)[] = []

  constructor() {
    if (typeof window !== "undefined") {
      // Load messages from localStorage on initialization
      const stored = localStorage.getItem("chatMessages")
      if (stored) {
        try {
          this.messages = JSON.parse(stored)
        } catch (error) {
          console.error("Failed to parse stored messages:", error)
          this.messages = []
        }
      }
    }
  }

  addMessage(text: string, sender: "user" | "ai") {
    const newMessage: ChatMessage = {
      id: `${sender}-${Date.now()}-${Math.random()}`,
      text,
      sender,
      timestamp: Date.now(),
    }

    this.messages = [...this.messages, newMessage]

    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("chatMessages", JSON.stringify(this.messages))
    }

    // Notify all listeners
    this.listeners.forEach((listener) => listener(this.messages))
  }

  getMessages(): ChatMessage[] {
    return this.messages
  }

  subscribe(listener: (messages: ChatMessage[]) => void) {
    this.listeners.push(listener)

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  clearMessages() {
    this.messages = []
    if (typeof window !== "undefined") {
      localStorage.removeItem("chatMessages")
    }
    this.listeners.forEach((listener) => listener(this.messages))
  }
}

// Create singleton instance
export const conversationStore = new ConversationStore()

// Export types
export type { ChatMessage }
