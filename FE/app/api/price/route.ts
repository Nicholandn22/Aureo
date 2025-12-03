import { NextResponse } from 'next/server';
import { getPythGoldPrice } from '@/lib/services/pythService';

export async function GET() {
  try {
    const priceData = await getPythGoldPrice();

    return NextResponse.json({
      success: true,
      price: priceData,
    });
  } catch (error) {
    console.error('Price API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gold price' },
      { status: 500 }
    );
  }
}
