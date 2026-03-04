import { NextRequest, NextResponse } from 'next/server';
import { getDeals, getActiveDeals, saveDeal, deleteDeal } from '@/lib/storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    const deals = activeOnly ? await getActiveDeals() : await getDeals();

    return NextResponse.json(deals);
  } catch (error) {
    console.error('Get deals error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin auth
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const deal = await request.json();
    const saved = await saveDeal(deal);

    if (!saved) {
      return NextResponse.json(
        { error: 'Failed to save deal' },
        { status: 500 }
      );
    }

    return NextResponse.json(saved);
  } catch (error) {
    console.error('Save deal error:', error);
    return NextResponse.json(
      { error: 'Failed to save deal' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check admin auth
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Deal ID required' },
        { status: 400 }
      );
    }

    await deleteDeal(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete deal error:', error);
    return NextResponse.json(
      { error: 'Failed to delete deal' },
      { status: 500 }
    );
  }
}
