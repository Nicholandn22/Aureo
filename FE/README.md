# AUREO - The Intelligent Gold Standard for Daily Payments

AUREO adalah dompet digital generasi baru yang menggabungkan stabilitas emas (RWA) dengan kecerdasan buatan (AI). Project ini dikembangkan untuk Hackathon 2025 di Mantle Testnet.

## 🌟 Fitur Utama

- **AI-Driven Smart Deposit**: AI menganalisis pasar dan membeli emas pada momentum terbaik
- **Spendable Gold**: Saldo dalam emas, tapi bisa langsung digunakan untuk transaksi harian
- **Invisible Web3**: UX yang familiar tanpa kompleksitas Web3
- **Privy Authentication**: Login dengan Google atau Wallet

## 🚀 Tech Stack

- **Frontend**: Next.js 16 + TypeScript
- **UI Components**: shadcn/ui + Tailwind CSS v4
- **Authentication**: Privy
- **Network**: Mantle Testnet / Base Testnet
- **Package Manager**: Bun

## 📦 Setup Instructions

### 1. Install Dependencies

```bash
bun install
```

### 2. Setup Environment Variables

Buat file `.env.local` dan isi dengan:

```env
# Privy Configuration (Get from https://dashboard.privy.io)
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id-here

# Network Configuration
NEXT_PUBLIC_CHAIN_ID=5003
NEXT_PUBLIC_RPC_URL=https://rpc.sepolia.mantle.xyz
```

### 3. Get Privy App ID

1. Kunjungi [Privy Dashboard](https://dashboard.privy.io)
2. Buat aplikasi baru
3. Copy App ID dan paste ke `.env.local`
4. Konfigurasi login methods: Email, Google, Wallet

### 4. Run Development Server

```bash
bun dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 📁 Struktur Project

```
fe/
├── app/
│   ├── dashboard/
│   │   └── page.tsx          # Dashboard page
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout with Privy
│   ├── page.tsx               # Landing page
│   └── providers.tsx          # Privy provider config
├── components/
│   ├── ui/                    # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── input.tsx
│   ├── dashboard.tsx          # Dashboard component
│   ├── deposit-dialog.tsx     # Deposit modal
│   ├── landing-page.tsx       # Landing page component
│   └── withdraw-dialog.tsx    # Withdraw modal
├── lib/
│   └── utils.ts               # Utility functions
└── public/                    # Static assets
```

## 🎨 Features Overview

### Landing Page
- Hero section dengan value proposition
- Fitur-fitur AUREO
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

