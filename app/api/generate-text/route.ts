import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({
        success: false,
        error: "No prompt provided",
      })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" })
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({
      success: true,
      response: text,
    })
  } catch (error) {
    console.error("Error generating text:", error)
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({
      success: false,
      error: "Failed to generate text: " + errorMessage,
    })
  }
}
