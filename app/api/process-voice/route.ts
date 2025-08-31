import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.AIzaSyDjZzs6Gzo__dxCTjIvY3LpdAW4jfZTTV8!)

async function audioToText(audioBuffer: Buffer) {
  const audioBase64 = audioBuffer.toString("base64")
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

  const audio = {
    inlineData: {
      mimeType: "audio/webm",
      data: audioBase64,
    },
  }

  const result = await model.generateContent([
    "Please transcribe this audio.",
    audio,
  ])
  const response = result.response
  const text = response.text()
  return text
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File

    if (!audioFile) {
      return NextResponse.json({
        success: false,
        error: "No audio file provided",
      })
    }

    const audioBuffer = Buffer.from(await audioFile.arrayBuffer())
    const transcribedText = await audioToText(audioBuffer)

    return NextResponse.json({
      success: true,
      response: transcribedText,
      audioLength: audioBuffer.byteLength,
    })
  } catch (error) {
    console.error("Error processing voice:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to process audio",
    })
  }
}
