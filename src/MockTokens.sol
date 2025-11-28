// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

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

// --- MOCK GOLD (Token dengan Access Control) ---
contract MockGold is ERC20, AccessControl {
    // Role khusus untuk mesin pencetak (Smart Contract Pool)
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor() ERC20("Mantle Gold", "mGOLD") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        // Role MINTER akan diberikan ke Pool via script deployment
    }

    // Hanya address dengan MINTER_ROLE yang boleh cetak emas
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    // Hanya address dengan MINTER_ROLE yang boleh bakar emas
    function burn(address from, uint256 amount) public onlyRole(MINTER_ROLE) {
        _burn(from, amount);
    }
}