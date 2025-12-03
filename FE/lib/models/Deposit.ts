import mongoose from 'mongoose';

const DepositSchema = new mongoose.Schema({
  depositId: { type: String, required: true, unique: true },
  walletAddress: { type: String, required: true },
  amount: { type: Number, required: true },
  txHash: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'analyzing', 'completed', 'failed'],
    default: 'pending',
  },
  aiAnalysis: {
    action: { type: String, enum: ['BUY', 'WAIT'] },
    confidence: { type: Number },
    reasoning: { type: String },
    currentPrice: { type: Number },
    priceTarget: { type: Number },
    timestamp: { type: Date },
  },
  goldReceived: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Deposit = mongoose.models.Deposit || mongoose.model('Deposit', DepositSchema);
