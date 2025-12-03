const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export class AureoAPI {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  static async getTokenBalances(walletAddress: string) {
    return this.request<{
      gold: number;
      idrx: number;
      idrxPending: number;
    }>(`/balances/${walletAddress}`);
  }

  static async getGoldPrice() {
    return this.request<{
      price: number;
      high24h: number;
      low24h: number;
      change24h: number;
      volatility: number;
      timestamp: string;
    }>('/price/gold');
  }

  static async createDeposit(data: {
    walletAddress: string;
    amount: number;
    currency: 'IDRX';
  }) {
    return this.request<{
      depositId: string;
      status: 'pending' | 'analyzing' | 'completed';
      estimatedGoldAmount: number;
    }>('/deposits', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getDepositStatus(depositId: string) {
    return this.request<{
      depositId: string;
      status: 'pending' | 'analyzing' | 'completed';
      aiAnalysis?: {
        action: 'BUY' | 'WAIT';
        confidence: number;
        reasoning: string;
        currentPrice: number;
        priceTarget: number;
        timestamp: string;
      };
      goldReceived?: number;
      txHash?: string;
    }>(`/deposits/${depositId}`);
  }

  static async requestWithdraw(data: {
    walletAddress: string;
    goldAmount: number;
  }) {
    return this.request<{
      txHash: string;
      idrxReceived: number;
      executionPrice: number;
      timestamp: string;
    }>('/withdrawals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getAIAnalysis(depositId: string) {
    return this.request<{
      action: 'BUY' | 'WAIT';
      confidence: number;
      reasoning: string;
      currentPrice: number;
      priceTarget: number;
      timestamp: string;
    }>(`/ai/analyze/${depositId}`);
  }

  static async getTransactionHistory(walletAddress: string) {
    return this.request<
      Array<{
        id: string;
        type: 'deposit' | 'withdraw' | 'ai_buy';
        amount: number;
        currency: string;
        status: string;
        timestamp: string;
        txHash?: string;
      }>
    >(`/transactions/${walletAddress}`);
  }
}
