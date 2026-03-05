import { NextRequest, NextResponse } from 'next/server';
import { recordDealImpression, recordDealClick } from '@/lib/storage';
import crypto from 'crypto';

// Hash IP for privacy
function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip + process.env.ADMIN_PASSWORD).digest('hex').substring(0, 16);
}

export async function POST(request: NextRequest) {
  try {
    const { dealId, type } = await request.json();

    if (!dealId || !type) {
      return NextResponse.json({ error: 'Missing dealId or type' }, { status: 400 });
    }

    if (!['impression', 'click'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    // Get client info for analytics
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown';
    const ipHash = hashIP(ip);
    const userAgent = request.headers.get('user-agent') || undefined;
    const referrer = request.headers.get('referer') || undefined;

    if (type === 'impression') {
      await recordDealImpression(dealId, ipHash, userAgent, referrer);
    } else {
      await recordDealClick(dealId, ipHash, userAgent, referrer);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Deal tracking error:', error);
    return NextResponse.json({ error: 'Tracking failed' }, { status: 500 });
  }
}

// Batch track impressions for multiple deals at once
export async function PUT(request: NextRequest) {
  try {
    const { dealIds } = await request.json();

    if (!dealIds || !Array.isArray(dealIds)) {
      return NextResponse.json({ error: 'Missing dealIds array' }, { status: 400 });
    }

    // Get client info for analytics
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown';
    const ipHash = hashIP(ip);
    const userAgent = request.headers.get('user-agent') || undefined;
    const referrer = request.headers.get('referer') || undefined;

    // Record impressions for all deals
    await Promise.all(
      dealIds.map(dealId => recordDealImpression(dealId, ipHash, userAgent, referrer))
    );

    return NextResponse.json({ success: true, tracked: dealIds.length });
  } catch (error) {
    console.error('Batch deal tracking error:', error);
    return NextResponse.json({ error: 'Tracking failed' }, { status: 500 });
  }
}
