// Quiz Manager - Handles quiz logic, validation, and scoring

interface VocabularyItem {
  word: string
  definition: string
  example: string
  Persian: string
}

interface QuizMistake {
  word: string
  userAnswer: string
  correctAnswer: string
  definition: string
  example: string
}

interface QuizHistory {
  date: string
  score: number
  totalQuestions: number
  timeSpent: number
  mistakes: QuizMistake[]
  quizName: string
}

class QuizManager {
  /**
   * Validates vocabulary data from uploaded JSON
   */
  validateVocabularyData(data: any[]): VocabularyItem[] {
    if (!Array.isArray(data)) {
      throw new Error("Invalid data format: expected an array")
    }

    return data.map((item, index) => {
      if (!item.word || !item.definition || !item.example || !item.Persian) {
        throw new Error(`Invalid vocabulary item at index ${index}: missing required fields`)
      }

      return {
        word: item.word.trim(),
        definition: item.definition.trim(),
        example: item.example.trim(),
        Persian: item.Persian.trim(),
      }
    })
  }

  /**
   * Checks if user's answer matches the correct word
   * Case-insensitive comparison with trimmed whitespace
   */
  checkAnswer(userAnswer: string, correctWord: string): boolean {
    const normalizedUserAnswer = userAnswer.trim().toLowerCase()
    const normalizedCorrectWord = correctWord.trim().toLowerCase()

    return normalizedUserAnswer === normalizedCorrectWord
  }

  /**
   * Calculates final score percentage
   */
  calculateScore(correctAnswers: number, totalQuestions: number): number {
    if (totalQuestions === 0) return 0
    return Math.round((correctAnswers / totalQuestions) * 100)
  }

  /**
   * Generates performance feedback based on score
   */
  getPerformanceFeedback(scorePercentage: number): string {
    if (scorePercentage >= 90) return "Excellent! Outstanding performance!"
    if (scorePercentage >= 80) return "Great job! Very good understanding!"
    if (scorePercentage >= 70) return "Good work! Keep practicing!"
    if (scorePercentage >= 60) return "Fair performance. Review the material."
    return "Keep studying! Practice makes perfect!"
  }

  /**
   * Saves quiz result to user's history
   */
  saveQuizHistory(history: QuizHistory): void {
    if (typeof window === "undefined") return

    const existingHistory = this.getQuizHistory()
    existingHistory.push(history)

    // Keep only last 50 quiz attempts
    const limitedHistory = existingHistory.slice(-50)

    localStorage.setItem("quiz-history", JSON.stringify(limitedHistory))
  }

  /**
   * Retrieves user's quiz history
   */
  getQuizHistory(): QuizHistory[] {
    if (typeof window === "undefined") return []

    const stored = localStorage.getItem("quiz-history")
    if (!stored) return []

    try {
      return JSON.parse(stored)
    } catch {
      return []
    }
  }

  /**
   * Clears quiz history
   */
  clearQuizHistory(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem("quiz-history")
  }
}

export const quizManager = new QuizManager()
export type { VocabularyItem, QuizMistake, QuizHistory }
