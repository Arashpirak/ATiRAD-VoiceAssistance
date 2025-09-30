// Timer Manager - Handles countdown timer logic

class TimerManager {
  private intervalId: NodeJS.Timeout | null = null
  private timeRemaining = 0
  private onTickCallback: ((time: number) => void) | null = null

  /**
   * Calculates timer duration based on vocabulary count
   * Formula: 30 seconds + (15 seconds × number of vocabularies)
   */
  calculateDuration(vocabularyCount: number): number {
    return 30 + vocabularyCount * 15
  }

  /**
   * Starts countdown timer
   * @param durationInSeconds - Total duration in seconds
   * @param onTick - Callback function called every second with remaining time
   */
  startTimer(durationInSeconds: number, onTick: (time: number) => void): void {
    this.stopTimer()

    this.timeRemaining = durationInSeconds
    this.onTickCallback = onTick

    if (this.onTickCallback) {
      this.onTickCallback(this.timeRemaining)
    }

    this.intervalId = setInterval(() => {
      this.timeRemaining -= 1

      if (this.onTickCallback) {
        this.onTickCallback(this.timeRemaining)
      }

      if (this.timeRemaining <= 0) {
        this.stopTimer()
      }
    }, 1000)
  }

  /**
   * Stops the timer
   */
  stopTimer(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  /**
   * Gets current remaining time
   */
  getTimeRemaining(): number {
    return this.timeRemaining
  }

  /**
   * Formats time as MM:SS
   */
  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  /**
   * Checks if time is running low (less than 1 minute)
   */
  isTimeLow(): boolean {
    return this.timeRemaining < 60
  }

  /**
   * Checks if time is critical (less than 30 seconds)
   */
  isTimeCritical(): boolean {
    return this.timeRemaining < 30
  }
}

export const timerManager = new TimerManager()
