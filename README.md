# Aureo RWA Protocol (Gold)

Aureo is a **Real World Asset (RWA)** protocol built on the **Mantle Network**, designed to tokenize Gold assets. It allows users to mint and redeem synthetic Gold tokens (**mGOLD**) pegged to real-time gold prices using **Pyth Network Oracles**.

## 🌟 Features

- **Gold Tokenization**: Mint `mGOLD` tokens backed by USDC liquidity.
- **Real-Time Oracle**: Uses **Pyth Network** for accurate, high-frequency gold price feeds (XAU/USD).
- **Liquidity Pool**: Automated liquidity management for minting and redeeming RWA tokens.
- **Mantle Network Optimized**: Built to leverage the low fees and speed of the Mantle L2 ecosystem.

## 🏗 Architecture

The protocol consists of three main components:

1.  **AureoRWAPool**: The core contract managing liquidity, price fetching, and token minting/burning.
2.  **MockGold (mGOLD)**: An ERC20 token representing the tokenized gold. It has `MINTER_ROLE` controlled by the Pool.
3.  **MockUSDC**: A standard ERC20 stablecoin used as collateral/payment for minting gold.

## 🛠 Prerequisites

Ensure you have the following installed:

- [Foundry](https://book.getfoundry.sh/getting-started/installation) (Forge, Cast, Anvil)
- [Git](https://git-scm.com/)

## 🚀 Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/YOUR_USERNAME/aureo.git
    cd aureo
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

Create a `.env` file in the root directory based on the example below:

```ini
# Deployment Wallet
PRIVATE_KEY=0xYourPrivateKeyHere...

# Network RPCs
RPC_URL=https://rpc.sepolia.mantle.xyz
# RPC_URL_MAINNET=https://rpc.mantle.xyz

# Verification (Optional)
ETHERSCAN_API_KEY=YourExplorerApiKey...

# Deployed Addresses (For multi-stage deployment)
USDC_ADDRESS=0x...
GOLD_ADDRESS=0x...
```

## ⛓ Deployment (Mantle Sepolia Testnet)

Due to gas limits on testnets, deployment is best done in stages.

### Step 1: Deploy Mock USDC
```bash
source .env && forge script script/script/Deploy01_MockUSDC.s.sol:DeployMockUSDC \
--rpc-url $RPC_URL \
--broadcast \
--chain-id 5003 \
--legacy \
--verify \
--verifier blockscout \
--verifier-url https://explorer.sepolia.mantle.xyz/api
```
*Copy the deployed USDC address and save it to `USDC_ADDRESS` in `.env`.*

### Step 2: Deploy Mock Gold
```bash
source .env && forge script script/script/Deploy02_MockGold.s.sol:DeployMockGold \
--rpc-url $RPC_URL \
--broadcast \
--chain-id 5003 \
--legacy \
--verify \
--verifier blockscout \
--verifier-url https://explorer.sepolia.mantle.xyz/api
```
*Copy the deployed mGOLD address and save it to `GOLD_ADDRESS` in `.env`.*

### Step 3: Deploy Pool & Setup Permissions
```bash
source .env && forge script script/script/Deploy03_Pool.s.sol:DeployPool \
--rpc-url $RPC_URL \
--broadcast \
--chain-id 5003 \
--legacy \
--verify \
--verifier blockscout \
--verifier-url https://explorer.sepolia.mantle.xyz/api
```

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