"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Rocket, BookOpen, Upload } from "lucide-react"
import { useState } from "react"

export default function HomePage() {
  const [uploadStatus, setUploadStatus] = useState<string>("")

  const handleQuizUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploadStatus("Loading quiz...")

      const text = await file.text()
      const quizData = JSON.parse(text)

      // Validate quiz data structure
      if (!Array.isArray(quizData) || quizData.length === 0) {
        setUploadStatus("Invalid quiz format. Please check your JSON file.")
        return
      }

      // Store in localStorage with unique ID
      const quizId = `quiz-${Date.now()}`
      localStorage.setItem(quizId, JSON.stringify(quizData))

      setUploadStatus("Quiz loaded! Opening...")
      setTimeout(() => {
        window.open(`/pathway?quiz=${quizId}`, "_blank")
        setUploadStatus("")
      }, 500)
    } catch (error) {
      console.error("Error uploading quiz:", error)
      setUploadStatus("Failed to load quiz. Please check your JSON file format.")
      setTimeout(() => setUploadStatus(""), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#08075C] via-[#01ADEF] to-[#08075C] flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4">Welcome to Your Universe</h1>
          <p className="text-xl text-white/80">Explore the galaxy or test your English vocabulary</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Galaxy Explorer Card */}
          <Link href="/page">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border-2 border-white/20 hover:border-[#01ADEF] transition-all duration-300 hover:scale-105 cursor-pointer group">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center group-hover:animate-pulse">
                  <Rocket size={40} className="text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white">Galaxy Explorer</h2>
                <p className="text-white/80 leading-relaxed">
                  Navigate through infinite space, discover customer sites, and explore deeper levels with portals and
                  treasures
                </p>
                <Button className="bg-[#01ADEF] hover:bg-[#0194D1] text-white px-8 py-3 text-lg">
                  Start Exploring
                </Button>
              </div>
            </div>
          </Link>

          {/* English Quiz Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border-2 border-white/20 hover:border-[#ffd700] transition-all duration-300 hover:scale-105">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
                <BookOpen size={40} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">English Quiz</h2>
              <p className="text-white/80 leading-relaxed">
                Upload your vocabulary JSON file and test your English skills with interactive quizzes
              </p>

              <div className="space-y-4 w-full">
                <Link href="/pathway?quiz=/quizzes/barrons-unit1.json">
                  <Button className="w-full bg-[#ffd700] hover:bg-[#ffed4e] text-[#08075C] px-8 py-3 text-lg font-bold">
                    Try Sample Quiz
                  </Button>
                </Link>

                <div className="relative">
                  <input type="file" accept=".json" onChange={handleQuizUpload} className="hidden" id="quiz-upload" />
                  <label htmlFor="quiz-upload">
                    <Button
                      className="w-full bg-white/20 hover:bg-white/30 text-white border-2 border-white/40 px-8 py-3 text-lg"
                      asChild
                    >
                      <span className="flex items-center justify-center gap-2">
                        <Upload size={20} />
                        Upload Your Quiz
                      </span>
                    </Button>
                  </label>
                </div>

                {uploadStatus && <p className="text-white text-sm animate-pulse">{uploadStatus}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h3 className="text-2xl font-bold text-white mb-4">How It Works</h3>
          <div className="grid md:grid-cols-2 gap-6 text-white/90">
            <div>
              <h4 className="font-bold text-[#01ADEF] mb-2">Galaxy Explorer:</h4>
              <ul className="space-y-2 text-sm leading-relaxed">
                <li>• Click icons to visit customer websites or take quizzes</li>
                <li>• Click portals (⚡) to discover deeper content</li>
                <li>• Use "Explore More" to travel to new levels</li>
                <li>• Previous and upper levels visible in distance</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[#ffd700] mb-2">English Quiz:</h4>
              <ul className="space-y-2 text-sm leading-relaxed">
                <li>• Upload JSON with vocabulary data</li>
                <li>• Listen to examples with text-to-speech</li>
                <li>• Type correct spelling to earn points</li>
                <li>• 5-minute timer with background music</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
