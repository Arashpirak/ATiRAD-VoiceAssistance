"use client"

import type React from "react"
import { useState } from "react"
import { Chrome, Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SignInWindowProps {
  onContinue?: () => void
}

export function SignInWindow({ onContinue }: SignInWindowProps) {
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState("")

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password: string) => {
    return password.length >= 6
  }

  async function handleEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setEmailError("")
    setPasswordError("")

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address")
      return
    }

    if (!validatePassword(password)) {
      setPasswordError("Password must be at least 6 characters long")
      return
    }

    if (isSignUp && password !== confirmPassword) {
      setPasswordError("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setIsSignedIn(true)

      // Store login status
      localStorage.setItem("isLoggedIn", "true")

      // Dispatch custom event for same-tab updates
      window.dispatchEvent(new Event("loginStatusChanged"))
    } catch (error) {
      setEmailError("Authentication failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setEmail("user@gmail.com")
      setIsSignedIn(true)

      // Store login status
      localStorage.setItem("isLoggedIn", "true")

      // Dispatch custom event for same-tab updates
      window.dispatchEvent(new Event("loginStatusChanged"))
    } catch (error) {
      setEmailError("Google sign-in failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  async function handlePasswordReset() {
    if (!validateEmail(resetEmail)) {
      return
    }

    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      alert("Password reset link sent to your email!")
      setShowForgotPassword(false)
      setResetEmail("")
    } catch (error) {
      alert("Failed to send reset email. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="text-center p-8 max-w-md mx-auto">
      <h2 className="text-3xl font-bold text-[#08075C] mb-6">Welcome!</h2>

      {!isSignedIn ? (
        <div className="space-y-6">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                !isSignUp ? "bg-white text-[#08075C] shadow-sm" : "text-gray-600 hover:text-[#08075C]"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                isSignUp ? "bg-white text-[#08075C] shadow-sm" : "text-gray-600 hover:text-[#08075C]"
              }`}
            >
              Sign Up
            </button>
          </div>

          <Button
            onClick={handleGoogleSignIn}
            variant="outline"
            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3 bg-transparent"
            disabled={isLoading}
          >
            <Chrome className="mr-2" size={18} />
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-left block text-[#08075C] font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                required
              />
              {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-left block text-[#08075C] font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-left block text-[#08075C] font-medium">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full"
                  required
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-[#01ADEF] hover:bg-[#0194D1] text-white py-3"
              disabled={isLoading || !email || !password}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSignUp ? "Creating Account..." : "Signing In..."}
                </>
              ) : isSignUp ? (
                "Create Account"
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {!isSignUp && (
            <div className="text-center">
              <button
                onClick={() => setShowForgotPassword(true)}
                className="text-[#01ADEF] hover:text-[#0194D1] text-sm font-medium"
              >
                Forgot your password?
              </button>
            </div>
          )}

          {showForgotPassword && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold text-[#08075C] mb-4">Reset Password</h3>
                <p className="text-gray-600 mb-4">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="mb-4"
                />
                <div className="flex gap-3">
                  <Button
                    onClick={handlePasswordReset}
                    className="flex-1 bg-[#01ADEF] hover:bg-[#0194D1] text-white"
                    disabled={!resetEmail || isLoading}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Reset Link"}
                  </Button>
                  <Button onClick={() => setShowForgotPassword(false)} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="text-green-600 text-2xl">✓</div>
          </div>
          <div className="text-green-600 text-xl font-semibold">Welcome back!</div>
          <p className="text-[#08075C]">Successfully signed in as {email}</p>
          <Button onClick={onContinue} className="bg-[#01ADEF] hover:bg-[#0194D1] text-white px-8 py-3">
            Continue Your Journey
          </Button>
        </div>
      )}
    </div>
  )
}
