import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { mobile, otp } = await request.json();

    if (!mobile || !otp) {
      return NextResponse.json({ success: false, error: 'Mobile number and OTP are required.' }, { status: 400 });
    }

    // In a real application, you would validate the OTP.
    // For now, we'll accept any 6-digit OTP.
    if (otp.length === 6) {
      console.log(`Simulating OTP verification for: ${mobile} with OTP: ${otp}`);
      return NextResponse.json({ success: true, message: 'OTP verified successfully.' });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid OTP.' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json({ success: false, error: 'Server error verifying OTP.' }, { status: 500 });
  }
}
