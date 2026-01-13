# AUREO - AI-Powered Gold Investment Platform

Minimalist fintech platform for smart gold investments using AI market analysis. Built on Mantle Sepolia Testnet with **x402 Protocol** for pay-per-use AI agent execution.

## 🌟 Key Features

- **AI Smart Entry**: AI analyzes market and buys gold at optimal moments
- **x402 Protocol**: Pay-per-use micropayments for AI execution ($0.01-0.05 USDC)
- **Mobile-First Design**: Fintech-grade UI with bottom navigation
- **Real-time Analysis**: Uses Pyth Network prices + Gemini AI
- **Instant Pay**: Scan QR or transfer USDC to any EVM wallet
- **Web3 Auth**: Privy authentication with email/Google/wallet

## 🔥 x402 Protocol Integration

AUREO implements the x402 payment protocol for AI agent execution:

### How it Works

1. **User requests AI analysis** → Client sends request to protected endpoint
2. **Server returns 402** → Payment requirement with USDC amount
3. **User signs EIP-3009** → Creates transferWithAuthorization signature
4. **Client retries with payment** → X-PAYMENT header with signed auth
5. **Server validates & executes** → Collects payment, runs AI, returns result

### Pricing

| Service             | Price      | Description                        |
| ------------------- | ---------- | ---------------------------------- |
| Market Analysis     | $0.01 USDC | AI-powered buy/wait recommendation |
| Smart Buy Execution | $0.05 USDC | AI executes optimal gold purchase  |
| Premium Analysis    | $0.02 USDC | Detailed multi-indicator analysis  |

### x402 Endpoints

```
POST /api/x402/analyze    - AI market analysis (protected)
POST /api/x402/smart-buy  - AI smart buy execution (protected)
```

## 🚀 Tech Stack

- **Frontend**: Next.js 16 + TypeScript + Tailwind CSS v4
- **Authentication**: Privy
- **Blockchain**: Mantle Sepolia Testnet, Ethers.js v6
- **Payment Protocol**: x402 with EIP-3009 (USDC)
- **AI**: Google Gemini for market analysis
- **Price Feeds**: Pyth Network (XAU/USD)
- **Design**: Mobile-first, light theme, bottom navigation

## 📦 Setup Instructions

### 1. Install Dependencies

```bash
pnpm install
# or
npm install
```

### 2. Setup Environment Variables

Create `.env.local`:

```env
# ===========================================
# PRIVY AUTHENTICATION
# ===========================================
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id

# ===========================================
# BLOCKCHAIN CONFIGURATION (Mantle Sepolia)
# ===========================================
NEXT_PUBLIC_RPC_URL=https://rpc.sepolia.mantle.xyz
NEXT_PUBLIC_CHAIN_ID=5003

# ===========================================
# SMART CONTRACT ADDRESSES (Mantle Sepolia)
# ===========================================
NEXT_PUBLIC_AUREO_POOL_ADDRESS=0x475F5c184D23D5839123e7CDB23273eF0470C018
NEXT_PUBLIC_USDC_ADDRESS=0x53b8e9e6513A2e7A4d23F8F9BFe3F5985C9788e4
NEXT_PUBLIC_GOLD_TOKEN_ADDRESS=0x6830999D9173B235dF6ac8c9068c4235fd58f532

# ===========================================
# x402 PROTOCOL CONFIGURATION
# ===========================================
NEXT_PUBLIC_X402_PAYEE=0xYourPayeeAddressHere

# Server-side only
X402_SERVICE_PRIVATE_KEY=your_service_wallet_private_key
AI_AGENT_PRIVATE_KEY=your_ai_agent_wallet_private_key

# ===========================================
# AI CONFIGURATION
# ===========================================
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Get Required API Keys

**Privy App ID:**

1. Visit [Privy Dashboard](https://dashboard.privy.io)
2. Create new app
3. Enable Email, Google, Wallet login

**Gemini API Key:**

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create API key

### 4. Run Development Server

```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🤖 AI Smart Entry Flow with x402

1. **User deposits USDC** → Initiates deposit in wallet
2. **AI Analysis (x402)** → User pays $0.01 USDC for analysis
3. **AI analyzes market**:
   - Fetches real-time gold price from Pyth Network
   - Analyzes 24h high/low, volatility, trends
   - Prompts Gemini AI for BUY/WAIT decision
4. **Smart Buy (x402)** → If BUY signal, user pays $0.05 USDC
5. **AI executes swap** → Optimal gold purchase executed
6. **User notified** → "AI bought gold at optimal price!"

## 📁 Project Structure

```
FE/
├── app/
│   ├── api/
│   │   ├── x402/               # x402 protected endpoints
│   │   │   ├── analyze/        # AI analysis endpoint
│   │   │   └── smart-buy/      # Smart buy execution
│   │   ├── balances/
│   │   ├── cron/
│   │   ├── deposits/
│   │   └── price/
│   ├── dashboard/
│   │   ├── page.tsx            # Main dashboard
│   │   ├── pay/                # Pay/Transfer page
│   │   ├── history/            # Transaction history
│   │   ├── cards/              # Virtual cards
│   │   └── profile/            # User profile
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── providers.tsx
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── mobile-layout.tsx       # Mobile container
│   ├── bottom-navigation.tsx   # Bottom nav bar
│   ├── wallet-card.tsx         # Bank-like card
│   ├── quick-actions.tsx       # Action buttons
│   ├── x402-payment-dialog.tsx # Payment confirmation
│   └── ...
├── lib/
│   ├── x402/                   # x402 protocol implementation
│   │   ├── config.ts           # Configuration & types
│   │   ├── client.ts           # Client-side payment
│   │   ├── middleware.ts       # Server-side validation
│   │   └── index.ts
│   └── services/
│       ├── aiService.ts
│       ├── contractService.ts
│       └── pythService.ts
└── public/
```

## 🎨 Design System

**Mobile-First Fintech Design:**

- Bottom navigation with prominent center Pay button
- Bank-style wallet cards with balance
- Light theme as default
- Clean, professional typography

**Color Palette:**

- Primary: Blue (#0066FF)
- Accent: Amber/Gold
- Background: Clean white
- Dark mode support

## 📡 API Routes

### Public Routes

- `GET /api/price/gold` - Real-time gold price
- `GET /api/balances/:address` - User balances
- `GET /api/transactions/:address` - Transaction history

### x402 Protected Routes

- `POST /api/x402/analyze` - AI market analysis ($0.01)
- `POST /api/x402/smart-buy` - Smart buy execution ($0.05)

## 🔒 x402 Payment Flow

```typescript
// Client-side payment request
const result = await x402Client.requestWithPayment(
  "/api/x402/analyze",
  { method: "POST", body: JSON.stringify({ amount: 100 }) },
  async (requirement) => {
    // Show payment dialog
    return await showPaymentConfirmation(requirement);
  }
);
```

## 🚀 Deployment

### Deploy to Vercel

1. Push to GitHub
2. Import repo in Vercel
3. Add environment variables
4. Deploy

### Required Environment Variables for Production

- `NEXT_PUBLIC_PRIVY_APP_ID`
- `NEXT_PUBLIC_X402_PAYEE`
- `X402_SERVICE_PRIVATE_KEY`
- `AI_AGENT_PRIVATE_KEY`
- `GEMINI_API_KEY`

## 📝 License

MIT License - Built for Hackathon 2026

---

Built with ❤️ using x402 Protocol on Mantle
