"use client"

import { Button } from "@/components/ui/button"

interface PricingWindowProps {
  onContinue?: () => void
}

export function PricingWindow({ onContinue }: PricingWindowProps) {
  return (
    <div className="text-center p-8">
      <h2 className="text-3xl font-bold text-[#08075C] mb-6">Choose Your Plan</h2>
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <div className="bg-white/80 p-6 rounded-lg border border-[#01ADEF]/20">
          <h3 className="font-bold text-[#08075C] text-xl mb-4">Starter</h3>
          <div className="text-3xl font-bold text-[#01ADEF] mb-4">$29/mo</div>
          <ul className="space-y-2 text-left text-gray-700">
            <li>• Up to 1,000 conversations/month</li>
            <li>• Basic customization</li>
            <li>• Email support</li>
          </ul>
        </div>
        <div className="bg-gradient-to-br from-[#01ADEF]/10 to-[#08075C]/10 p-6 rounded-lg border-2 border-[#01ADEF]">
          <h3 className="font-bold text-[#08075C] text-xl mb-4">Professional</h3>
          <div className="text-3xl font-bold text-[#01ADEF] mb-4">$99/mo</div>
          <ul className="space-y-2 text-left text-gray-700">
            <li>• Up to 10,000 conversations/month</li>
            <li>• Advanced customization</li>
            <li>• Priority support</li>
            <li>• Analytics dashboard</li>
          </ul>
        </div>
        <div className="bg-white/80 p-6 rounded-lg border border-[#01ADEF]/20">
          <h3 className="font-bold text-[#08075C] text-xl mb-4">Enterprise</h3>
          <div className="text-3xl font-bold text-[#01ADEF] mb-4">Custom</div>
          <ul className="space-y-2 text-left text-gray-700">
            <li>• Unlimited conversations</li>
            <li>• Custom training</li>
            <li>• Dedicated support</li>
            <li>• White-label solution</li>
          </ul>
        </div>
      </div>
      <Button onClick={onContinue} className="mt-6 bg-[#01ADEF] hover:bg-[#0194D1] text-white">
        Continue
      </Button>
    </div>
  )
}
