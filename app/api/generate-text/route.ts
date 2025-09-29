import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // This is a placeholder. In a real application, you would use an LLM.
    // For now, we'll return a static, friendly response.
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ success: false, error: 'No prompt provided.' }, { status: 400 });
    }

    // Simulate AI response
    const aiResponse = `You said: "${prompt}" - Thank you for your message! This is a simulated AI response.`;

    return NextResponse.json({ success: true, response: aiResponse });
  } catch (error) {
    console.error('Error generating text:', error);
    return NextResponse.json({ success: false, error: 'Server error generating text.' }, { status: 500 });
  }
}
