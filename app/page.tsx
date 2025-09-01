"use client";

import { useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars, OrbitControls } from "@react-three/drei";
import { Mic, Users, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { StarWarsChat } from "@/components/star-wars-chat";
import { conversationStore, type ChatMessage } from "@/utils/conversation-store";

type RecordingState =
  | "idle"
  | "requesting-permission"
  | "ready"
  | "recording"
  | "processing"
  | "waiting-llm"
  | "generating-voice"
  | "playing-response";

export default function VoiceAssistant() {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [progress, setProgress] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [aiVolumeLevel, setAiVolumeLevel] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>(conversationStore.getMessages());
  const [showChat, setShowChat] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isRecordingRef = useRef(false);

  // Subscribe to conversation updates
  useEffect(() => {
    const unsubscribe = conversationStore.subscribe((newMessages) => {
      setMessages(newMessages);
      if (newMessages.length > 0) {
        setShowChat(true);
      }
    });

    // Check if there are existing messages
    const existingMessages = conversationStore.getMessages();
    if (existingMessages.length > 0) {
      setShowChat(true);
    }

    return unsubscribe;
  }, []);

  // Request permissions and play intro
  useEffect(() => {
    const initializeApp = async () => {
      setRecordingState("requesting-permission");

      try {
        // Request microphone permission
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        // Setup audio context for visualization
        audioContextRef.current = new AudioContext();
        const source = audioContextRef.current.createMediaStreamSource(stream);
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        source.connect(analyserRef.current);

        // Start continuous volume monitoring
        startVolumeMonitoring();

        setRecordingState("ready");
        setPermissionsGranted(true);
      } catch (error) {
        console.error("Permission denied or error:", error);
        setRecordingState("idle");
        setPermissionsGranted(false);
      }
    };

    initializeApp();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const startVolumeMonitoring = () => {
    const updateVolume = () => {
      if (analyserRef.current) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setVolumeLevel(Math.min(1, average / 128));
      }
      animationFrameRef.current = requestAnimationFrame(updateVolume);
    };
    animationFrameRef.current = requestAnimationFrame(updateVolume);
  };

  const startRecording = () => {
    if (recordingState !== "ready" || !streamRef.current) return;

    setRecordingState("recording");
    setProgress(0);
    setIsListening(false);
    audioChunksRef.current = [];

    const mediaRecorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.start(250);

    mediaRecorder.ondataavailable = (e) => {
      audioChunksRef.current.push(e.data);
      if (e.data.size > 0) {
        processVoiceActivity(e.data);
      }
    };

    mediaRecorder.onstop = processAudio;

    // Progress timer (max 30 seconds)
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          stopRecording();
          return 100;
        }
        return prev + 100 / 300;
      });
    }, 100);

    isRecordingRef.current = true;
  };

  const stopRecording = () => {
    if (recordingState !== "recording" || !mediaRecorderRef.current) return;

    mediaRecorderRef.current.stop();
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    setRecordingState("processing");
    isRecordingRef.current = false;
  };

  const processVoiceActivity = async (blob: Blob) => {
    if (!isListening && audioChunksRef.current.length > 2) {
      setIsListening(true);
    }
  };

  const processAudio = async () => {
    setRecordingState("processing");

    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
    const formData = new FormData();
    formData.append("audio", audioBlob);

    try {
      setRecordingState("waiting-llm");
      const response = await fetch("/api/process-voice", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        // Add the user's transcribed message to the chat
        conversationStore.addMessage(data.response, "user");

        // Get AI response
        setIsTyping(true);
        const textResponse = await fetch("/api/generate-text", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: data.response }),
        });
        const textData = await textResponse.json();

        if (textData.success) {
          conversationStore.addMessage(textData.response, "ai");
        } else {
          // Display the detailed error from the API for better debugging
          const errorMessage = textData.error || "Sorry, I couldn't generate a response.";
          conversationStore.addMessage(errorMessage, "ai");
        }
        setIsTyping(false);
        setRecordingState("generating-voice");

        // Simulate generating and playing audio response
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setRecordingState("playing-response");
        await new Promise((resolve) => setTimeout(resolve, 3000));

        setRecordingState("ready");
      } else {
        setIsTyping(true);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        conversationStore.addMessage("Sorry, I couldn't process that. Please try again.", "ai");
        setIsTyping(false);
        setRecordingState("ready");
      }
    } catch (error) {
      console.error("Error:", error);
      setIsTyping(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      conversationStore.addMessage("An error occurred. Please try again.", "ai");
      setIsTyping(false);
      setRecordingState("ready");
    }
  };

  const generateVolumeWaves = () => {
    const waves = [];
    for (let i = 0; i < 5; i++) {
      const height = Math.max(8, Math.min(64, volumeLevel * 64 * (i + 1) / 5));
      waves.push(
        <div
          key={i}
          className="w-1 bg-[#01ADEF] rounded-full mx-0.5 transition-all duration-100"
          style={{ height: `${height}px` }}
        />
      );
    }
    return waves;
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-[#08075C] via-[#01ADEF] to-[#96d3eb] relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Canvas>
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            enableRotate={true}
            autoRotate={true}
            autoRotateSpeed={0.2}
          />
        </Canvas>
      </div>
      <div className="relative z-10 w-full h-full max-w-6xl mx-auto flex flex-col items-center justify-center p-8">
        {/* Top Left Controls */}
        <div className="absolute top-8 left-8 flex items-center gap-4 pointer-events-auto">
          <Link href="/customers">
            <Button className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm flex items-center gap-2">
              <Users size={16} />
              Our Customers
            </Button>
          </Link>
          <Button
            onClick={() => setIsMuted(!isMuted)}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 rounded-full backdrop-blur-sm"
          >
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </Button>
        </div>

        {/* Sign In Button - Top Right */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-auto">
          <Link href="/pathway">
            <Button className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm">
              Sign In
            </Button>
          </Link>
        </div>

        {/* Main Content */}
        <div className="text-center max-w-3xl pointer-events-none">
          <h1 className="text-5xl font-bold text-[#08075C] mb-4 drop-shadow-lg">
            Arash AI Voice Assistant
          </h1>
          <p className="text-xl text-[#08075C] mb-8 drop-shadow-md">
            Intelligent voice-powered support for your website
          </p>
        </div>

        {/* Chat or Instructions */}
        {showChat ? (
          <div className="mb-6">
            <StarWarsChat messages={messages} isTyping={isTyping} />
          </div>
        ) : (
          <div className="bg-gradient-to-r from-[#01ADEF]/10 to-[#08075C]/10 rounded-2xl p-6 border border-[#01ADEF]/20">
            <p className="text-[#08075C] font-bold text-lg mb-4">How to Use Arash</p>
            <ul className="space-y-2 text-[#08075C] text-sm">
              <li>Hold the microphone button to speak</li>
              <li>Ask questions about our services</li>
              <li>Request a demo or pricing info</li>
            </ul>
          </div>
        )}

        {/* Status Indicator */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 pointer-events-none">
          {recordingState !== "ready" && recordingState !== "idle" && (
            <p className="text-white text-sm bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full">
              {recordingState === "recording" && "Recording..."}
              {recordingState === "processing" && "Processing audio..."}
              {recordingState === "waiting-llm" && "Waiting for response..."}
              {recordingState === "generating-voice" && "Generating voice..."}
              {recordingState === "playing-response" && "Playing response..."}
            </p>
          )}
        </div>

        {/* Processing Progress */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-64 pointer-events-none">
          {recordingState === "recording" && (
            <div className="bg-white/20 backdrop-blur-sm rounded-full h-2">
              <div
                className="bg-[#01ADEF] h-2 rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Mic Button with Volume Visualization - Bottom Right */}
        <div className="absolute bottom-8 right-8 flex items-center gap-4 pointer-events-auto">
          <div className="flex items-end h-16 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 flex-row px-7">
            {generateVolumeWaves()}
          </div>
          <div className="flex flex-col items-center">
            <div className="mb-2">
              <span className="text-white text-sm font-medium bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full">
                Hold to speak
              </span>
            </div>
            <div className="relative">
              {(recordingState === "recording" || recordingState === "playing-response") && (
                <>
                  <div className="absolute inset-0 rounded-full bg-[#01ADEF]/30 animate-ping" />
                  <div className="absolute inset-0 rounded-full bg-white/20 animate-ping animation-delay-75" />
                </>
              )}
              {isListening && recordingState === "recording" && (
                <div className="absolute inset-0 rounded-full bg-green-400/40 animate-pulse" />
              )}
              <button
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onMouseLeave={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                disabled={recordingState !== "ready"}
                className={`
                relative w-20 h-20 rounded-full flex items-center justify-center
                transition-all duration-200 transform shadow-2xl border-3
                ${
                  recordingState === "ready"
                    ? "bg-white border-[#01ADEF] text-[#01ADEF] hover:bg-[#01ADEF] hover:text-white hover:scale-105 cursor-pointer"
                    : "bg-gray-300 border-gray-400 text-gray-500 cursor-not-allowed"
                }
                ${recordingState === "recording" ? "scale-110 bg-red-500 border-red-400 text-white" : ""}
              `}
              >
                <Mic size={32} />
                {recordingState === "recording" && (
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle cx="50%" cy="50%" r="35" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                    <circle
                      cx="50%"
                      cy="50%"
                      r="35"
                      fill="none"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 35}`}
                      strokeDashoffset={`${2 * Math.PI * 35 * (1 - progress / 100)}`}
                      className="transition-all duration-100"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
          <p className="text-white/80 text-sm drop-shadow-lg">
            Perfect for websites, WordPress plugins, and custom integrations
          </p>
        </div>
      </div>
    </div>
  );
}
