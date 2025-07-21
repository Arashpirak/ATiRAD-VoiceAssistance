"use client"

import { Button } from "@/components/ui/button"

interface HowToUseWindowProps {
  onContinue?: () => void
}

export function HowToUseWindow({ onContinue }: HowToUseWindowProps) {
  return (
    <div className="text-center p-8">
      <h2 className="text-3xl font-bold text-[#08075C] mb-6">Simple 3-Step Integration</h2>
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center space-x-4 p-4 bg-white/50 rounded-lg">
          <div className="bg-[#01ADEF] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
            1
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-[#08075C]">Install Plugin</h3>
            <p className="text-gray-700">Download and install our WordPress plugin or use our API</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 p-4 bg-white/50 rounded-lg">
          <div className="bg-[#01ADEF] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
            2
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-[#08075C]">Configure Settings</h3>
            <p className="text-gray-700">Customize the AI assistant to match your brand and needs</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 p-4 bg-white/50 rounded-lg">
          <div className="bg-[#01ADEF] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
            3
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-[#08075C]">Go Live</h3>
            <p className="text-gray-700">Your AI assistant is ready to help your customers!</p>
          </div>
        </div>
      </div>
      <Button onClick={onContinue} className="mt-6 bg-[#01ADEF] hover:bg-[#0194D1] text-white">
        Continue
      </Button>
    </div>
  )
}
