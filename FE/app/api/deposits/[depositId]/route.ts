import { NextRequest, NextResponse } from 'next/server';
import { deposits } from '../route';

export async function GET(
  req: NextRequest,
  { params }: { params: { depositId: string } }
) {
  try {
    const deposit = deposits.find((d) => d.depositId === params.depositId);

    if (!deposit) {
      return NextResponse.json(
        { error: 'Deposit not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      depositId: deposit.depositId,
      amount: deposit.amount,
      status: deposit.status,
      aiAnalysis: deposit.aiAnalysis,
      goldReceived: deposit.goldReceived,
      txHash: deposit.txHash,
      createdAt: deposit.createdAt,
    });
  } catch (error) {
    console.error('Get Deposit Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deposit' },
      { status: 500 }
    );
  }
}
