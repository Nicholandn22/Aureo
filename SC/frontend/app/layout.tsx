import type { Metadata } from "next";
import { PrivyProvider } from "@privy-io/react-auth";
import "./globals.css";
import { mantleSepolia } from "@/config/constants";

export const metadata: Metadata = {
    title: "Aureo - RWA Gold Trading with AI",
    description: "Tokenize and trade gold on Mantle Sepolia with AI-powered automation",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <PrivyProvider
                    appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
                    config={{
                        loginMethods: ["email", "google", "twitter"],
                        appearance: {
                            theme: "light",
                            accentColor: "#F59E0B",
                            logo: "https://your-logo-url.com/logo.png",
                        },
                        embeddedWallets: {
                            createOnLogin: "users-without-wallets",
                        },
                        defaultChain: mantleSepolia,
                        supportedChains: [mantleSepolia],
                    }}
                >
                    {children}
                </PrivyProvider>
            </body>
        </html>
    );
}
