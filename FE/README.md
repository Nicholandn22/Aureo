# AUREO - AI-Powered Gold Investment Platform

Minimalist DeFi platform for smart gold investments using AI market analysis. Built on Mantle Sepolia Testnet.

## 🌟 Key Features

- **AI Smart Entry**: AI analyzes market and buys gold at optimal moments
- **Real-time Analysis**: Uses Pyth Network prices + Gemini AI
- **Automated Trading**: Cron-based system monitors every 5 minutes
- **Web3 Auth**: Privy authentication with email/Google/wallet

## 🚀 Tech Stack

- **Frontend**: Next.js 16 + TypeScript + Tailwind CSS v4
- **Authentication**: Privy
- **Blockchain**: Mantle Sepolia Testnet, Ethers.js v6
- **Storage**: In-memory (perfect for hackathon demo)
- **AI**: Google Gemini for market analysis
- **Price Feeds**: Pyth Network (XAU/USD)
- **Package Manager**: npm

## 📦 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Create `.env.local`:

```env
# Frontend (Public)
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
NEXT_PUBLIC_RPC_URL=https://rpc.sepolia.mantle.xyz
NEXT_PUBLIC_AUREO_POOL_ADDRESS=your_contract_address

# Backend (Private)
GEMINI_API_KEY=your_gemini_api_key
CONTRACT_PRIVATE_KEY=your_backend_wallet_private_key
CRON_SECRET=hackathon-demo-secret
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
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🤖 AI Smart Entry Flow

1. **User deposits IDRX** → Creates pending deposit in memory
2. **Cron job runs** → Every 5 minutes via external service
3. **AI analyzes market**:
   - Fetches real-time gold price from Pyth Network
   - Analyzes 24h high/low, volatility, trends
   - Prompts Gemini AI for BUY/WAIT decision
4. **If BUY signal** (confidence ≥70%) → Executes smart contract swap
5. **User notified** → "Aureo AI bought gold at discount!"

## 📡 API Routes

All routes are built into Next.js API:

- `POST /api/deposits` - Create new deposit
- `GET /api/deposits/:depositId` - Check deposit status
- `GET /api/deposits/wallet/:address` - User's deposit history
- `GET /api/price` - Real-time gold price from Pyth
- `GET /api/balances/:address` - User's gold balance
- `GET /api/transactions/:address` - Transaction history
- `GET /api/cron/analyze` - Cron endpoint (protected with Bearer token)

## 🔄 Cron Setup

Since Vercel Hobby plan only allows daily cron, use external service:

**Option 1: cron-job.org**
1. Visit [cron-job.org](https://cron-job.org)
2. Create free account
3. Add new cron job:
   - **URL**: `https://your-domain.vercel.app/api/cron/analyze`
   - **Schedule**: Every 5 minutes
   - **Headers**: `Authorization: Bearer your_cron_secret`

**Option 2: EasyCron**
Same setup as above

## 📁 Project Structure

```
FE/
├── app/
│   ├── api/                   # Next.js API Routes
│   │   ├── balances/
│   │   ├── cron/
│   │   ├── deposits/
│   │   ├── price/
│   │   └── transactions/
│   ├── dashboard/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── providers.tsx
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── dashboard.tsx
│   ├── deposit-dialog.tsx
│   ├── landing-page.tsx
│   └── withdraw-dialog.tsx
├── lib/
│   ├── services/
│   │   ├── aiService.ts      # Gemini AI integration
│   │   ├── contractService.ts # Smart contract calls
│   │   └── pythService.ts    # Pyth price feeds
│   └── utils.ts
└── public/
```

## 🎨 Design System

**Color Palette:**
- Primary: Amber/Gold gradient (oklch values)
- Light mode: Warm whites, subtle shadows
- Dark mode: Deep blacks, amber accents

**Typography:**
- Sans: Inter variable font
- Minimalist, clean spacing

## 🚀 Deployment

### Deploy to Vercel

1. Push to GitHub
2. Import repo in Vercel
3. Add environment variables
4. Deploy

### Setup External Cron

After deployment, configure external cron service to call `/api/cron/analyze` every 5 minutes with authorization header.

## 📊 Smart Contract Integration

Backend wallet executes swaps on behalf of users:
- User deposits IDRX to smart contract
- IDRX marked as "pending" with AI monitoring
- When AI decides to BUY, backend calls `executeSmartBuy(userAddress, amount)`
- Gold credited to user's on-chain balance
- User can withdraw back to IDRX anytime

## 🧪 Testing

1. Get Mantle Sepolia testnet tokens from faucet
2. Login with Privy (email/Google)
3. Deposit IDRX
4. Wait 5 minutes for AI analysis
5. Check transaction history

## 📝 License

MIT

- User deposits IDRX to smart contract
- IDRX marked as "pending" with AI monitoring
- When AI decides to BUY, backend calls `executeSmartBuy(userAddress, amount)`
- Gold credited to user's on-chain balance
- User can withdraw back to IDRX anytime

## 🧪 Testing

1. Get Mantle Sepolia testnet tokens from faucet
2. Login with Privy (email/Google)
3. Deposit IDRX
4. Wait 5 minutes for AI analysis
5. Check transaction history

## 🌟 Features Overview

### Landing Page
- Hero section with amber gradient orbs
- Features showcase
- Privy authentication
- How it works
- CTA untuk login/signup

### Dashboard
- Saldo emas real-time
- Status AI Agent
- Pending funds monitoring
- Harga emas terkini
- Recent activity
- Deposit & Withdraw actions

### Deposit Flow
1. User input amount IDRX
2. Funds masuk ke pending
3. AI menganalisis market (simulasi 3 detik)
4. AI eksekusi pembelian emas
5. Balance ter-update

### Withdraw Flow
1. User input jumlah gram emas
2. System calculate IDRX equivalent
3. Instant conversion
4. Balance ter-update

## 🔧 Development

### Add New shadcn/ui Component

```bash
# Buat manual component di components/ui/
# Atau copy dari https://ui.shadcn.com/
```

### Customize Theme

Edit `app/globals.css` untuk mengubah color scheme.

## 🚢 Deployment

### Deploy to Vercel

```bash
vercel --prod
```

Jangan lupa set environment variables di Vercel dashboard.

## 📝 Next Steps (Backend Integration)

1. Integrate dengan Smart Contract (Vault, Token)
2. Connect ke Pyth Network untuk real price feed
3. Setup Gemini API untuk AI analysis
4. Implement Web3 wallet connection
5. Add transaction history dari blockchain

## 🤝 Contributing

Project ini dikembangkan untuk Hackathon. Feel free to fork dan modify sesuai kebutuhan.

## 📄 License

MIT License - Hackathon 2025

---

Built with ❤️ for Aureo Hacks

