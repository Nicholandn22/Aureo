// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@pyth-network/pyth-sdk-solidity/IPyth.sol";
import "@pyth-network/pyth-sdk-solidity/PythStructs.sol";

// Interface agar Pool bisa panggil fungsi mint/burn di mGOLD
interface IMockGold is IERC20 {
    function mint(address to, uint256 amount) external;
    function burn(address from, uint256 amount) external;
}

contract AureoRWAPool is Ownable {
    using SafeERC20 for IERC20;

    // --- VARIABEL STATE ---
    IPyth public pyth;
    bytes32 public goldPriceId; // ID Unik Harga XAU/USD
    
    IMockGold public mGold;     // Token Emas (Output)
    IERC20 public usdc;         // Token Bayar (Input)

    // --- EVENTS (Agar Frontend Ndus bisa update UI) ---
    event BuyGold(address indexed user, uint256 usdcSpent, uint256 goldReceived, uint256 priceUsed);
    event SellGold(address indexed user, uint256 goldSold, uint256 usdcReceived, uint256 priceUsed);

    constructor(
        address _pyth,
        bytes32 _goldPriceId,
        address _mGold,
        address _usdc
    ) Ownable(msg.sender) {
        pyth = IPyth(_pyth);
        goldPriceId = _goldPriceId;
        mGold = IMockGold(_mGold);
        usdc = IERC20(_usdc);
    }

    // --- HELPER: Normalize Pyth Price to 18 Decimals ---
    function getGoldPrice18Decimals() public view returns (uint256) {
        // Ambil harga dengan validasi staleness (max 60 detik)
        PythStructs.Price memory price = pyth.getPriceNoOlderThan(goldPriceId, 60);
        require(price.price > 0, "Invalid Oracle Price");

        int256 priceVal = int256(price.price);
        int256 expo = int256(price.expo);
        
        // Target decimals = 18
        // We want result = price * 10^expo * 10^18 = price * 10^(expo + 18)
        
        int256 requiredDecimals = 18 + expo;

        if (requiredDecimals >= 0) {
            return uint256(priceVal) * (10 ** uint256(requiredDecimals));
        } else {
            return uint256(priceVal) / (10 ** uint256(-requiredDecimals));
        }
    }

    // --- FITUR 1: BELI EMAS (USDC -> mGOLD) ---
    function buyGold(uint256 _usdcAmount, uint256 _minGoldOut) external {
        require(_usdcAmount > 0, "Amount 0");

        // 1. Tarik USDC User (Pastikan user sudah Approve)
        usdc.safeTransferFrom(msg.sender, address(this), _usdcAmount);

        // 2. Ambil Harga
        uint256 currentPrice = getGoldPrice18Decimals();

        // 3. Hitung Konversi (USDC 6 dec -> Gold 18 dec)
        // Rumus: (USDC * 1e12 * 1e18) / Price
        uint256 usdcValue18 = _usdcAmount * 1e12; 
        uint256 goldAmount = (usdcValue18 * 1e18) / currentPrice;
        
        // 4. Slippage Protection
        require(goldAmount >= _minGoldOut, "Slippage too high");

        // 5. Cetak Emas ke User
        mGold.mint(msg.sender, goldAmount);

        emit BuyGold(msg.sender, _usdcAmount, goldAmount, currentPrice);
    }

    // --- FITUR 2: JUAL EMAS (mGOLD -> USDC) ---
    function sellGold(uint256 _goldAmount, uint256 _minUsdcOut) external {
        require(_goldAmount > 0, "Amount 0");
        require(mGold.balanceOf(msg.sender) >= _goldAmount, "Saldo Emas Kurang");

        // 1. Tarik & Bakar Emas User
        mGold.transferFrom(msg.sender, address(this), _goldAmount);
        mGold.burn(address(this), _goldAmount);

        // 2. Ambil Harga
        uint256 currentPrice = getGoldPrice18Decimals();

        // 3. Hitung Konversi (Gold 18 dec -> USDC 6 dec)
        // Rumus: (Gold * Price) / 1e18 -> Hasilnya 18 dec -> Bagi 1e12 jadi 6 dec
        uint256 usdValue18 = (_goldAmount * currentPrice) / 1e18;
        uint256 usdcAmount = usdValue18 / 1e12;
        
        // 4. Slippage Protection
        require(usdcAmount >= _minUsdcOut, "Slippage too high");

        // 5. Cek Likuiditas Pool & Transfer
        require(usdc.balanceOf(address(this)) >= usdcAmount, "Pool Kurang USDC");
        usdc.safeTransfer(msg.sender, usdcAmount);

        emit SellGold(msg.sender, _goldAmount, usdcAmount, currentPrice);
    }

    // --- ADMIN: Emergency Withdraw ---
    function emergencyWithdraw(address _token) external onlyOwner {
        IERC20 token = IERC20(_token);
        token.safeTransfer(msg.sender, token.balanceOf(address(this)));
    }
}
