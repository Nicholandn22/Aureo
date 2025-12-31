// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// --- MOCK USDC (Standard ERC20 - 6 Desimal) ---
contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USD Coin", "mUSDC") {
        // Mint modal awal ke deployer (1 Juta USDC)
        _mint(msg.sender, 1000000 * 10**6); 
    }

    function decimals() public view virtual override returns (uint8) {
        return 6; // Mengikuti standar USDC asli
    }
    
    // Faucet: Siapapun bisa minta USDC gratis buat testing
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}

// --- MOCK GOLD (Token Tanpa Access Control) ---
contract MockGold is ERC20 {
    constructor() ERC20("Mantle Gold", "mGOLD") {}

    // Siapapun boleh cetak emas
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    // Burn tokens - Only from msg.sender OR with allowance
    // This prevents malicious burning of other users' tokens
    function burn(address from, uint256 amount) public {
        // If burning from someone else, check allowance
        if (from != msg.sender) {
            _spendAllowance(from, msg.sender, amount);
        }
        _burn(from, amount);
    }
    
    // Standard burn function for burning own tokens
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}