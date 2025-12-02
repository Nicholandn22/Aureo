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
| **AureoRWAPool** | `0x7D62184c94F46048014C89652690732d5bac5B3F` | - | - |
| **MockUSDC** | `0x20f58AE33a676969B29721E09c7B8fD67B2EB212` | `mUSDC` | 6 |
| **MockGold** | `0xE4D1eE878Ea7821777A648633565de9cD7633C34` | `mGOLD` | 18 |

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
RPC_URL=https://rpc.sepolia.mantle.xyz

# Verification (Optional)
MANTLESCAN_API_KEY=YourExplorerApiKey...
```

## ⛓ Deployment (Mantle Sepolia Testnet)

Deploy the entire protocol (USDC, Gold, and Pool) using the provided script.

```bash
source .env && forge script script/script/DeployAureo.s.sol:DeployAureo \
--rpc-url $RPC_URL \
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
