// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
// import "../../src/MockTokens.sol";
// import "../../src/MockGold.sol";
import "../../src/AureoRWAPool.sol";
import "../../src/MockTokens.sol";
// import "../src/MockTokens.sol";
// import "../src/AureoRWAPool.sol";

contract DeployAureo is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployerAddress = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        // 1. DEPLOY TOKENS
        MockUSDC usdc = new MockUSDC();
        MockGold gold = new MockGold();

        console.log("USDC Deployed at:", address(usdc));
        console.log("mGOLD Deployed at:", address(gold));

        // 2. CONFIG PYTH (Mantle Sepolia)
        address pythAddress = 0xA2aa501b19aff244D90cc15a4Cf739D2725B5729;
        // ID XAU/USD (Standard Testnet ID)
        bytes32 goldId = 0x765d2ba906dbc32ca17cc11f5310a89e9ee7f6496373a5527cf664719e700975;

        // 3. DEPLOY POOL
        AureoRWAPool pool = new AureoRWAPool(
            pythAddress,
            goldId,
            address(gold),
            address(usdc)
        );
        console.log("Aureo Pool Deployed at:", address(pool));

        // 4. SETUP PERMISSIONS (CRITICAL!)
        // Berikan izin "MINTER_ROLE" ke address Pool supaya Pool bisa cetak emas
        gold.grantRole(gold.MINTER_ROLE(), address(pool));
        console.log("Role MINTER granted to Pool");

        // 5. ADD LIQUIDITY (CRITICAL!)
        // Kirim 100,000 USDC dari wallet deployer ke Pool
        // Supaya kalau ada user Jual Emas, Pool punya uang buat bayar
        uint256 liquidityAmount = 100000 * 10**6; // 100k USDC
        usdc.transfer(address(pool), liquidityAmount);
        console.log("Liquidity 100k USDC added to Pool");

        vm.stopBroadcast();
    }
}