import { GoogleGenerativeAI } from '@google/generative-ai';
import { getPythGoldPrice } from './pythService';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function analyzeGoldMarket(depositAmount: number) {
  const priceData = await getPythGoldPrice();

  const prompt = `You are AUREO AI, an expert gold trading analyst. Analyze the current gold market and decide whether to BUY gold NOW or WAIT for a better entry point.

CURRENT MARKET DATA:
- Current Gold Price (XAU/USD): $${priceData.currentPrice.toFixed(2)}
- 24h High: $${priceData.high24h.toFixed(2)}
- 24h Low: $${priceData.low24h.toFixed(2)}
- 24h Change: ${priceData.change24h.toFixed(2)}%
- Market Volatility: ${priceData.volatility.toFixed(2)}%
- EMA Price: $${priceData.emaPrice.toFixed(2)}
- Deposit Amount: ${depositAmount} IDRX

DECISION CRITERIA:
1. BUY if:
   - Price is near 24h low (within 0.5% of low)
   - Price dropped >1% from EMA (dip opportunity)
   - Volatility is high (>0.3%) indicating potential reversal
   - Strong buying signals in short-term trend

2. WAIT if:
   - Price is near 24h high
   - Price is trending upward without pullback
   - Volatility is low and no clear entry advantage
   - Better entry point expected within next 5-10 minutes

Respond ONLY in this JSON format:
{
  "action": "BUY" or "WAIT",
  "confidence": 0-100,
  "reasoning": "Brief 1-2 sentence explanation",
  "currentPrice": ${priceData.currentPrice},
  "priceTarget": estimated_optimal_entry_price
}`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }

    const analysis = JSON.parse(jsonMatch[0]);
    return analysis;
  } catch (error) {
    console.error('AI Analysis Error:', error);
    
    const fallbackDecision = priceData.currentPrice < priceData.emaPrice * 0.995 ? 'BUY' : 'WAIT';
    return {
      action: fallbackDecision,
      confidence: 60,
      reasoning: 'Fallback: Price-based decision due to AI service unavailability',
      currentPrice: priceData.currentPrice,
      priceTarget: priceData.low24h,
    };
  }
}
