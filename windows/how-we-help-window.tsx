"use client"

import { Button } from "@/components/ui/button"

interface HowWeHelpWindowProps {
  onContinue?: () => void
}

export function HowWeHelpWindow({ onContinue }: HowWeHelpWindowProps) {
  return (
    <div className="text-center p-8">
      <h2 className="text-3xl font-bold text-[#08075C] mb-6">How We Help Your Business</h2>
      <div className="space-y-4 text-left max-w-2xl mx-auto">
        <div className="bg-[#01ADEF]/10 p-4 rounded-lg">
          <h3 className="font-semibold text-[#08075C] mb-2">24/7 Customer Support</h3>
          <p className="text-gray-700">
            Never miss a customer inquiry with our AI assistant available around the clock.
          </p>
        </div>
        <div className="bg-[#08075C]/10 p-4 rounded-lg">
          <h3 className="font-semibold text-[#08075C] mb-2">Multi-language Support</h3>
          <p className="text-gray-700">Communicate with customers in their preferred language automatically.</p>
        </div>
        <div className="bg-[#01ADEF]/10 p-4 rounded-lg">
          <h3 className="font-semibold text-[#08075C] mb-2">Easy Integration</h3>
          <p className="text-gray-700">Simple WordPress plugin or custom API integration in minutes.</p>
        </div>
      </div>
      <Button onClick={onContinue} className="mt-6 bg-[#01ADEF] hover:bg-[#0194D1] text-white">
        Continue
      </Button>
    </div>
  )
}
