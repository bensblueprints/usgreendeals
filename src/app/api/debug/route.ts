import { NextRequest, NextResponse } from 'next/server';
import { getSettings } from '@/lib/storage';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await getSettings();

    // Mask API keys for security
    return NextResponse.json({
      klaviyo_api_key: settings.klaviyo_api_key ? `${settings.klaviyo_api_key.substring(0, 10)}...` : 'NOT SET',
      klaviyo_list_id: settings.klaviyo_list_id || 'NOT SET',
      ghl_api_key: settings.ghl_api_key ? `${settings.ghl_api_key.substring(0, 10)}...` : 'NOT SET',
      ghl_location_id: settings.ghl_location_id || 'NOT SET',
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
