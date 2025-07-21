"use client"

import { Button } from "@/components/ui/button"

interface FeaturesWindowProps {
  onContinue?: () => void
}

export function FeaturesWindow({ onContinue }: FeaturesWindowProps) {
  return (
    <div className="text-center p-8">
      <h2 className="text-3xl font-bold text-[#08075C] mb-6">Advanced AI Features</h2>
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-[#01ADEF]/20 to-[#08075C]/20 p-6 rounded-lg">
          <h3 className="font-bold text-[#08075C] mb-3">Natural Conversations</h3>
          <p className="text-gray-700">Advanced NLP for human-like interactions</p>
        </div>
        <div className="bg-gradient-to-br from-[#08075C]/20 to-[#01ADEF]/20 p-6 rounded-lg">
          <h3 className="font-bold text-[#08075C] mb-3">Context Awareness</h3>
          <p className="text-gray-700">Remembers conversation history and context</p>
        </div>
        <div className="bg-gradient-to-br from-[#01ADEF]/20 to-[#08075C]/20 p-6 rounded-lg">
          <h3 className="font-bold text-[#08075C] mb-3">Custom Training</h3>
          <p className="text-gray-700">Train on your specific business data</p>
        </div>
        <div className="bg-gradient-to-br from-[#08075C]/20 to-[#01ADEF]/20 p-6 rounded-lg">
          <h3 className="font-bold text-[#08075C] mb-3">Analytics Dashboard</h3>
          <p className="text-gray-700">Track performance and customer insights</p>
        </div>
      </div>
      <Button onClick={onContinue} className="mt-6 bg-[#01ADEF] hover:bg-[#0194D1] text-white">
        Continue
      </Button>
    </div>
  )
}
