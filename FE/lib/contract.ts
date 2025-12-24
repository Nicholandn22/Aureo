import { ethers, Eip1193Provider } from 'ethers';

const AUREO_POOL_ADDRESS = process.env.NEXT_PUBLIC_AUREO_POOL_ADDRESS || '';
const IDRX_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_IDRX_TOKEN_ADDRESS || '';
const GOLD_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_GOLD_TOKEN_ADDRESS || '';

const AUREO_POOL_ABI = [
  'function depositIDRX(uint256 amount) external',
  'function withdrawToIDRX(uint256 goldAmount) external',
  'function getGoldBalance(address user) external view returns (uint256)',
  'function getIDRXPending(address user) external view returns (uint256)',
  'function executeSmartBuy(address user, uint256 idrxAmount) external',
  'event Deposit(address indexed user, uint256 idrxAmount)',
  'event Withdraw(address indexed user, uint256 goldAmount, uint256 idrxReceived)',
  'event SmartBuy(address indexed user, uint256 idrxSpent, uint256 goldReceived)',
];

const ERC20_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
  'function decimals() external view returns (uint8)',
];

export class ContractService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;

  async initialize(provider: Eip1193Provider) {
    this.provider = new ethers.BrowserProvider(provider);
    this.signer = await this.provider.getSigner();
  }

  async getIDRXContract() {
    if (!this.signer) throw new Error('Wallet not connected');
    return new ethers.Contract(IDRX_TOKEN_ADDRESS, ERC20_ABI, this.signer);
  }

  async getGoldContract() {
    if (!this.signer) throw new Error('Wallet not connected');
    return new ethers.Contract(GOLD_TOKEN_ADDRESS, ERC20_ABI, this.signer);
  }

  async getAureoPoolContract() {
    if (!this.signer) throw new Error('Wallet not connected');
    return new ethers.Contract(AUREO_POOL_ADDRESS, AUREO_POOL_ABI, this.signer);
  }

  async approveIDRX(amount: string) {
    const idrxContract = await this.getIDRXContract();
    const decimals = await idrxContract.decimals();
    const amountInWei = ethers.parseUnits(amount, decimals);

    const tx = await idrxContract.approve(AUREO_POOL_ADDRESS, amountInWei);
    await tx.wait();
    return tx.hash;
  }

  async depositIDRX(amount: string) {
    const aureoPool = await this.getAureoPoolContract();
    const idrxContract = await this.getIDRXContract();
    const decimals = await idrxContract.decimals();
    const amountInWei = ethers.parseUnits(amount, decimals);

    const allowance = await idrxContract.allowance(
      await this.signer!.getAddress(),
      AUREO_POOL_ADDRESS
    );

    if (allowance < amountInWei) {
      await this.approveIDRX(amount);
    }

    const tx = await aureoPool.depositIDRX(amountInWei);
    await tx.wait();
    return tx.hash;
  }

  async withdrawToIDRX(goldAmount: string) {
    const aureoPool = await this.getAureoPoolContract();
    const goldContract = await this.getGoldContract();
    const decimals = await goldContract.decimals();
    const amountInWei = ethers.parseUnits(goldAmount, decimals);

    const tx = await aureoPool.withdrawToIDRX(amountInWei);
    await tx.wait();
    return tx.hash;
  }

  async getGoldBalance(address: string): Promise<string> {
    const aureoPool = await this.getAureoPoolContract();
    const balance = await aureoPool.getGoldBalance(address);
    const goldContract = await this.getGoldContract();
    const decimals = await goldContract.decimals();
    return ethers.formatUnits(balance, decimals);
  }

  async getIDRXPending(address: string): Promise<string> {
    const aureoPool = await this.getAureoPoolContract();
    const pending = await aureoPool.getIDRXPending(address);
    const idrxContract = await this.getIDRXContract();
    const decimals = await idrxContract.decimals();
    return ethers.formatUnits(pending, decimals);
  }

  async getIDRXBalance(address: string): Promise<string> {
    const idrxContract = await this.getIDRXContract();
    const balance = await idrxContract.balanceOf(address);
    const decimals = await idrxContract.decimals();
    return ethers.formatUnits(balance, decimals);
  }
}

export const contractService = new ContractService();
