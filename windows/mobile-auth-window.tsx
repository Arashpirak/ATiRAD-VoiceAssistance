"use client"

import type React from "react"
import { useState } from "react"
import { Loader2, Phone, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface MobileAuthWindowProps {
  onContinue?: () => void
}

export function MobileAuthWindow({ onContinue }: MobileAuthWindowProps) {
  const [step, setStep] = useState(1) // 1: ورود شماره, 2: ورود OTP
  const [mobile, setMobile] = useState("")
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const validateMobile = (mobile: string) => {
    const mobileRegex = /^09\d{9}$/ // فرمت ایرانی: ۰۹xxxxxxxxx
    return mobileRegex.test(mobile)
  }

  const handleSendOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")

    if (!validateMobile(mobile)) {
      setError("شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد.")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      })
      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || "خطا در ارسال کد")
      }
      setStep(2) // برو به مرحله OTP
    } catch (err) {
      setError((err as Error).message || "خطا در ارسال کد. لطفاً دوباره امتحان کنید.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")

    if (otp.length !== 6) { // فرض ۶ رقمی
      setError("کد OTP باید ۶ رقم باشد.")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, otp }),
      })
      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || "کد نامعتبر")
      }
      setSuccess(true)
      localStorage.setItem("isMobileAuthenticated", "true") // ذخیره وضعیت
      if (onContinue) onContinue() // اگر نیاز به ناوبری باشد
    } catch (err) {
      setError((err as Error).message || "خطا در تأیید کد. لطفاً دوباره امتحان کنید.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center p-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="text-green-600" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-[#08075C] mb-4">احراز هویت موفق!</h2>
        <p className="text-gray-700 mb-6">شماره موبایل شما تأیید شد.</p>
        <Button onClick={onContinue} className="bg-[#01ADEF] hover:bg-[#0194D1] text-white px-6 py-2 rounded">
          ادامه
        </Button>
      </div>
    )
  }

  return (
    <div className="text-center p-8 max-w-md mx-auto">
      <h2 className="text-3xl font-bold text-[#08075C] mb-6">احراز هویت با موبایل</h2>
      <p className="text-gray-700 mb-6">برای امنیت بیشتر، شماره موبایل خود را وارد کنید.</p>

      {step === 1 ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mobile" className="text-left block text-[#08075C] font-medium">
              شماره موبایل
            </Label>
            <div className="relative">
              <Input
                id="mobile"
                type="tel"
                placeholder="۰۹xxxxxxxxx"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full pr-10"
                required
              />
              <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
          <Button
            type="submit"
            className="w-full bg-[#01ADEF] hover:bg-[#0194D1] text-white py-3"
            disabled={isLoading || !mobile}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "ارسال کد OTP"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp" className="text-left block text-[#08075C] font-medium">
              کد OTP دریافتی
            </Label>
            <Input
              id="otp"
              type="text"
              placeholder="۶ رقم کد"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="w-full"
              required
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
          <Button
            type="submit"
            className="w-full bg-[#01ADEF] hover:bg-[#0194D1] text-white py-3"
            disabled={isLoading || !otp}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "تأیید کد"}
          </Button>
          <Button variant="ghost" onClick={() => setStep(1)} className="w-full text-[#01ADEF]">
            بازگشت به ورود شماره
          </Button>
        </form>
      )}
    </div>
  )
}
