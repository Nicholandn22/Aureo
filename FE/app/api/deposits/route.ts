import { NextRequest, NextResponse } from 'next/server';

interface Deposit {
  depositId: string;
  walletAddress: string;
  amount: number;
  txHash: string;
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
  aiAnalysis?: {
    action: 'BUY' | 'WAIT';
    confidence: number;
    reasoning: string;
    currentPrice: number;
    priceTarget: number;
    timestamp: Date;
  };
  goldReceived?: number;
  createdAt: Date;
}

const deposits: Deposit[] = [];

export async function POST(req: NextRequest) {
  try {
    const { walletAddress, amount, txHash } = await req.json();

    if (!walletAddress || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const depositId = `DEP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const deposit: Deposit = {
      depositId,
      walletAddress: walletAddress.toLowerCase(),
      amount,
      txHash: txHash || '',
      status: 'pending',
      createdAt: new Date(),
    };

    deposits.push(deposit);

    return NextResponse.json({
      success: true,
      depositId: deposit.depositId,
      status: deposit.status,
      message: 'Deposit received. AI is analyzing the market for optimal entry...',
    });
  } catch (error) {
    console.error('Deposit API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process deposit' },
      { status: 500 }
    );
  }
}

export { deposits };
