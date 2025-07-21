"use client"

import { Button } from "@/components/ui/button"
import { User, Bell, Shield, Palette } from "lucide-react"

interface SettingsWindowProps {
  onContinue?: () => void
}

export function SettingsWindow({ onContinue }: SettingsWindowProps) {
  return (
    <div className="text-center p-8 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-[#08075C] mb-6">Settings & Preferences</h2>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
        <div className="bg-gradient-to-br from-[#01ADEF]/10 to-[#08075C]/10 p-6 rounded-lg border border-[#01ADEF]/20">
          <div className="flex items-center gap-3 mb-4">
            <User className="text-[#01ADEF]" size={24} />
            <h3 className="font-bold text-[#08075C]">Profile Settings</h3>
          </div>
          <p className="text-gray-700 text-left">Manage your account information, preferences, and personal details.</p>
        </div>

        <div className="bg-gradient-to-br from-[#08075C]/10 to-[#01ADEF]/10 p-6 rounded-lg border border-[#01ADEF]/20">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="text-[#01ADEF]" size={24} />
            <h3 className="font-bold text-[#08075C]">Notifications</h3>
          </div>
          <p className="text-gray-700 text-left">
            Configure how and when you receive notifications from your AI assistant.
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#01ADEF]/10 to-[#08075C]/10 p-6 rounded-lg border border-[#01ADEF]/20">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="text-[#01ADEF]" size={24} />
            <h3 className="font-bold text-[#08075C]">Privacy & Security</h3>
          </div>
          <p className="text-gray-700 text-left">Control your data privacy settings and security preferences.</p>
        </div>

        <div className="bg-gradient-to-br from-[#08075C]/10 to-[#01ADEF]/10 p-6 rounded-lg border border-[#01ADEF]/20">
          <div className="flex items-center gap-3 mb-4">
            <Palette className="text-[#01ADEF]" size={24} />
            <h3 className="font-bold text-[#08075C]">Appearance</h3>
          </div>
          <p className="text-gray-700 text-left">Customize the look and feel of your AI assistant interface.</p>
        </div>
      </div>

      <div className="bg-white/80 p-6 rounded-lg border border-[#01ADEF]/20">
        <p className="text-[#08075C] mb-4">
          <strong>Note:</strong> These settings are only available to signed-in users. Your preferences will be saved to
          your account.
        </p>
      </div>

      <Button onClick={onContinue} className="mt-6 bg-[#01ADEF] hover:bg-[#0194D1] text-white">
        Save Settings
      </Button>
    </div>
  )
}
