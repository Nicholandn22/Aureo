'use client';

import { PrivyProvider } from '@privy-io/react-auth';

export function Providers({ children }: { children: React.ReactNode }) {
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!privyAppId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 p-8 max-w-md">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white text-2xl font-bold mx-auto">
            A
          </div>
          <h2 className="text-2xl font-bold">Configuration Required</h2>
          <p className="text-muted-foreground leading-relaxed">
            Please add your Privy App ID to <code className="px-2 py-1 bg-secondary rounded text-sm">.env.local</code>
          </p>
          <div className="bg-secondary/50 rounded-xl p-4 text-left">
            <code className="text-sm">
              NEXT_PUBLIC_PRIVY_APP_ID=your-app-id
            </code>
          </div>
          <p className="text-sm text-muted-foreground">
            Get your App ID from{' '}
            <a
              href="https://dashboard.privy.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-600 dark:text-amber-400 hover:underline"
            >
              dashboard.privy.io
            </a>
          </p>
        </div>
      </div>
    );
  }

  const mantleSepolia = {
    id: 5003,
    name: 'Mantle Sepolia Testnet',
    network: 'mantle-sepolia',
    nativeCurrency: {
      name: 'MNT',
      symbol: 'MNT',
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ['https://rpc.sepolia.mantle.xyz'],
      },
      public: {
        http: ['https://rpc.sepolia.mantle.xyz'],
      },
    },
    blockExplorers: {
      default: {
        name: 'Mantle Sepolia Explorer',
        url: 'https://explorer.sepolia.mantle.xyz',
      },
    },
    testnet: true,
  };

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        loginMethods: ['email', 'wallet', 'google'],
        appearance: {
          theme: 'light',
          accentColor: '#0066FF',
          logo: '/aureo-logo.png',
        },
        defaultChain: mantleSepolia,
        supportedChains: [mantleSepolia],
      }}
    >
      {children}
    </PrivyProvider>
  );
}
