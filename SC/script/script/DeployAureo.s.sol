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
        address pythAddress = 0x98046Bd286715D3B0BC227Dd7a956b83D8978603;
        // ID ETH/USD (Substitute for Gold as XAU feed is inactive)
        bytes32 goldId = 0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace;

        // 3. DEPLOY POOL
        AureoRWAPool pool = new AureoRWAPool(
            pythAddress,
            goldId,
            address(gold),
            address(usdc)
        );
        console.log("Aureo Pool Deployed at:", address(pool));

        // 4. SETUP PERMISSIONS
        // MockGold is now open, no roles needed.
        
        // 5. ADD LIQUIDITY (CRITICAL!)
        // Kirim 100,000 USDC dari wallet deployer ke Pool
        // Supaya kalau ada user Jual Emas, Pool punya uang buat bayar
        uint256 liquidityAmount = 100000 * 10**6; // 100k USDC
        usdc.transfer(address(pool), liquidityAmount);
        console.log("Liquidity 100k USDC added to Pool");

        vm.stopBroadcast();
    }
}