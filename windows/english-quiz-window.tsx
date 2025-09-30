"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Upload, Play, Pause, Volume2, Gauge, Trophy, Clock, CheckCircle, XCircle, Music } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { quizManager, type VocabularyItem, type QuizMistake } from "@/utils/quiz-manager"
import { audioManager } from "@/utils/audio-manager"
import { timerManager } from "@/utils/timer-manager"

interface QuizWindowProps {
  onContinue?: () => void
  jsonFilePath?: string
}

export function EnglishQuizWindow({ onContinue, jsonFilePath }: QuizWindowProps) {
  const [vocabularyData, setVocabularyData] = useState<VocabularyItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [score, setScore] = useState(0)
  const [isQuizStarted, setIsQuizStarted] = useState(false)
  const [isQuizFinished, setIsQuizFinished] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [totalTime, setTotalTime] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [speed, setSpeed] = useState(1.0)
  const [musicVolume, setMusicVolume] = useState(0.5)
  const [isPlaying, setIsPlaying] = useState(false)
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null)
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>([])
  const [mistakes, setMistakes] = useState<QuizMistake[]>([])
  const [quizName, setQuizName] = useState("Vocabulary Quiz")

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const json = JSON.parse(text)
      const validatedData = quizManager.validateVocabularyData(json)
      setVocabularyData(validatedData)
      setAnsweredQuestions(new Array(validatedData.length).fill(false))
      setQuizName(file.name.replace(".json", ""))
    } catch (error) {
      console.error("Error loading quiz:", error)
      alert("Failed to load quiz file. Please check the JSON format.")
    }
  }

  const startQuiz = () => {
    if (vocabularyData.length === 0) {
      alert("Please upload a vocabulary file first.")
      return
    }

    const duration = timerManager.calculateDuration(vocabularyData.length)
    setTotalTime(duration)
    setTimeRemaining(duration)
    setIsQuizStarted(true)

    timerManager.startTimer(duration, (time) => {
      setTimeRemaining(time)
      if (time === 0) {
        finishQuiz()
      }
    })
    audioManager.setBackgroundVolume(musicVolume)
    audioManager.startBackgroundMusic()
  }

  const finishQuiz = () => {
    setIsQuizFinished(true)
    timerManager.stopTimer()
    audioManager.stopBackgroundMusic()
    audioManager.stopSpeech()

    // Save quiz history
    const timeSpent = totalTime - timeRemaining
    quizManager.saveQuizHistory({
      date: new Date().toISOString(),
      score,
      totalQuestions: vocabularyData.length,
      timeSpent,
      mistakes,
      quizName,
    })
  }

  const playExample = () => {
    if (!vocabularyData[currentIndex]) return

    const currentVocab = vocabularyData[currentIndex]
    const textToRead = currentVocab.example.replace("______", "blank")

    setIsPlaying(true)
    audioManager.speak(textToRead, volume, speed, () => {
      setIsPlaying(false)
    })
  }

  const stopAudio = () => {
    audioManager.stopSpeech()
    setIsPlaying(false)
  }

  const checkAnswer = () => {
    if (!userAnswer.trim()) {
      alert("Please enter an answer.")
      return
    }

    const currentVocab = vocabularyData[currentIndex]
    const isCorrect = quizManager.checkAnswer(userAnswer, currentVocab.word)

    setFeedback(isCorrect ? "correct" : "incorrect")

    if (isCorrect) {
      setScore(score + 1)
    } else {
      // Track mistake
      setMistakes([
        ...mistakes,
        {
          word: currentVocab.word,
          userAnswer: userAnswer.trim(),
          correctAnswer: currentVocab.word,
          definition: currentVocab.definition,
          example: currentVocab.example,
        },
      ])
    }

    const newAnswered = [...answeredQuestions]
    newAnswered[currentIndex] = true
    setAnsweredQuestions(newAnswered)

    setTimeout(() => {
      setFeedback(null)
      setUserAnswer("")
      if (currentIndex < vocabularyData.length - 1) {
        setCurrentIndex(currentIndex + 1)
      } else {
        finishQuiz()
      }
    }, 1500)
  }

  useEffect(() => {
    return () => {
      timerManager.stopTimer()
      audioManager.stopBackgroundMusic()
      audioManager.stopSpeech()
    }
  }, [])

  useEffect(() => {
    if (jsonFilePath) {
      loadQuizFromPath(jsonFilePath)
    }
  }, [jsonFilePath])

  const loadQuizFromPath = async (path: string) => {
    try {
      if (path.startsWith("quiz-")) {
        const storedData = localStorage.getItem(path)
        if (storedData) {
          const json = JSON.parse(storedData)
          const validatedData = quizManager.validateVocabularyData(json)
          setVocabularyData(validatedData)
          setAnsweredQuestions(new Array(validatedData.length).fill(false))
          setQuizName(path.replace("quiz-", ""))
          return
        }
      }

      const response = await fetch(path)
      const json = await response.json()
      const validatedData = quizManager.validateVocabularyData(json)
      setVocabularyData(validatedData)
      setAnsweredQuestions(new Array(validatedData.length).fill(false))
      setQuizName(path.split("/").pop()?.replace(".json", "") || "Vocabulary Quiz")
    } catch (error) {
      console.error("Error loading quiz:", error)
      alert("Failed to load quiz file. Please upload manually.")
    }
  }

  const currentVocab = vocabularyData[currentIndex]
  const progress = vocabularyData.length > 0 ? ((currentIndex + 1) / vocabularyData.length) * 100 : 0

  const handleMusicVolumeChange = (newVolume: number) => {
    setMusicVolume(newVolume)
    audioManager.setBackgroundVolume(newVolume)
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-[#08075C] mb-6 text-center">English Vocabulary Quiz</h2>

      {!isQuizStarted && !isQuizFinished && (
        <div className="space-y-6">
          <div className="border-2 border-dashed border-[#01ADEF] rounded-lg p-8 text-center">
            <Upload className="mx-auto mb-4 text-[#01ADEF]" size={48} />
            <Label htmlFor="file-upload" className="cursor-pointer">
              <span className="text-[#08075C] font-semibold">Upload Vocabulary JSON File</span>
              <Input id="file-upload" type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </Label>
            {vocabularyData.length > 0 && (
              <p className="text-green-600 mt-4 font-semibold">✓ {vocabularyData.length} vocabulary items loaded</p>
            )}
          </div>

          {vocabularyData.length > 0 && (
            <div className="space-y-2">
              <div className="text-center text-sm text-gray-600">
                Time: {Math.floor(timerManager.calculateDuration(vocabularyData.length) / 60)} minutes{" "}
                {timerManager.calculateDuration(vocabularyData.length) % 60} seconds
              </div>
              <Button onClick={startQuiz} className="w-full bg-[#01ADEF] hover:bg-[#0194D1] text-white py-6 text-lg">
                Start Quiz
              </Button>
            </div>
          )}
        </div>
      )}

      {isQuizStarted && !isQuizFinished && currentVocab && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-gradient-to-r from-[#08075C] to-[#01ADEF] text-white p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock size={24} />
              <span className="text-2xl font-bold">
                {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, "0")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy size={24} />
              <span className="text-2xl font-bold">
                {score} / {vocabularyData.length}
              </span>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-[#01ADEF] h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="bg-white border-2 border-[#01ADEF] rounded-lg p-6 shadow-lg">
            <div className="mb-4">
              <span className="text-sm text-gray-500">
                Question {currentIndex + 1} of {vocabularyData.length}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-[#08075C] mb-2">Definition:</h3>
                <p className="text-gray-700 leading-relaxed">{currentVocab.definition}</p>
              </div>

              <div>
                <h3 className="font-semibold text-[#08075C] mb-2">Persian Meaning:</h3>
                <p className="text-gray-700 leading-relaxed">{currentVocab.Persian}</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700 text-center">
                  🎧 Click "Play Example" to hear the example sentence
                </p>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <Button
                onClick={isPlaying ? stopAudio : playExample}
                className="flex-1 bg-[#01ADEF] hover:bg-[#0194D1] text-white"
              >
                {isPlaying ? <Pause className="mr-2" size={20} /> : <Play className="mr-2" size={20} />}
                {isPlaying ? "Stop" : "Play Example"}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Volume2 size={16} />
                  Volume: {Math.round(volume * 100)}%
                </Label>
                <Input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(Number.parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Gauge size={16} />
                  Speed: {speed.toFixed(1)}x
                </Label>
                <Input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={speed}
                  onChange={(e) => setSpeed(Number.parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            <div className="mt-4">
              <Label className="flex items-center gap-2 mb-2">
                <Music size={16} />
                Background Music: {Math.round(musicVolume * 100)}%
              </Label>
              <Input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={musicVolume}
                onChange={(e) => handleMusicVolumeChange(Number.parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="answer" className="text-[#08075C] font-semibold mb-2 block">
                Your Answer:
              </Label>
              <Input
                id="answer"
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && checkAnswer()}
                placeholder="Type the vocabulary word here..."
                className="text-lg p-4"
                disabled={feedback !== null}
                autoComplete="off"
              />
            </div>

            {feedback && (
              <div
                className={`flex items-center gap-2 p-4 rounded-lg ${
                  feedback === "correct" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                {feedback === "correct" ? (
                  <>
                    <CheckCircle size={24} />
                    <span className="font-semibold">Correct! The answer is: {currentVocab.word}</span>
                  </>
                ) : (
                  <>
                    <XCircle size={24} />
                    <span className="font-semibold">Incorrect. The correct answer is: {currentVocab.word}</span>
                  </>
                )}
              </div>
            )}

            <Button
              onClick={checkAnswer}
              disabled={feedback !== null}
              className="w-full bg-[#01ADEF] hover:bg-[#0194D1] text-white py-4 text-lg"
            >
              Submit Answer
            </Button>
          </div>
        </div>
      )}

      {isQuizFinished && (
        <div className="space-y-6">
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-gradient-to-br from-[#01ADEF] to-[#08075C] rounded-full flex items-center justify-center mx-auto">
              <Trophy className="text-white" size={48} />
            </div>

            <h3 className="text-3xl font-bold text-[#08075C]">Quiz Completed!</h3>

            <div className="bg-gradient-to-r from-[#08075C] to-[#01ADEF] text-white p-8 rounded-lg">
              <p className="text-5xl font-bold mb-2">
                {score} / {vocabularyData.length}
              </p>
              <p className="text-xl">{Math.round((score / vocabularyData.length) * 100)}% Correct</p>
              <p className="text-sm mt-2">
                Time spent: {Math.floor((totalTime - timeRemaining) / 60)}:
                {((totalTime - timeRemaining) % 60).toString().padStart(2, "0")}
              </p>
            </div>
          </div>

          {mistakes.length > 0 && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
              <h4 className="text-xl font-bold text-red-700 mb-4 flex items-center gap-2">
                <XCircle size={24} />
                Your Mistakes ({mistakes.length})
              </h4>
              <div className="space-y-4">
                {mistakes.map((mistake, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border border-red-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-red-600">Your answer: {mistake.userAnswer}</p>
                        <p className="font-semibold text-green-600">Correct answer: {mistake.correctAnswer}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <span className="font-semibold">Definition:</span> {mistake.definition}
                      </p>
                      <p>
                        <span className="font-semibold">Example:</span> {mistake.example}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Button
              onClick={() => {
                setIsQuizStarted(false)
                setIsQuizFinished(false)
                setCurrentIndex(0)
                setScore(0)
                setUserAnswer("")
                setMistakes([])
                setAnsweredQuestions(new Array(vocabularyData.length).fill(false))
              }}
              className="w-full bg-[#01ADEF] hover:bg-[#0194D1] text-white py-4"
            >
              Try Again
            </Button>
            {onContinue && (
              <Button onClick={onContinue} variant="outline" className="w-full py-4 bg-transparent">
                Continue
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
