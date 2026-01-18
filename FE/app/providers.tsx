"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { MANTLE_SEPOLIA } from "@/lib/types";
import React from "react";

// Mantle Sepolia chain configuration for Privy
const mantleSepolia = {
  id: MANTLE_SEPOLIA.chainId,
  name: MANTLE_SEPOLIA.name,
  network: "mantle-sepolia",
  nativeCurrency: MANTLE_SEPOLIA.nativeCurrency,
  rpcUrls: {
    default: {
      http: [MANTLE_SEPOLIA.rpcUrl],
    },
    public: {
      http: [MANTLE_SEPOLIA.rpcUrl],
    },
  },
  blockExplorers: {
    default: {
      name: "Mantle Sepolia Explorer",
      url: MANTLE_SEPOLIA.explorerUrl,
    },
  },
  testnet: true,
};

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
            Please add your Privy App ID to{" "}
            <code className="px-2 py-1 bg-secondary rounded text-sm">
              .env.local
            </code>
          </p>
          <div className="bg-secondary/50 rounded-xl p-4 text-left">
            <code className="text-sm">
              NEXT_PUBLIC_PRIVY_APP_ID=your-app-id
            </code>
          </div>
          <p className="text-sm text-muted-foreground">
            Get your App ID from{" "}
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

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        // Login methods - prioritize email for easy onboarding
        loginMethods: ["email", "wallet", "google"],

        // Appearance customization
        appearance: {
          theme: "light",
          accentColor: "#F59E0B", // Amber color to match Aureo branding
          logo: "/Aureo.png",
          showWalletLoginFirst: false, // Email first for better UX
        },

        // Chain configuration
        defaultChain: mantleSepolia,
        supportedChains: [mantleSepolia],

        // Embedded wallet configuration
        embeddedWallets: {
          // Create wallet on signup for seamless experience
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },

        // Legal information (optional)
        legal: {
          termsAndConditionsUrl: "/terms",
          privacyPolicyUrl: "/privacy",
        },
      }}
    >
      <React.Fragment key="privy-children">{children}</React.Fragment>
    </PrivyProvider>
  );
}
