import { NextRequest, NextResponse } from 'next/server';
import { deposits } from '../../deposits/route';
import { analyzeGoldMarket } from '@/lib/services/aiService';
import { executeSmartBuy } from '@/lib/services/contractService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'hackathon-demo-secret';

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const pendingDeposits = deposits.filter(
      (d) => d.status === 'pending' || d.status === 'analyzing'
    );

    if (pendingDeposits.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending deposits to analyze',
        processed: 0,
      });
    }

    const results = [];

    for (const deposit of pendingDeposits) {
      try {
        deposit.status = 'analyzing';

        const aiDecision = await analyzeGoldMarket(deposit.amount);

        deposit.aiAnalysis = {
          action: aiDecision.action,
          confidence: aiDecision.confidence,
          reasoning: aiDecision.reasoning,
          currentPrice: aiDecision.currentPrice,
          priceTarget: aiDecision.priceTarget,
          timestamp: new Date(),
        };

        if (aiDecision.action === 'BUY' && aiDecision.confidence >= 70) {
          const result = await executeSmartBuy(
            deposit.walletAddress,
            deposit.amount
          );

          deposit.status = 'completed';
          deposit.goldReceived = result.goldReceived;
          deposit.txHash = result.txHash;

          results.push({
            depositId: deposit.depositId,
            action: 'BUY_EXECUTED',
            goldReceived: result.goldReceived,
          });
        } else {
          results.push({
            depositId: deposit.depositId,
            action: 'WAITING',
            reasoning: aiDecision.reasoning,
          });
        }
      } catch (error) {
        console.error(`Error processing deposit ${deposit.depositId}:`, error);
        deposit.status = 'failed';

        results.push({
          depositId: deposit.depositId,
          action: 'FAILED',
          error: String(error),
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error('Cron Job Error:', error);
    return NextResponse.json(
      { error: 'Cron job failed' },
      { status: 500 }
    );
  }
}
