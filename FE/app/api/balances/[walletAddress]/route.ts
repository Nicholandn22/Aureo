import { NextRequest, NextResponse } from 'next/server';
import { getGoldBalance, getIDRXPending } from '@/lib/services/contractService';

export async function GET(
  req: NextRequest,
  { params }: { params: { walletAddress: string } }
) {
  try {
    const [goldBalance, idrxPending] = await Promise.all([
      getGoldBalance(params.walletAddress),
      getIDRXPending(params.walletAddress),
    ]);

    return NextResponse.json({
      success: true,
      balances: {
        gold: goldBalance,
        idrxPending,
      },
    });
  } catch (error) {
    console.error('Balances API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch balances' },
      { status: 500 }
    );
  }
}
