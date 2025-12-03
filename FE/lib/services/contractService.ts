import { ethers } from 'ethers';

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.sepolia.mantle.xyz';
const PRIVATE_KEY = process.env.CONTRACT_PRIVATE_KEY || '';
const AUREO_POOL_ADDRESS = process.env.NEXT_PUBLIC_AUREO_POOL_ADDRESS || '';

const AUREO_POOL_ABI = [
  'function executeSmartBuy(address user, uint256 idrxAmount) external returns (uint256 goldReceived)',
  'function getGoldBalance(address user) external view returns (uint256)',
  'function getIDRXPending(address user) external view returns (uint256)',
  'function withdrawToIDRX(uint256 goldAmount) external returns (uint256 idrxReceived)',
];

export async function executeSmartBuy(
  userAddress: string,
  idrxAmount: number
): Promise<{ goldReceived: number; txHash: string }> {
  if (!PRIVATE_KEY) {
    throw new Error('CONTRACT_PRIVATE_KEY not configured');
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const contract = new ethers.Contract(AUREO_POOL_ADDRESS, AUREO_POOL_ABI, wallet);

  try {
    const amountInWei = ethers.parseUnits(idrxAmount.toString(), 18);
    const tx = await contract.executeSmartBuy(userAddress, amountInWei);
    const receipt = await tx.wait();

    const goldReceivedWei = receipt.logs[0]?.data || '0';
    const goldReceived = Number(ethers.formatUnits(goldReceivedWei, 18));

    return {
      goldReceived,
      txHash: receipt.hash,
    };
  } catch (error) {
    console.error('Smart Buy Execution Error:', error);
    throw error;
  }
}

export async function getGoldBalance(userAddress: string): Promise<number> {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(AUREO_POOL_ADDRESS, AUREO_POOL_ABI, provider);

  try {
    const balance = await contract.getGoldBalance(userAddress);
    return Number(ethers.formatUnits(balance, 18));
  } catch (error) {
    console.error('Get Gold Balance Error:', error);
    return 0;
  }
}

export async function getIDRXPending(userAddress: string): Promise<number> {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(AUREO_POOL_ADDRESS, AUREO_POOL_ABI, provider);

  try {
    const pending = await contract.getIDRXPending(userAddress);
    return Number(ethers.formatUnits(pending, 18));
  } catch (error) {
    console.error('Get IDRX Pending Error:', error);
    return 0;
  }
}
