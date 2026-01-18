import { ethers } from "ethers";

const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.sepolia.mantle.xyz";

// ============================================
// HARDCODED CORRECT ADDRESSES (from README)
// These will be used regardless of .env to avoid confusion
// ============================================
const AUREO_POOL_ADDRESS = "0x6D7be4B3d23C55d8A0829114b99DAEb4915a2A17";
const M_USDC_ADDRESS = "0x727cc1FdcC8FB1Bf396FCEaE40e3Ba8c90F81F45"; // MockUSDC - 6 decimals
const M_GOLD_ADDRESS = "0x012aDFBCC46187Ef30dc25130F969B94E0c9a2e5"; // MockGold - 18 decimals

// Log addresses on load for debugging
console.log("📍 Contract Addresses:", {
  AUREO_POOL: AUREO_POOL_ADDRESS,
  M_USDC: M_USDC_ADDRESS,
  M_GOLD: M_GOLD_ADDRESS,
});

const AUREO_POOL_ABI = [
  {
    inputs: [
      { internalType: "address", name: "_pyth", type: "address" },
      { internalType: "bytes32", name: "_goldPriceId", type: "bytes32" },
      { internalType: "address", name: "_mGold", type: "address" },
      { internalType: "address", name: "_usdc", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "token", type: "address" }],
    name: "SafeERC20FailedOperation",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "usdcSpent",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "goldReceived",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "priceUsed",
        type: "uint256",
      },
    ],
    name: "BuyGold",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "goldSold",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "usdcReceived",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "priceUsed",
        type: "uint256",
      },
    ],
    name: "SellGold",
    type: "event",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_usdcAmount", type: "uint256" },
      { internalType: "uint256", name: "_minGoldOut", type: "uint256" },
    ],
    name: "buyGold",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_token", type: "address" }],
    name: "emergencyWithdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getGoldPrice18Decimals",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "goldPriceId",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "mGold",
    outputs: [
      { internalType: "contract IMockGold", name: "", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pyth",
    outputs: [{ internalType: "contract IPyth", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_goldAmount", type: "uint256" },
      { internalType: "uint256", name: "_minUsdcOut", type: "uint256" },
    ],
    name: "sellGold",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "usdc",
    outputs: [{ internalType: "contract IERC20", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
];
const M_GOLD_ABI = [
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "allowance", type: "uint256" },
      { internalType: "uint256", name: "needed", type: "uint256" },
    ],
    name: "ERC20InsufficientAllowance",
    type: "error",
  },
  {
    inputs: [
      { internalType: "address", name: "sender", type: "address" },
      { internalType: "uint256", name: "balance", type: "uint256" },
      { internalType: "uint256", name: "needed", type: "uint256" },
    ],
    name: "ERC20InsufficientBalance",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "approver", type: "address" }],
    name: "ERC20InvalidApprover",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "receiver", type: "address" }],
    name: "ERC20InvalidReceiver",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "sender", type: "address" }],
    name: "ERC20InvalidSender",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "spender", type: "address" }],
    name: "ERC20InvalidSpender",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "from", type: "address" },
      { indexed: true, internalType: "address", name: "to", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "from", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "burn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "from", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
];
const M_USDC_ABI = [
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "allowance", type: "uint256" },
      { internalType: "uint256", name: "needed", type: "uint256" },
    ],
    name: "ERC20InsufficientAllowance",
    type: "error",
  },
  {
    inputs: [
      { internalType: "address", name: "sender", type: "address" },
      { internalType: "uint256", name: "balance", type: "uint256" },
      { internalType: "uint256", name: "needed", type: "uint256" },
    ],
    name: "ERC20InsufficientBalance",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "approver", type: "address" }],
    name: "ERC20InvalidApprover",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "receiver", type: "address" }],
    name: "ERC20InvalidReceiver",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "sender", type: "address" }],
    name: "ERC20InvalidSender",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "spender", type: "address" }],
    name: "ERC20InvalidSpender",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "from", type: "address" },
      { indexed: true, internalType: "address", name: "to", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "from", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
];

// ============================================
// Contract Service for Aureo Gold Pool
// ============================================
// Supported Functions from ABI:
// - buyGold(uint256 _usdcAmount): Buy mGold with USDC
// - sellGold(uint256 _goldAmount): Sell mGold for USDC
// - getGoldPrice18Decimals(): Get current gold price
// ============================================

// Pyth Hermes API for XAU/USD price feed
const PYTH_HERMES_API =
  "https://hermes.pyth.network/api/latest_price_feeds?ids[]=0x765d2ba906dbc32ca17cc11f5310a89e9ee1f6420508c63861f2f8ba4ee34bb2";

// Fallback price when Pyth API is unavailable
const FALLBACK_GOLD_PRICE = 2650; // USD per ounce (for demo)

/**
 * Get the current gold price from Pyth Hermes API
 * Uses the Hermes API directly since on-chain oracle is often stale on testnet
 * @returns Gold price in USD per ounce
 */
export async function getGoldPrice(): Promise<number> {
  try {
    const response = await fetch(PYTH_HERMES_API);
    if (!response.ok) {
      throw new Error(`Pyth API error: ${response.status}`);
    }

    const data = await response.json();
    const priceData = data[0]?.price;

    if (!priceData) {
      throw new Error("No price data available from Pyth");
    }

    // Convert price from Pyth format (price * 10^expo)
    const price = Number(priceData.price) * Math.pow(10, priceData.expo);
    console.log("✅ Pyth Gold Price (XAU/USD):", price.toFixed(2));
    return price;
  } catch (error) {
    console.warn(
      "Pyth API unavailable, using fallback price:",
      FALLBACK_GOLD_PRICE,
      error,
    );
    return FALLBACK_GOLD_PRICE;
  }
}

/**
 * Get mGold token balance for a user
 * @param userAddress The wallet address to check balance for
 * @returns mGold balance in human readable format
 */
export async function getGoldBalance(userAddress: string): Promise<number> {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const mGoldContract = new ethers.Contract(
    M_GOLD_ADDRESS,
    M_GOLD_ABI,
    provider,
  );

  try {
    const balance = await mGoldContract.balanceOf(userAddress);
    return Number(ethers.formatUnits(balance, 18));
  } catch (error) {
    console.error("Get Gold Balance Error:", error);
    return 0;
  }
}

/**
 * Get USDC balance for a user
 * @param userAddress The wallet address to check balance for
 * @returns USDC balance in human readable format (6 decimals)
 */
export async function getUSDCBalance(userAddress: string): Promise<number> {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const usdcContract = new ethers.Contract(
    M_USDC_ADDRESS,
    M_USDC_ABI,
    provider,
  );

  try {
    const balance = await usdcContract.balanceOf(userAddress);
    // Note: USDC typically has 6 decimals, but MockUSDC might use 18
    const decimals = await usdcContract.decimals();
    return Number(ethers.formatUnits(balance, decimals));
  } catch (error) {
    console.error("Get USDC Balance Error:", error);
    return 0;
  }
}

/**
 * Buy mGold tokens with USDC
 * This function should be called from the frontend with a connected wallet (signer)
 * @param signer The ethers signer from the connected wallet
 * @param usdcAmount Amount of USDC to spend
 * @param slippagePercent Slippage tolerance percentage (default 5%)
 * @returns Transaction result with gold received and transaction hash
 */
export async function buyGold(
  signer: ethers.Signer,
  usdcAmount: number,
  _slippagePercent: number = 5,
): Promise<{ txHash: string }> {
  const aureoContract = new ethers.Contract(
    AUREO_POOL_ADDRESS,
    AUREO_POOL_ABI,
    signer,
  );
  const usdcContract = new ethers.Contract(M_USDC_ADDRESS, M_USDC_ABI, signer);

  try {
    // Get USDC decimals
    const decimals = await usdcContract.decimals();
    const amountInWei = ethers.parseUnits(usdcAmount.toString(), decimals);

    // First, approve the Aureo Pool to spend USDC
    const approveTx = await usdcContract.approve(
      AUREO_POOL_ADDRESS,
      amountInWei,
    );
    await approveTx.wait();

    // Calculate minGoldOut with slippage protection
    // For demo purposes, we use 0 (accept any amount)
    // In production: fetch price, calculate expected gold, apply slippage
    const minGoldOut = BigInt(0);

    // Then execute the buyGold function with slippage protection
    const tx = await aureoContract.buyGold(amountInWei, minGoldOut);
    const receipt = await tx.wait();

    return {
      txHash: receipt.hash,
    };
  } catch (error) {
    console.error("Buy Gold Error:", error);
    throw error;
  }
}

/**
 * Sell mGold tokens for USDC
 * This function should be called from the frontend with a connected wallet (signer)
 * @param signer The ethers signer from the connected wallet
 * @param goldAmount Amount of mGold to sell
 * @param slippagePercent Slippage tolerance percentage (default 5%)
 * @returns Transaction result with transaction hash
 */
export async function sellGold(
  signer: ethers.Signer,
  goldAmount: number,
  _slippagePercent: number = 5,
): Promise<{ txHash: string }> {
  const aureoContract = new ethers.Contract(
    AUREO_POOL_ADDRESS,
    AUREO_POOL_ABI,
    signer,
  );
  const mGoldContract = new ethers.Contract(M_GOLD_ADDRESS, M_GOLD_ABI, signer);

  try {
    const amountInWei = ethers.parseUnits(goldAmount.toString(), 18);

    // First, approve the Aureo Pool to spend mGold
    const approveTx = await mGoldContract.approve(
      AUREO_POOL_ADDRESS,
      amountInWei,
    );
    await approveTx.wait();

    // Calculate minUsdcOut with slippage protection
    // For demo purposes, we use 0 (accept any amount)
    // In production: fetch price, calculate expected USDC, apply slippage
    const minUsdcOut = BigInt(0);

    // Then execute the sellGold function with slippage protection
    const tx = await aureoContract.sellGold(amountInWei, minUsdcOut);
    const receipt = await tx.wait();

    return {
      txHash: receipt.hash,
    };
  } catch (error) {
    console.error("Sell Gold Error:", error);
    throw error;
  }
}

/**
 * Check USDC allowance for the Aureo Pool contract
 * @param userAddress The wallet address to check
 * @returns Current allowance amount
 */
export async function getUSDCAllowance(userAddress: string): Promise<number> {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const usdcContract = new ethers.Contract(
    M_USDC_ADDRESS,
    M_USDC_ABI,
    provider,
  );

  try {
    const allowance = await usdcContract.allowance(
      userAddress,
      AUREO_POOL_ADDRESS,
    );
    const decimals = await usdcContract.decimals();
    return Number(ethers.formatUnits(allowance, decimals));
  } catch (error) {
    console.error("Get USDC Allowance Error:", error);
    return 0;
  }
}

/**
 * Check mGold allowance for the Aureo Pool contract
 * @param userAddress The wallet address to check
 * @returns Current allowance amount
 */
export async function getGoldAllowance(userAddress: string): Promise<number> {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const mGoldContract = new ethers.Contract(
    M_GOLD_ADDRESS,
    M_GOLD_ABI,
    provider,
  );

  try {
    const allowance = await mGoldContract.allowance(
      userAddress,
      AUREO_POOL_ADDRESS,
    );
    return Number(ethers.formatUnits(allowance, 18));
  } catch (error) {
    console.error("Get Gold Allowance Error:", error);
    return 0;
  }
}

/**
 * Get all user balances in one call (optimized for server-side use)
 * Used by the AI agent cron job
 * @param userAddress The wallet address to check
 * @returns Object containing gold, usdc, and goldPrice
 */
export async function getUserBalances(userAddress: string): Promise<{
  gold: number;
  usdc: number;
  goldPrice: number;
}> {
  const provider = new ethers.JsonRpcProvider(RPC_URL);

  const mGoldContract = new ethers.Contract(
    M_GOLD_ADDRESS,
    M_GOLD_ABI,
    provider,
  );
  const usdcContract = new ethers.Contract(
    M_USDC_ADDRESS,
    M_USDC_ABI,
    provider,
  );

  try {
    const [goldBalanceRaw, usdcBalanceRaw, usdcDecimals, goldPrice] =
      await Promise.all([
        mGoldContract.balanceOf(userAddress),
        usdcContract.balanceOf(userAddress),
        usdcContract.decimals(),
        getGoldPrice(), // Use Pyth Hermes API instead of on-chain oracle
      ]);

    const gold = Number(ethers.formatUnits(goldBalanceRaw, 18));
    const usdc = Number(ethers.formatUnits(usdcBalanceRaw, usdcDecimals));

    return { gold, usdc, goldPrice };
  } catch (error) {
    console.error("Get User Balances Error:", error);
    return { gold: 0, usdc: 0, goldPrice: FALLBACK_GOLD_PRICE };
  }
}

// Export contract addresses for external use
export const CONTRACT_ADDRESSES = {
  AUREO_POOL: AUREO_POOL_ADDRESS,
  M_GOLD: M_GOLD_ADDRESS,
  M_USDC: M_USDC_ADDRESS,
};

// Export ABIs for external use (e.g., for wagmi/viem integration)
export const CONTRACT_ABIS = {
  AUREO_POOL: AUREO_POOL_ABI,
  M_GOLD: M_GOLD_ABI,
  M_USDC: M_USDC_ABI,
};
