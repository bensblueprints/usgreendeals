import { NextRequest, NextResponse } from 'next/server';
import { addSubscriber, syncToKlaviyo, syncToGHL } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const { email, zipCode } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Add subscriber with zip code
    const subscriber = await addSubscriber(email, 'landing', zipCode);

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Failed to subscribe' },
        { status: 500 }
      );
    }

    // Attempt to sync to Klaviyo and GHL (non-blocking)
    Promise.all([
      syncToKlaviyo(subscriber).catch(console.error),
      syncToGHL(subscriber).catch(console.error),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed!',
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}
