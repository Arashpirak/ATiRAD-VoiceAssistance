// Audio Manager - Handles text-to-speech, volume, speed, and background music

class AudioManager {
  private currentUtterance: SpeechSynthesisUtterance | null = null
  private backgroundAudio: AudioContext | null = null
  private musicGainNode: GainNode | null = null
  private musicSource: OscillatorNode | null = null
  private isBackgroundPlaying = false

  constructor() {
    if (typeof window !== "undefined") {
      this.createBackgroundMusic()
    }
  }

  private createBackgroundMusic(): void {
    this.backgroundAudio = new AudioContext()
    this.musicGainNode = this.backgroundAudio.createGain()
    this.musicGainNode.gain.value = 0.15 // Subtle background volume
    this.musicGainNode.connect(this.backgroundAudio.destination)
  }

  private playMelodyLoop(): void {
    if (!this.backgroundAudio || !this.musicGainNode) return

    const now = this.backgroundAudio.currentTime
    const tempo = 0.4 // Slower, calming tempo

    // Gentle melody notes (C major scale with peaceful progression)
    const melody = [
      { freq: 523.25, duration: tempo }, // C5
      { freq: 587.33, duration: tempo }, // D5
      { freq: 659.25, duration: tempo }, // E5
      { freq: 523.25, duration: tempo }, // C5
      { freq: 659.25, duration: tempo }, // E5
      { freq: 783.99, duration: tempo * 2 }, // G5 (longer)
      { freq: 659.25, duration: tempo }, // E5
      { freq: 587.33, duration: tempo }, // D5
      { freq: 523.25, duration: tempo * 2 }, // C5 (longer)
    ]

    let time = now
    melody.forEach((note) => {
      const osc = this.backgroundAudio!.createOscillator()
      const noteGain = this.backgroundAudio!.createGain()

      osc.type = "sine" // Soft sine wave for gentle sound
      osc.frequency.value = note.freq

      // Smooth envelope for each note
      noteGain.gain.setValueAtTime(0, time)
      noteGain.gain.linearRampToValueAtTime(0.3, time + 0.05)
      noteGain.gain.linearRampToValueAtTime(0.2, time + note.duration - 0.1)
      noteGain.gain.linearRampToValueAtTime(0, time + note.duration)

      osc.connect(noteGain)
      noteGain.connect(this.musicGainNode!)

      osc.start(time)
      osc.stop(time + note.duration)

      time += note.duration
    })

    // Loop the melody
    if (this.isBackgroundPlaying) {
      const totalDuration = melody.reduce((sum, note) => sum + note.duration, 0)
      setTimeout(() => this.playMelodyLoop(), totalDuration * 1000)
    }
  }

  /**
   * Speaks text with specified volume and speed
   */
  speak(text: string, volume: number, speed: number, onEnd?: () => void): void {
    this.stopSpeech()

    this.currentUtterance = new SpeechSynthesisUtterance(text)
    this.currentUtterance.volume = volume
    this.currentUtterance.rate = speed
    this.currentUtterance.pitch = 1

    if (onEnd) {
      this.currentUtterance.onend = onEnd
    }

    speechSynthesis.speak(this.currentUtterance)
  }

  /**
   * Stops current speech
   */
  stopSpeech(): void {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel()
    }
    this.currentUtterance = null
  }

  /**
   * Starts background music with looping
   */
  startBackgroundMusic(): void {
    if (this.backgroundAudio && this.backgroundAudio.state === "suspended") {
      this.backgroundAudio.resume()
    }
    this.isBackgroundPlaying = true
    this.playMelodyLoop()
  }

  /**
   * Stops background music
   */
  stopBackgroundMusic(): void {
    this.isBackgroundPlaying = false
    if (this.musicSource) {
      this.musicSource.stop()
      this.musicSource = null
    }
  }

  /**
   * Sets background music volume
   */
  setBackgroundVolume(volume: number): void {
    if (this.musicGainNode) {
      this.musicGainNode.gain.value = Math.max(0, Math.min(1, volume)) * 0.15
    }
  }

  /**
   * Cleanup all audio resources
   */
  cleanup(): void {
    this.stopSpeech()
    this.stopBackgroundMusic()
    if (this.backgroundAudio) {
      this.backgroundAudio.close()
      this.backgroundAudio = null
    }
  }
}

export const audioManager = new AudioManager()
