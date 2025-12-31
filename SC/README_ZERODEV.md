# Aureo ZeroDev Integration - Quick Start Guide

## 🚀 Quick Start

This guide will get you up and running with the Aureo ZeroDev Smart Account integration in under 10 minutes.

### Prerequisites

- Node.js >= 18.x
- npm or yarn
- A Privy account ([Sign up here](https://dashboard.privy.io))
- A ZeroDev account ([Sign up here](https://dashboard.zerodev.app))

---

## 📋 Step-by-Step Setup

### 1. Get Your API Keys

#### Privy App ID:
1. Go to [dashboard.privy.io](https://dashboard.privy.io)
2. Create a new app
3. Copy your **App ID**

#### ZeroDev Project ID:
1. Go to [dashboard.zerodev.app](https://dashboard.zerodev.app)
2. Create a new project
3. Select **Mantle Sepolia** as the network
4. Copy your **Project ID**
5. Enable **Paymaster** for gasless transactions
6. Note your Bundler and Paymaster RPC URLs

---

### 2. Install Dependencies

#### Frontend:
```bash
cd frontend
npm install
```

#### Backend:
```bash
cd backend
npm install
```

---

### 3. Configure Environment Variables

#### Frontend `.env.local`:
```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local`:
```ini
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here
NEXT_PUBLIC_ZERODEV_PROJECT_ID=your_zerodev_project_id_here
NEXT_PUBLIC_ZERODEV_BUNDLER_RPC=https://rpc.zerodev.app/api/v2/bundler/your_project_id
NEXT_PUBLIC_ZERODEV_PAYMASTER_RPC=https://rpc.zerodev.app/api/v2/paymaster/your_project_id
```

#### Backend `.env`:
```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```ini
ZERODEV_PROJECT_ID=your_zerodev_project_id_here
ZERODEV_BUNDLER_RPC=https://rpc.zerodev.app/api/v2/bundler/your_project_id
ZERODEV_PAYMASTER_RPC=https://rpc.zerodev.app/api/v2/paymaster/your_project_id
```

---

### 4. Run the Application

Open **two terminals**:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

---

### 5. Test the Flow

1. Open [http://localhost:3000](http://localhost:3000)
2. Click **"Login with Privy"**
3. Sign in with Google/Twitter/Email
4. Your Smart Account will be created automatically
5. Click **"Enable AI Trading"**
6. Sign the transaction to create a session key
7. Done! The AI Agent can now execute trades

---

## 🧪 Testing on Mantle Sepolia

### Get Test Tokens

1. **Get MNT (for deploying contracts):**
   - Visit [Mantle Sepolia Faucet](https://faucet.sepolia.mantle.xyz/)
   - Enter your smart account address
   - Request testnet MNT

2. **Get Mock USDC (for trading):**
   ```bash
   # Using cast (from Foundry)
   cast send 0x53b8e9e6513A2e7A4d23F8F9BFe3F5985C9788e4 \
     "mint(address,uint256)" \
     YOUR_SMART_ACCOUNT_ADDRESS \
     1000000000 \
     --rpc-url https://rpc.sepolia.mantle.xyz \
     --private-key YOUR_PRIVATE_KEY
   ```

### Run the AI Agent

```bash
cd backend

# Edit .env and add:
# SESSION_KEY_EXAMPLE=<session_key_from_frontend>
# SMART_ACCOUNT_ADDRESS=<your_smart_account_address>

npm run agent
```

---

## 📖 Project Structure

```
├── frontend/              # Next.js app with Privy + ZeroDev
│   ├── app/              # Pages and layouts
│   ├── components/       # React components
│   ├── lib/              # ZeroDev setup logic
│   └── config/           # Constants and ABIs
│
├── backend/              # Node.js API + AI Agent
│   └── src/
│       ├── index.ts      # Express API
│       └── AIAgentExecutor.ts  # AI trading logic
│
├── ZERODEV_INTEGRATION.md      # Full documentation
├── SESSION_KEY_SECURITY.md     # Security guide
└── README_ZERODEV.md           # This file
```

---

## 🔧 Common Issues

### "Session key creation failed"

**Fix:** Check that:
- Privy App ID is correct
- ZeroDev Project ID is correct
- You're connected to Mantle Sepolia (Chain ID: 5003)

### "Transaction reverted"

**Fix:** Ensure:
- Your smart account has USDC balance
- Session key hasn't expired
- Paymaster is enabled in ZeroDev dashboard

### "CORS error"

**Fix:** Make sure backend is running on port 3001

---

## 🎯 Next Steps

1. **Read the Docs:**
   - [ZERODEV_INTEGRATION.md](./ZERODEV_INTEGRATION.md) - Full setup guide
   - [SESSION_KEY_SECURITY.md](./SESSION_KEY_SECURITY.md) - Security model

2. **Customize AI Logic:**
   - Edit `backend/src/AIAgentExecutor.ts`
   - Implement your trading strategy in `monitorAndTrade()`

3. **Deploy to Production:**
   - Use a proper database for session keys
   - Add authentication to backend API
   - Implement rate limiting
   - Use environment-specific configs

---

## 🛠 Development Commands

### Frontend:
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run linter
```

### Backend:
```bash
npm run dev      # Start dev server with hot reload
npm run build    # Compile TypeScript
npm run start    # Start production server
npm run agent    # Run AI Agent demo
```

---

## 📚 Resources

- [ZeroDev Documentation](https://docs.zerodev.app/)
- [Privy Documentation](https://docs.privy.io/)
- [Mantle Documentation](https://docs.mantle.xyz/)
- [Aureo Smart Contracts](../README.md)

---

## 🤝 Support

If you encounter issues:
1. Check the [troubleshooting section](#-common-issues)
2. Read the [full documentation](./ZERODEV_INTEGRATION.md)
3. Open an issue on GitHub

---

**Happy Building! 🚀**
