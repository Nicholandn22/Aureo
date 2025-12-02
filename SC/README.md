# Aureo RWA Protocol (Gold)

Aureo is a **Real World Asset (RWA)** protocol built on the **Mantle Network**, designed to tokenize Gold assets. It allows users to mint and redeem synthetic Gold tokens (**mGOLD**) pegged to real-time gold prices using **Pyth Network Oracles**.

## 🌟 Features

- **Gold Tokenization**: Mint `mGOLD` tokens backed by USDC liquidity.
- **Real-Time Oracle**: Uses **Pyth Network** for accurate, high-frequency gold price feeds (XAU/USD).
- **Liquidity Pool**: Automated liquidity management for minting and redeeming RWA tokens.
- **Mantle Network Optimized**: Built to leverage the low fees and speed of the Mantle L2 ecosystem.

## 🔗 Deployed Contracts (Mantle Sepolia)

You can interact with the protocol on the **Mantle Sepolia Testnet**.

| Contract | Address | Symbol | Decimals |
| :--- | :--- | :--- | :--- |
| **AureoRWAPool** | `0x475F5c184D23D5839123e7CDB23273eF0470C018` | - | - |
| **MockUSDC** | `0x53b8e9e6513A2e7A4d23F8F9BFe3F5985C9788e4` | `mUSDC` | 6 |
| **MockGold** | `0x6830999D9173B235dF6ac8c9068c4235fd58f532` | `mGOLD` | 18 |

*Note: Due to inactive Pyth Gold Feed on testnet, the current deployment uses ETH/USD price feed for demonstration.*

## 🛒 CLI Interaction Guide (Manual Testing)

This guide allows you to manually interact with the Aureo Protocol using `foundry`'s `cast` tool.

### 1. Setup Environment
Set up your terminal with the necessary environment variables and contract addresses.

```bash
# 1. Load your .env file
# Ensure it contains: MANTLE_RPC_URL and PRIVATE_KEY
source .env

# 2. Set Contract Addresses as Variables (Shortcuts)
export USDC=0x53b8e9e6513A2e7A4d23F8F9BFe3F5985C9788e4
export GOLD=0x6830999D9173B235dF6ac8c9068c4235fd58f532
export POOL=0x475F5c184D23D5839123e7CDB23273eF0470C018

# 3. Set your Wallet Address (for checking balances)
export MY_WALLET=$(cast wallet address --private-key $PRIVATE_KEY)
```

### 2. Get Free Testnet USDC (Faucet)
Before buying Gold, you need USDC. The MockUSDC contract has a public `mint` function.

```bash
# Mint 1,000 USDC to your wallet
# USDC has 6 decimals: 1000 * 10^6 = 1000000000
cast send $USDC "mint(address,uint256)" $MY_WALLET 1000000000 \
  --rpc-url $MANTLE_RPC_URL \
  --private-key $PRIVATE_KEY
```

### 3. Buy Gold (mGOLD)
Buying Gold requires two steps: **Approve** and **Buy**.

**Step A: Approve Pool to spend your USDC**
We approve the pool to spend up to 1,000 USDC.
```bash
cast send $USDC "approve(address,uint256)" $POOL 1000000000 \
  --rpc-url $MANTLE_RPC_URL \
  --private-key $PRIVATE_KEY
```

**Step B: Execute Buy Transaction**
Buy Gold worth 10 USDC.
```bash
# Amount: 10 USDC = 10,000,000 (6 decimals)
cast send $POOL "buyGold(uint256)" 10000000 \
  --rpc-url $MANTLE_RPC_URL \
  --private-key $PRIVATE_KEY
```

### 4. Check Your Balance
Verify that you received the Gold.
```bash
# Check Gold Balance (18 Decimals)
cast call $GOLD "balanceOf(address)" $MY_WALLET --rpc-url $MANTLE_RPC_URL | cast --to-dec
```

### 5. Sell Gold (mGOLD)
Selling also requires two steps: **Approve** and **Sell**.

**Step A: Approve Pool to take your Gold**
Approve the pool to take 0.01 Gold.
```bash
# Amount: 0.01 Gold = 10,000,000,000,000,000 (18 decimals)
cast send $GOLD "approve(address,uint256)" $POOL 10000000000000000 \
  --rpc-url $MANTLE_RPC_URL \
  --private-key $PRIVATE_KEY
```

**Step B: Execute Sell Transaction**
Sell 0.01 Gold back for USDC.
```bash
cast send $POOL "sellGold(uint256)" 10000000000000000 \
  --rpc-url $MANTLE_RPC_URL \
  --private-key $PRIVATE_KEY
```

### 6. Check Price
See the current Oracle price used by the pool.
```bash
# Returns price with 18 decimals
cast call $POOL "getGoldPrice18Decimals()" --rpc-url $MANTLE_RPC_URL | cast --to-dec
```

## 🏗 Architecture

The protocol consists of three main components:

1.  **AureoRWAPool**: The core contract managing liquidity, price fetching, and token minting/burning.
2.  **MockGold (mGOLD)**: An ERC20 token representing the tokenized gold.
3.  **MockUSDC**: A standard ERC20 stablecoin used as collateral/payment for minting gold.

## 📜 Smart Contract Reference

### 1. AureoRWAPool.sol
The main interaction point for users.

*   **`buyGold(uint256 _usdcAmount)`**
    *   **Description:** Allows users to purchase synthetic gold (`mGOLD`) using `USDC`.
    *   **Logic:** Transfers USDC from the user to the Pool, calculates the gold amount based on the real-time XAU/USD price from Pyth, and mints `mGOLD` to the user.
    *   **Requirement:** User must approve the Pool to spend their USDC first.

*   **`sellGold(uint256 _goldAmount)`**
    *   **Description:** Allows users to redeem their `mGOLD` back for `USDC`.
    *   **Logic:** Transfers `mGOLD` from the user to the Pool, burns it, calculates the USDC value based on current oracle prices, and transfers USDC from the Pool's liquidity to the user.
    *   **Requirement:** Pool must have sufficient USDC liquidity.

*   **`getGoldPrice18Decimals()`**
    *   **Description:** A view function that fetches the latest Gold price from the Pyth Network Oracle.
    *   **Logic:** Normalizes the price exponent to standard 18 decimals for precision in calculations. Ensures price data is no older than 60 seconds.

### 2. MockTokens.sol

*   **`MockUSDC`**
    *   **Type:** Standard ERC20 (6 Decimals).
    *   **Function `mint(address to, uint256 amount)`:** Public faucet function. Allows anyone to mint free testnet USDC for testing the protocol.

*   **`MockGold`**
    *   **Type:** ERC20 (18 Decimals).

## 🛠 Prerequisites

Ensure you have the following installed:

- [Foundry](https://book.getfoundry.sh/getting-started/installation) (Forge, Cast, Anvil)
- [Git](https://git-scm.com/)

## 🚀 Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Nicholandn22/Aureo.git
    cd Aureo/SC
    ```

2.  **Install dependencies:**
    ```bash
    forge install
    ```

3.  **Build the project:**
    ```bash
    forge build
    ```

## ⚙️ Configuration

Create a `.env` file in the `SC` directory based on the example below:

```ini
# Deployment Wallet
PRIVATE_KEY=0xYourPrivateKeyHere...

# Network RPCs
MANTLE_RPC_URL=https://rpc.sepolia.mantle.xyz

# Verification (Optional)
MANTLESCAN_API_KEY=YourExplorerApiKey...
```

## ⛓ Deployment (Mantle Sepolia Testnet)

Deploy the entire protocol (USDC, Gold, and Pool) using the provided script.

```bash
source .env && forge script script/script/DeployAureo.s.sol:DeployAureo \
--rpc-url $MANTLE_RPC_URL \
--broadcast \
--chain-id 5003 \
--legacy \
--verify \
--verifier blockscout \
--verifier-url https://explorer.sepolia.mantle.xyz/api
```

*Note: The script automatically provides initial liquidity to the pool.*

## 🧪 Testing

Run the test suite to verify protocol logic:

```bash
forge test
```

Run with verbosity for debugging:

```bash
forge test -vvvv
```

## 📜 License

This project is licensed under the **MIT License**.
