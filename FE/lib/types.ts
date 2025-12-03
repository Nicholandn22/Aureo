export interface TokenBalance {
  gold: number;
  idrx: number;
  idrxPending: number;
}

export interface AIAnalysis {
  action: 'BUY' | 'WAIT';
  confidence: number;
  reasoning: string;
  currentPrice: number;
  priceTarget: number;
  timestamp: string;
}

export interface DepositRequest {
  walletAddress: string;
  amount: number;
  currency: 'IDRX';
}

export interface DepositResponse {
  depositId: string;
  status: 'pending' | 'analyzing' | 'completed';
  aiAnalysis?: AIAnalysis;
  estimatedGoldAmount: number;
}

export interface SwapRequest {
  depositId: string;
  fromToken: 'IDRX';
  toToken: 'GOLD';
  amount: number;
}

export interface SwapResponse {
  txHash: string;
  goldReceived: number;
  executionPrice: number;
  timestamp: string;
}

export interface PriceData {
  price: number;
  high24h: number;
  low24h: number;
  change24h: number;
  volatility: number;
  timestamp: string;
}
