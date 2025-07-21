"use client"

import type React from "react"
import { SignInWindow } from "./sign-in-window"
import { HowWeHelpWindow } from "./how-we-help-window"
import { HowToUseWindow } from "./how-to-use-window"
import { FeaturesWindow } from "./features-window"
import { PricingWindow } from "./pricing-window"
import { GetStartedWindow } from "./get-started-window"
import { ChatboxWindow } from "./chatbox-window"
import { SettingsWindow } from "./settings-window"

export interface WindowConfig {
  id: string
  title: string
  description: string
  component: React.ComponentType<{ onContinue?: () => void }>
  initialPosition: { x: number; y: number; scale: number; depth: number }
  unlocked: boolean
  requiresAuth?: boolean
}

// Window registry - all windows are unlocked by default, some require authentication
export const WINDOW_REGISTRY: WindowConfig[] = [
  {
    id: "sign-in",
    title: "Sign In",
    description: "Welcome & Authentication",
    component: SignInWindow,
    initialPosition: { x: -45, y: 15, scale: 1.0, depth: 0 },
    unlocked: true,
  },
  {
    id: "chatbox",
    title: "AI Chat",
    description: "Conversation with Arash",
    component: ChatboxWindow,
    initialPosition: { x: 45, y: 8, scale: 0.8, depth: 0.5 },
    unlocked: true,
  },
  {
    id: "how-we-help",
    title: "How We Help",
    description: "24/7 Voice-Powered Customer Support",
    component: HowWeHelpWindow,
    initialPosition: { x: 35, y: 5, scale: 0.7, depth: 1 },
    unlocked: true,
  },
  {
    id: "how-to-use",
    title: "How to Use",
    description: "Simple Integration in 3 Steps",
    component: HowToUseWindow,
    initialPosition: { x: -25, y: -5, scale: 0.5, depth: 2 },
    unlocked: true,
  },
  {
    id: "features",
    title: "Features",
    description: "Advanced AI Conversation Capabilities",
    component: FeaturesWindow,
    initialPosition: { x: 20, y: -12, scale: 0.35, depth: 3 },
    unlocked: true,
  },
  {
    id: "pricing",
    title: "Pricing Plans",
    description: "Flexible Solutions for Every Business",
    component: PricingWindow,
    initialPosition: { x: -12, y: -18, scale: 0.25, depth: 4 },
    unlocked: true,
  },
  {
    id: "get-started",
    title: "Get Started",
    description: "WordPress Plugin & Custom Integration",
    component: GetStartedWindow,
    initialPosition: { x: 8, y: -22, scale: 0.18, depth: 5 },
    unlocked: true,
  },
  {
    id: "settings",
    title: "Settings",
    description: "Account & Preferences",
    component: SettingsWindow,
    initialPosition: { x: -30, y: -25, scale: 0.15, depth: 6 },
    unlocked: true,
    requiresAuth: true, // Only visible to logged-in users
  },
  {
    id: "support",
    title: "Customer Support",
    description: "24/7 Help & Documentation",
    component: ({ onContinue }) => (
      <div className="text-center p-8">
        <h2 className="text-3xl font-bold text-[#08075C] mb-6">Customer Support</h2>
        <p className="text-gray-700 mb-6">Get help when you need it most.</p>
        <button onClick={onContinue} className="bg-[#01ADEF] text-white px-6 py-2 rounded">
          Continue
        </button>
      </div>
    ),
    initialPosition: { x: 25, y: -28, scale: 0.12, depth: 7 },
    unlocked: true,
  },
  {
    id: "analytics",
    title: "Analytics Dashboard",
    description: "Track Performance & Insights",
    component: ({ onContinue }) => (
      <div className="text-center p-8">
        <h2 className="text-3xl font-bold text-[#08075C] mb-6">Analytics Dashboard</h2>
        <p className="text-gray-700 mb-6">Monitor your AI assistant's performance.</p>
        <button onClick={onContinue} className="bg-[#01ADEF] text-white px-6 py-2 rounded">
          Continue
        </button>
      </div>
    ),
    initialPosition: { x: -15, y: -31, scale: 0.1, depth: 8 },
    unlocked: true,
    requiresAuth: true, // Only visible to logged-in users
  },
]
