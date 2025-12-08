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


## 🧩 Contract ABIs

<details>
<summary><b>AureoRWAPool ABI</b></summary>

```json
[
  {
    "type": "constructor",
    "inputs": [
      {
        "name": "_pyth",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_goldPriceId",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "_mGold",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_usdc",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "buyGold",
    "inputs": [
      {
        "name": "_usdcAmount",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "emergencyWithdraw",
    "inputs": [
      {
        "name": "_token",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getGoldPrice18Decimals",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "goldPriceId",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "mGold",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "contract IMockGold"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "owner",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "pyth",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "contract IPyth"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "renounceOwnership",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "sellGold",
    "inputs": [
      {
        "name": "_goldAmount",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "transferOwnership",
    "inputs": [
      {
        "name": "newOwner",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "usdc",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "contract IERC20"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "BuyGold",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "usdcSpent",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "goldReceived",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "priceUsed",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "OwnershipTransferred",
    "inputs": [
      {
        "name": "previousOwner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "newOwner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "SellGold",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "goldSold",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "usdcReceived",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "priceUsed",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "error",
    "name": "OwnableInvalidOwner",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "OwnableUnauthorizedAccount",
    "inputs": [
      {
        "name": "account",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "SafeERC20FailedOperation",
    "inputs": [
      {
        "name": "token",
        "type": "address",
        "internalType": "address"
      }
    ]
  }
]
```
</details>

<details>
<summary><b>MockUSDC ABI</b></summary>

```json
[
  {
    "type": "constructor",
    "inputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "allowance",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "spender",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "approve",
    "inputs": [
      {
        "name": "spender",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "value",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "balanceOf",
    "inputs": [
      {
        "name": "account",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "decimals",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint8",
        "internalType": "uint8"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "mint",
    "inputs": [
      {
        "name": "to",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "name",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "string",
        "internalType": "string"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "symbol",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "string",
        "internalType": "string"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "totalSupply",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "transfer",
    "inputs": [
      {
        "name": "to",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "value",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "transferFrom",
    "inputs": [
      {
        "name": "from",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "to",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "value",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "Approval",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "spender",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "value",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Transfer",
    "inputs": [
      {
        "name": "from",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "to",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "value",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "error",
    "name": "ERC20InsufficientAllowance",
    "inputs": [
      {
        "name": "spender",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "allowance",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "needed",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "error",
    "name": "ERC20InsufficientBalance",
    "inputs": [
      {
        "name": "sender",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "balance",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "needed",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "error",
    "name": "ERC20InvalidApprover",
    "inputs": [
      {
        "name": "approver",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "ERC20InvalidReceiver",
    "inputs": [
      {
        "name": "receiver",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "ERC20InvalidSender",
    "inputs": [
      {
        "name": "sender",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "ERC20InvalidSpender",
    "inputs": [
      {
        "name": "spender",
        "type": "address",
        "internalType": "address"
      }
    ]
  }
]
```
</details>

<details>
<summary><b>MockGold ABI</b></summary>

```json
[
  {
    "type": "constructor",
    "inputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "allowance",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "spender",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "approve",
    "inputs": [
      {
        "name": "spender",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "value",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "balanceOf",
    "inputs": [
      {
        "name": "account",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "burn",
    "inputs": [
      {
        "name": "from",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "decimals",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint8",
        "internalType": "uint8"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "mint",
    "inputs": [
      {
        "name": "to",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "name",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "string",
        "internalType": "string"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "symbol",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "string",
        "internalType": "string"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "totalSupply",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "transfer",
    "inputs": [
      {
        "name": "to",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "value",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "transferFrom",
    "inputs": [
      {
        "name": "from",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "to",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "value",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "Approval",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "spender",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "value",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Transfer",
    "inputs": [
      {
        "name": "from",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "to",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "value",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "error",
    "name": "ERC20InsufficientAllowance",
    "inputs": [
      {
        "name": "spender",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "allowance",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "needed",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "error",
    "name": "ERC20InsufficientBalance",
    "inputs": [
      {
        "name": "sender",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "balance",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "needed",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "error",
    "name": "ERC20InvalidApprover",
    "inputs": [
      {
        "name": "approver",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "ERC20InvalidReceiver",
    "inputs": [
      {
        "name": "receiver",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "ERC20InvalidSender",
    "inputs": [
      {
        "name": "sender",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "ERC20InvalidSpender",
    "inputs": [
      {
        "name": "spender",
        "type": "address",
        "internalType": "address"
      }
    ]
  }
]
```
</details>

