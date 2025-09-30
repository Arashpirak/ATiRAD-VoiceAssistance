import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { mobile } = await request.json();

    if (!mobile) {
      return NextResponse.json({ success: false, error: 'Mobile number is required.' }, { status: 400 });
    }

    // In a real application, you would integrate with an SMS gateway to send an OTP.
    // For now, we'll simulate a successful response.
    console.log(`Simulating OTP sent to: ${mobile}`);

    return NextResponse.json({ success: true, message: 'OTP sent successfully.' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json({ success: false, error: 'Server error sending OTP.' }, { status: 500 });
  }
}
