import { NextRequest, NextResponse } from 'next/server';
import { deposits } from '../../deposits/route';

export async function GET(
  req: NextRequest,
  { params }: { params: { walletAddress: string } }
) {
  try {
    const transactions = deposits
      .filter(
        (d) =>
          d.walletAddress === params.walletAddress.toLowerCase() &&
          d.status === 'completed'
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 50);

    return NextResponse.json({
      success: true,
      transactions: transactions.map((tx) => ({
        id: tx.depositId,
        type: 'smart_buy',
        amount: tx.amount,
        goldReceived: tx.goldReceived,
        txHash: tx.txHash,
        aiAnalysis: tx.aiAnalysis,
        timestamp: tx.createdAt,
      })),
    });
  } catch (error) {
    console.error('Transactions API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
